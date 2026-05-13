import { NextResponse } from 'next/server';
import { mockUsers } from '@/app/data/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const brand = searchParams.get('brand');
  const language = searchParams.get('language');
  const phase = searchParams.get('phase');
  const medium = searchParams.get('medium');

  let filtered = [...mockUsers];

  if (brand) filtered = filtered.filter(u => u.brand === brand);
  if (language) filtered = filtered.filter(u => u.language === language);
  if (phase) filtered = filtered.filter(u => u.phase === phase);
  if (medium) filtered = filtered.filter(u => u.medium === medium);

  return NextResponse.json({
    success: true,
    data: filtered,
    count: filtered.length,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filters } = body;

    let filtered = [...mockUsers];

    if (filters?.brands && filters.brands.length > 0) {
      filtered = filtered.filter(u => filters.brands.includes(u.brand));
    }
    if (filters?.languages && filters.languages.length > 0) {
      filtered = filtered.filter(u => filters.languages.includes(u.language));
    }
    if (filters?.phases && filters.phases.length > 0) {
      filtered = filtered.filter(u => filters.phases.includes(u.phase));
    }
    if (filters?.statuses && filters.statuses.length > 0) {
      filtered = filtered.filter(u => filters.statuses.includes(u.status));
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      count: filtered.length,
      filters: filters,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 400 }
    );
  }
}
