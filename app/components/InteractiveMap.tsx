'use client';

import { User } from '@/app/data/mockData';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from './ThemeProvider';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface InteractiveMapProps {
  users: User[];
}

interface RegionData {
  name: string;
  lat: number;
  lng: number;
  contentCount: number;
  conversationCount: number;
  churchCount: number;
}

export default function InteractiveMap({ users }: InteractiveMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Real world coordinates for major regions
  const regions: RegionData[] = [
    { name: 'North America', lat: 40.7128, lng: -74.0060, contentCount: 0, conversationCount: 0, churchCount: 0 }, // New York
    { name: 'South America', lat: -23.5505, lng: -46.6333, contentCount: 0, conversationCount: 0, churchCount: 0 }, // São Paulo
    { name: 'Europe', lat: 51.5074, lng: -0.1278, contentCount: 0, conversationCount: 0, churchCount: 0 }, // London
    { name: 'Africa', lat: -1.2921, lng: 36.8219, contentCount: 0, conversationCount: 0, churchCount: 0 }, // Nairobi
    { name: 'Asia', lat: 35.6762, lng: 139.6503, contentCount: 0, conversationCount: 0, churchCount: 0 }, // Tokyo
    { name: 'Australia', lat: -33.8688, lng: 151.2093, contentCount: 0, conversationCount: 0, churchCount: 0 }, // Sydney
  ];

  // Distribute users across regions
  users.forEach((user, idx) => {
    const regionIdx = idx % regions.length;
    const region = regions[regionIdx];
    
    if (user.phase === 'evangelism') {
      region.contentCount++;
    } else if (user.phase === 'discipleship') {
      region.conversationCount++;
    } else if (user.phase === 'leadership' || user.goal === 'church') {
      region.churchCount++;
    }
  });

  const getMaxCount = () => {
    return Math.max(...regions.map(r => r.contentCount + r.conversationCount + r.churchCount), 1);
  };

  const maxCount = getMaxCount();

  // Dark theme tile layer URL (CartoDB Dark Matter)
  const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const lightTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  
  const tileUrl = theme === 'dark' ? darkTileUrl : lightTileUrl;
  const attribution = theme === 'dark' 
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  if (!isMounted) {
    return (
      <div className="bg-[#1a1f2e] light:bg-white rounded-xl shadow-lg p-6 border border-[#2d3548] light:border-gray-200 transition-colors duration-300 mb-6">
        <h3 className="text-xl font-bold text-gray-100 light:text-gray-900 mb-4">Geographic Distribution</h3>
        <div className="w-full h-[500px] bg-[#0f1419] light:bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1f2e] light:bg-white rounded-xl shadow-lg p-6 border border-[#2d3548] light:border-gray-200 transition-colors duration-300 mb-6">
      <h3 className="text-xl font-bold text-gray-100 light:text-gray-900 mb-4">Geographic Distribution</h3>
      
      {/* Legend */}
      <div className="flex gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500/30 border-2 border-red-500"></div>
          <span className="text-gray-300 light:text-gray-700">Content Phase</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500/30 border-2 border-yellow-500"></div>
          <span className="text-gray-300 light:text-gray-700">Conversation Phase</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500/30 border-2 border-green-500"></div>
          <span className="text-gray-300 light:text-gray-700">Church/Goal Phase</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-[500px] rounded-lg overflow-hidden relative z-0">
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          key={theme} // Force re-render when theme changes
        >
          <TileLayer
            attribution={attribution}
            url={tileUrl}
          />
          
          {regions.map((region, idx) => {
            const totalCount = region.contentCount + region.conversationCount + region.churchCount;
            if (totalCount === 0) return null;

            const baseRadius = 10 + (totalCount / maxCount) * 40;

            return (
              <div key={idx}>
                {/* Content Ring (Red) - Outermost */}
                {region.contentCount > 0 && (
                  <CircleMarker
                    center={[region.lat, region.lng]}
                    radius={baseRadius * (region.contentCount / totalCount) * 1.5}
                    pathOptions={{
                      color: '#ef4444',
                      fillColor: '#ef4444',
                      fillOpacity: 0.2,
                      weight: 2,
                    }}
                    className="animate-pulse"
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{region.name}</strong><br />
                        Content: {region.contentCount}
                      </div>
                    </Popup>
                  </CircleMarker>
                )}

                {/* Conversation Ring (Yellow) - Middle */}
                {region.conversationCount > 0 && (
                  <CircleMarker
                    center={[region.lat, region.lng]}
                    radius={baseRadius * (region.conversationCount / totalCount)}
                    pathOptions={{
                      color: '#eab308',
                      fillColor: '#eab308',
                      fillOpacity: 0.3,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{region.name}</strong><br />
                        Conversation: {region.conversationCount}
                      </div>
                    </Popup>
                  </CircleMarker>
                )}

                {/* Church Ring (Green) - Innermost */}
                {region.churchCount > 0 && (
                  <CircleMarker
                    center={[region.lat, region.lng]}
                    radius={baseRadius * (region.churchCount / totalCount) * 0.7}
                    pathOptions={{
                      color: '#22c55e',
                      fillColor: '#22c55e',
                      fillOpacity: 0.4,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{region.name}</strong><br />
                        Church/Goal: {region.churchCount}<br />
                        <hr className="my-1" />
                        Total: {totalCount} users
                      </div>
                    </Popup>
                  </CircleMarker>
                )}
              </div>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
