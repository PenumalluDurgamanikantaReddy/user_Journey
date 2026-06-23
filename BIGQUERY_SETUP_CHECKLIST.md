# BigQuery Integration - Production Deployment Checklist

## ✅ What Was Created

### Backend Setup
- [x] `app/utils/bigquery.ts` - BigQuery client initialization and query functions
- [x] `app/api/bigquery/query/route.ts` - Generic SQL query endpoint (GET & POST)
- [x] `app/api/data/users/route.ts` - Specialized users data endpoint

### Frontend Setup
- [x] `app/hooks/useBigQueryData.ts` - React hooks for fetching BigQuery data
- [x] `app/components/UserAnalyticsDashboard.tsx` - Example dashboard component

### Documentation
- [x] `BIGQUERY_PRODUCTION_GUIDE.md` - Complete production deployment guide
- [x] `.env.example` - Environment variables template
- [x] `BIGQUERY_SETUP_CHECKLIST.md` - This file

---

## 🚀 Before Saturday - Action Items

### 1. Authentication Setup (TODAY)
```bash
# On your local machine
gcloud auth application-default login

# Verify it worked
gcloud auth list
gcloud config get-value project
```

### 2. Get Your Project ID
```bash
# Find your GCP project ID
gcloud config get-value project

# Or set it if not set
gcloud config set project YOUR-PROJECT-ID
```

### 3. Create `.env.local`
```bash
# Create .env.local in project root
echo 'GOOGLE_CLOUD_PROJECT=your-gcp-project-id' > .env.local
```

### 4. Test Locally
```bash
# Install dependencies (already done)
npm install

# Start dev server
npm run dev

# Test API: http://localhost:3000/api/data/users
```

### 5. Set Up Your BigQuery Tables
**Note:** You need:
- A BigQuery dataset (e.g., `users`)
- A table with user data (e.g., `users_table`)

Modify `app/api/data/users/route.ts` to match your actual table names:
```typescript
// Replace this line:
`${process.env.GOOGLE_CLOUD_PROJECT}.users.users_table`
// With your actual dataset and table:
`${process.env.GOOGLE_CLOUD_PROJECT}.YOUR_DATASET.YOUR_TABLE`
```

### 6. Update Dashboard Component
Use `UserAnalyticsDashboard.tsx` in your main page:
```tsx
// In app/page.tsx
import { UserAnalyticsDashboard } from '@/app/components/UserAnalyticsDashboard';

export default function Home() {
  return <UserAnalyticsDashboard />;
}
```

### 7. Deploy to Cloud Run (THURSDAY/FRIDAY)
```bash
# Build
npm run build

# Deploy
gcloud run deploy user-journey \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=your-project-id
```

### 8. Verify Production
- [ ] Visit your Cloud Run URL
- [ ] Test `/api/data/users` endpoint
- [ ] Test dashboard loads with real data
- [ ] Check performance

---

## 📋 Project Structure After Setup

```
app/
├── api/
│   ├── bigquery/
│   │   └── query/
│   │       └── route.ts          ← Generic BigQuery queries
│   ├── data/
│   │   └── users/
│   │       └── route.ts          ← Users data endpoint
│   └── users/
│       └── route.ts              ← (existing)
├── components/
│   ├── UserAnalyticsDashboard.tsx ← Example dashboard
│   └── ... (other components)
├── hooks/
│   └── useBigQueryData.ts         ← Frontend data fetching
├── utils/
│   ├── bigquery.ts                ← BigQuery client
│   ├── dataAggregator.ts
│   └── layoutEngine.ts
└── ...
```

---

## 🔑 Key Features

### Data Flow
```
BigQuery → API Endpoint → React Hook → Component
```

### API Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/bigquery/query` | GET/POST | Execute any SQL query |
| `/api/data/users` | GET | Fetch users (with caching) |

### React Hook Usage
```tsx
// Simple usage
const { data, loading, error, refetch } = useBigQueryData('/api/data/users');

// With SQL query
const { data: stats } = useBigQuery('SELECT COUNT(*) FROM users');

// Fetch with parameters
const { data: user } = useBigQueryData('/api/data/users', { userId: '123' });
```

---

## 🆘 Troubleshooting

### "Application Default Credentials not found"
```bash
gcloud auth application-default login
```

### "Permission denied" from BigQuery
- Verify your service account has `roles/bigquery.dataViewer`
- Check IAM permissions in GCP console

### API returns 500 error
- Check console logs: `npm run dev`
- Verify `GOOGLE_CLOUD_PROJECT` env var is set
- Check dataset/table names in API route

### Slow queries
- Queries are cached by default (enable with `useQueryCache: true`)
- Check BigQuery console for slow queries
- Add indexes to frequently queried columns

---

## 📞 Production Support Commands

```bash
# View Cloud Run logs
gcloud run logs read user-journey --limit 100

# Check deployment status
gcloud run describe user-journey

# View current environment
gcloud config list
gcloud config get-value project
```

---

## ⏰ Timeline to Saturday

| Day | Task |
|-----|------|
| TODAY | ✅ Setup ADC, get project ID, create .env.local |
| TOMORROW | ✅ Test locally, verify BigQuery connection |
| THURSDAY | ✅ Update dashboard component with real tables |
| FRIDAY | ✅ Deploy to Cloud Run, test in production |
| SATURDAY | ✅ Final checks, go live! |

Good luck with your Saturday deployment! 🚀
