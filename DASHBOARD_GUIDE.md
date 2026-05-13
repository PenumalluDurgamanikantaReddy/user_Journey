# 🎯 User Journey Analytics Dashboard

A comprehensive Next.js application for visualizing and analyzing user engagement across multiple platforms and channels. Built with TypeScript, Tailwind CSS, and React.

## 📋 Overview

This dashboard tracks user journeys through three main phases:
- **Content** (Casual to Deep Engagement) - Ads, Socials, Website, YouVersion, AI, Daily Devotional
- **Conversation** (Direct Engagement) - Comments, DMs, Courses  
- **Church** (Goal Achievement) - Conversation or Church Connection

## 🎨 Features

### 1. **Interactive Bubble Visualization**
   - Three-column funnel showing user flow: Content → Conversation → Church
   - Bubble size represents user count and percentage
   - Hover effects with tooltips and engagement metrics
   - Color-coded by medium/channel type

### 2. **Advanced Filtering System**
   - **Brand Filter**: Biblword, SheRises, AlKitab, Search4Truth
   - **Language Filter**: 9+ languages (English, Spanish, Arabic, Portuguese, Korean, Chinese, Italian, Hindi, German)
   - **Phase Filter**: Evangelism, Discipleship, Leadership Development
   - **Status Filter**: Active/Inactive users
   - **Date Range**: Pick custom date ranges
   - **Reset Functionality**: Quick reset to default filters

### 3. **Detailed Analytics**
   - Medium breakdown with conversion rates
   - Phase distribution visualization
   - Top languages statistics
   - Key metrics: Conversion Rate, Active Engagement, Average Engagement Level

### 4. **User Explorer Table**
   - Sortable by: Date, Engagement Level, Name
   - Color-coded badges for phase, status, and goals
   - Engagement level progress bars
   - Real-time filtering based on dashboard filters

### 5. **Responsive Design**
   - Mobile-first approach
   - Adapts to all screen sizes
   - Touch-friendly controls

