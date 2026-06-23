# BigQuery Production Deployment Guide

## Architecture Overview

```
┌──────────────────────────────┐
│    BigQuery Database         │
│  (Google Cloud Platform)     │
└──────────────┬───────────────┘
               │
               │ SQL Queries
               │
┌──────────────▼───────────────┐
│   Next.js Backend API        │
│  - /api/bigquery/query       │
│  - /api/data/users           │
│  - Custom endpoints          │
└──────────────┬───────────────┘
               │
               │ JSON REST API
               │
┌──────────────▼───────────────┐
│   React Frontend             │
│  - Components                │
│  - Hooks (useBigQueryData)   │
│  - Pages                     │
└──────────────────────────────┘
```

## Setup Instructions for Production

### 1. Local Development Setup

```bash
# Authenticate with Google Cloud
gcloud auth application-default login

# Set your Google Cloud Project ID
$env:GOOGLE_CLOUD_PROJECT="your-project-id"

# Install dependencies
npm install

# Run development server
npm run dev
```

### 2. Environment Variables

Create `.env.local`:
```
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
```

Create `.env.production`:
```
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
```

### 3. Production Deployment on Google Cloud

#### Option A: Deploy to Cloud Run (Recommended)

```bash
# Build the Next.js app
npm run build

# Deploy to Cloud Run
gcloud run deploy user-journey \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=your-project-id
```

#### Option B: Deploy to Compute Engine

```bash
# SSH into your Compute Engine instance
gcloud compute ssh your-instance

# Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Clone your repository and build
git clone your-repo
cd user_journey
npm install
npm run build

# Start with PM2
pm2 start npm --name "user-journey" -- start
pm2 save
pm2 startup
```

### 4. BigQuery Access in Production

The app uses **Application Default Credentials (ADC)**. In production:

**For Cloud Run:**
- Automatically uses the service account attached to the Cloud Run service
- No additional setup needed

**For Compute Engine:**
- Attach a service account to your VM instance with BigQuery permissions
- The service account needs these roles:
  - `roles/bigquery.dataViewer` (read data)
  - `roles/bigquery.jobUser` (run queries)
  - `roles/bigquery.dataEditor` (write data if needed)

### 5. API Endpoints

#### Query BigQuery (GET)
```
GET /api/bigquery/query?sql=SELECT * FROM dataset.table LIMIT 10
```

#### Query BigQuery (POST)
```
POST /api/bigquery/query
Content-Type: application/json

{
  "sql": "SELECT * FROM dataset.table LIMIT 10",
  "useCache": true
}
```

#### Get Users
```
GET /api/data/users?limit=100
GET /api/data/users?userId=123
```

### 6. Frontend Usage

```tsx
import { useBigQueryData, useBigQuery } from '@/app/hooks/useBigQueryData';

export function UserDashboard() {
  // Fetch users
  const { data: users, loading, error } = useBigQueryData(
    '/api/data/users',
    { limit: 50 }
  );

  // Or use raw SQL
  const { data: analytics } = useBigQuery(
    'SELECT COUNT(*) as total FROM users'
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {users?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### 7. Performance Optimization

- **Query caching**: The API endpoint uses `useQueryCache: true` by default
- **Add indexes**: Create indexes on frequently queried columns in BigQuery
- **Pagination**: Use `LIMIT` and `OFFSET` for large datasets
- **Incremental updates**: Only fetch new/changed data

### 8. Monitoring & Logs

```bash
# View Cloud Run logs
gcloud run logs read user-journey --region us-central1 --limit 50

# View Compute Engine logs
journalctl -u pm2-root -n 100 -f
```

### 9. Security Checklist

- [ ] BigQuery service account has minimal required permissions
- [ ] Environment variables are not committed to git
- [ ] API endpoints validate/sanitize SQL queries (if user-provided)
- [ ] Cloud Run service is authenticated if needed
- [ ] VPC-SC or firewall rules restrict BigQuery access
- [ ] Enable audit logging in BigQuery

### 10. Troubleshooting

**Error: "Application Default Credentials (ADC) not found"**
```bash
# Ensure you've logged in locally
gcloud auth application-default login
```

**Error: "Permission denied" on BigQuery**
- Check service account roles: `gcloud projects get-iam-policy your-project-id`
- Verify BigQuery dataset permissions

**Slow queries**
- Check query execution time in BigQuery console
- Add indexes to frequently queried columns
- Consider materializing views for complex queries