## 📊 Data Structure

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  medium: 'facebook' | 'instagram' | 'ads' | 'youversion' | 'website' | 'ai' | 'courses';
  conversationType?: 'comments' | 'dm' | 'courses' | 'chat';
  language: string;
  brand: string;
  date: string;
  status: 'active' | 'inactive';
  phase: 'evangelism' | 'discipleship' | 'leadership';
  goal: 'conversation' | 'church';
  engagementLevel: number; // 0-100
}
```

### Filter State
```typescript
interface FilterState {
  brands: string[];
  languages: string[];
  phases: Phase[];
  statuses: ('active' | 'inactive')[];
  dateRange: { start: string; end: string };
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd chirst
npm install
```

### Running the Development Server
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build for Production
```bash
npm run build
npm start
```

## 🗂️ Project Structure

```
chirst/
├── app/
│   ├── api/
│   │   └── users/route.ts          # API endpoint for user data
│   ├── components/
│   │   ├── BubbleVisualization.tsx # Main funnel visualization
│   │   ├── DetailedStats.tsx       # Analytics metrics
│   │   ├── Filters.tsx             # Filter controls
│   │   └── UserExplorer.tsx        # User table view
│   ├── data/
│   │   └── mockData.ts             # Data models & mock users
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Main page
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.ts
```

## 🔄 Data Flow

1. **Mock Data** (`mockData.ts`) - 15 sample users across all mediums
2. **Filters** (`Filters.tsx`) - User adjusts filter criteria
3. **Filter Application** - `filterUsers()` function processes data
4. **Visualization** - Components render filtered results
5. **API Endpoint** (`/api/users`) - Backend integration point

## 🎯 Key Metrics

### Conversion Funnel
- Users entering via different mediums
- Movement to conversation phase
- Final goal achievement (church connection)

### Engagement Tracking
- Per-user engagement levels (0-100%)
- Active vs. inactive user counts
- Phase-based distribution

### Language & Brand Coverage
- Multi-language support tracking
- Brand-specific user segments
- Geographic/cultural distribution

## 📡 API Endpoints

### GET /api/users
Query parameters:
- `brand` - Filter by brand
- `language` - Filter by language
- `phase` - Filter by phase
- `medium` - Filter by medium

Example:
```bash
GET /api/users?brand=Biblword&phase=evangelism
```

### POST /api/users
Request body:
```json
{
  "filters": {
    "brands": ["Biblword"],
    "languages": ["English", "Spanish"],
    "phases": ["evangelism", "discipleship"],
    "statuses": ["active"]
  }
}
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#FBBF24)
- **Danger**: Red (#EF4444)
- **Secondary**: Purple (#A855F7), Indigo (#6366F1)

### Bubble Colors
- Facebook: Blue
- Instagram: Pink/Rose
- Ads: Yellow/Amber
- YouVersion: Purple/Indigo
- Website: Green/Emerald
- AI Chat: Cyan/Blue
- Courses: Red/Rose

## 🔧 Configuration

### Brands
Edit in `mockData.ts`:
```typescript
export const BRANDS = ['Biblword', 'SheRises', 'AlKitab', 'Search4Truth'];
```

### Languages
```typescript
export const LANGUAGES = ['English', 'Spanish', 'Arabic', ...];
```

### Phases
```typescript
export const PHASES: Phase[] = ['evangelism', 'discipleship', 'leadership'];
```

### Mediums
```typescript
export const MEDIUMS = ['facebook', 'instagram', 'ads', ...];
```

## 📈 Sample Use Cases

### 1. Evangelism Campaign Analysis
- Filter: Phase = "Evangelism", Status = "Active"
- View: Top converting mediums and languages

### 2. Discipleship Tracking
- Filter: Phase = "Discipleship"
- View: User progression and engagement levels

### 3. Language Coverage Report
- Check: Language distribution across all phases
- Identify: Underserved language groups

### 4. Brand Performance
- Filter by brand
- Compare: Conversion rates across brands

### 5. Recent Activity
- Filter: Date range = last 30 days
- Sort by: Date or engagement level

## 🔌 Integration with Excel Backend

The system is designed to work with Excel sheets backend:

### Mediums Mapping
- **Social Media Sheet** → Facebook, Instagram comments
- **Ads Sheet** → Google Ads, Facebook Ads
- **YouVersion App** → Direct app engagement
- **Website Sheet** → Web visitors
- **AI Chat** → Chatbot interactions
- **Courses** → Online course enrollments

### Backend Integration Points
1. Replace `mockUsers` in `mockData.ts` with API calls
2. Update `/api/users` route to fetch from your Excel backend
3. Implement data refresh/caching strategy

Example API integration:
```typescript
// In mockData.ts or a hooks file
export async function fetchUsers(filters?: FilterState) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters })
  });
  return response.json();
}
```

## 🛠️ Development

### Adding New Filters
1. Add property to `FilterState` interface
2. Add UI control in `Filters.tsx`
3. Update `filterUsers()` function
4. Update API route

### Adding New Mediums
1. Add to `Medium` type in `mockData.ts`
2. Add to `MEDIUMS` array
3. Add color mapping in `BubbleVisualization.tsx`
4. Add to mock data

### Customizing Bubbles
Edit `BubbleVisualization.tsx`:
- `calculateBubbleSize()` - Adjust sizing logic
- `getColor()` - Change color scheme
- Bubble hover effects and interactions

## 📚 Dependencies

- **next**: 16.2.6 - React framework
- **react**: 19.2.4 - UI library
- **tailwindcss**: 4.x - Styling
- **typescript**: 5.x - Type safety
- **eslint**: 9.x - Code quality

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🚀 Performance Tips

1. **Data Caching**: Implement React Query or SWR for API calls
2. **Lazy Loading**: Load user table only when needed
3. **Memoization**: Use React.memo for visualization components
4. **Virtual Scrolling**: For large user lists
5. **CDN**: Deploy on Vercel for optimal performance

## 🔒 Security

- Input validation on filters
- API route authentication (to be implemented)
- CORS configuration (if needed)
- Rate limiting on API endpoints

## 📝 Future Enhancements

- [ ] Real-time data updates
- [ ] Export reports (PDF, CSV)
- [ ] Advanced analytics (cohort analysis, retention)
- [ ] Custom dashboard layouts
- [ ] User journey replay/visualization
- [ ] A/B testing framework
- [ ] Notification system
- [ ] User role management
- [ ] Multi-language UI
- [ ] Dark mode support

## 🤝 Contributing

Contributions welcome! Please follow:
1. TypeScript strict mode
2. Tailwind CSS utility classes
3. Component composition patterns
4. Prop drilling minimization

## 📄 License

Private project for church ministry

## 📧 Contact

For questions or support, please refer to project documentation or contact the development team.

---

**Last Updated**: May 2026
**Version**: 1.0.0
**Status**: Production Ready
