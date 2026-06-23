# Enterprise Deployment Guide - Step by Step

## 🎯 Phase 1: Request Service Account (Week 1)

### What to Send to Your Admin

Use this template:

```
SUBJECT: Service Account Creation Request for user_journey Application

TO: [System Administrator]

REQUEST DETAILS:
================

PROJECT ID: [your-gcp-project-id]
ENVIRONMENT: Development + Production

SERVICE ACCOUNT NEEDED:
  Name: user-journey-bigquery-sa
  Description: Backend API for user analytics from BigQuery
  
PERMISSIONS I NEED:
  • iam.serviceAccounts.create
  • iam.serviceAccounts.getAccessToken
  • resourcemanager.projects.getIamPolicy

ROLES FOR SERVICE ACCOUNT:
  1. roles/bigquery.dataViewer (read data from BigQuery)
  2. roles/bigquery.jobUser (execute queries)
  
DELIVERABLES NEEDED:
  1. Service account email (e.g., user-journey-sa@project.iam.gserviceaccount.com)
  2. JSON key file (for local development)
  3. Confirmation that SA has permissions on users dataset

DEADLINE: [Date]
```

---

## 🏗️ Phase 2: Local Setup (After Admin Approval)

### 1. Install Google Cloud SDK

```bash
# Download and install
https://cloud.google.com/sdk/docs/install-sdk#windows

# Or use PowerShell:
(New-Object System.Net.WebClient).DownloadFile(
  'https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe',
  'C:\temp\GoogleCloudSDKInstaller.exe'
)
Start-Process C:\temp\GoogleCloudSDKInstaller.exe
```

### 2. Configure Service Account

```bash
# After admin gives you the JSON key file:
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account-key.json"

# Verify it works:
gcloud auth list
gcloud config get-value project
```

### 3. Create Environment Files

```bash
# .env.local (NEVER commit this!)
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account-key.json

# Optional:
BIGQUERY_LOCATION=US
JWT_SECRET=your-secret-key-for-tokens
```

### 4. Install Dependencies

```bash
cd user_journey
npm install

# The BigQuery client is already installed from before
npm install jose @upstash/redis @upstash/ratelimit
```

### 5. Test Locally

```bash
# Start development server
npm run dev

# Test the API (open browser):
http://localhost:3000/api/v1/analytics/users

# With auth token (you need to generate):
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/analytics/users
```

---

## 🚀 Phase 3: Deploy to Cloud Run

### 1. Build Application

```bash
npm run build
```

### 2. Set Up Cloud Run

```bash
# Create secret for credentials in Google Cloud
gcloud secrets create bigquery-sa-key \
  --data-file=service-account-key.json \
  --project=your-project-id

# Create Cloud Run service
gcloud run deploy user-journey \
  --source . \
  --platform managed \
  --region us-central1 \
  --memory 1Gi \
  --timeout 300 \
  --set-secrets GOOGLE_APPLICATION_CREDENTIALS=bigquery-sa-key:latest \
  --set-env-vars GOOGLE_CLOUD_PROJECT=your-project-id \
  --project your-project-id
```

### 3. Verify Deployment

```bash
# Get the URL
gcloud run services describe user-journey --region us-central1

# Test the endpoint
curl https://your-cloud-run-url.a.run.app/api/v1/analytics/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔐 Phase 4: Set Up Authentication

### Generate JWT Tokens for Testing

```typescript
// Local test script
import { jwtSign } from 'jose';

const secret = new TextEncoder().encode('your-secret-key');

const token = await jwtSign(
  {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'analyst',
    permissions: ['read:all_data', 'write:data'],
  },
  secret,
  {
    algorithm: 'HS256',
    expiresIn: '24h',
  }
);

console.log('Token:', token);
```

### Production Auth (OAuth)

For production, integrate OAuth provider:

```typescript
// Example with Google OAuth
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || 'viewer';
        token.permissions = user.permissions || [];
      }
      return token;
    },
  },
};
```

---

## 📊 Phase 5: Configure Monitoring

### 1. Enable Cloud Logging

```bash
# Logs automatically go to Cloud Logging
# View in console:
gcloud logging read \
  'resource.type="cloud_run_revision"' \
  --limit 50 \
  --project=your-project-id
```

### 2. Set Up Budget Alerts

```bash
# Create billing budget alert
gcloud billing budgets create \
  --billing-account BILLING_ACCOUNT_ID \
  --display-name "BigQuery Budget" \
  --budget-amount 500 \
  --threshold-rule percent=50 \
  --threshold-rule percent=100
```

### 3. Create Monitoring Dashboard

In Google Cloud Console:
- Go to Monitoring > Dashboards
- Create dashboard
- Add metrics:
  - Cloud Run request count
  - Cloud Run response times
  - BigQuery job execution time
  - BigQuery bytes scanned

---

## 💾 Phase 6: Backup & Disaster Recovery

### 1. Daily Backup to Cloud Storage

```bash
# Create storage bucket
gsutil mb gs://user-journey-backups

# Schedule backup job
gcloud scheduler jobs create app-engine backup-bigquery \
  --schedule="0 2 * * *" \
  --http-method=POST \
  --uri="https://FUNCTION_URL/backup" \
  --oidc-service-account-email=SERVICE_ACCOUNT_EMAIL

# Backup script (Cloud Function)
import google.cloud.bigquery as bq
import google.cloud.storage as storage

def backup_bigquery(request):
    bq_client = bq.Client()
    storage_client = storage.Client()
    
    # Export dataset
    job = bq_client.extract_table(
        'project.dataset.table',
        'gs://user-journey-backups/backup-*.json'
    )
    job.result()  # Wait for completion
    
    return 'Backup complete', 200
```

---

## ✅ Pre-Launch Checklist

- [ ] Service account created with proper permissions
- [ ] Local development working with credentials
- [ ] All tests passing (`npm test`)
- [ ] Authentication configured
- [ ] Rate limiting enabled
- [ ] Monitoring dashboard created
- [ ] Budget alerts configured
- [ ] Backup system working
- [ ] Security review completed
- [ ] Documentation updated for team

---

## 📱 API Endpoint Examples

### Get All Users
```bash
curl -H "Authorization: Bearer TOKEN" \
  'http://localhost:3000/api/v1/analytics/users?limit=100&offset=0'
```

### Filter by Country
```bash
curl -H "Authorization: Bearer TOKEN" \
  'http://localhost:3000/api/v1/analytics/users?country=US&limit=100'
```

### Custom Query (POST)
```bash
curl -X POST http://localhost:3000/api/v1/analytics/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT country, COUNT(*) as count FROM users GROUP BY country",
    "params": {}
  }'
```

---

## 🆘 Troubleshooting

### "Application Default Credentials not found"
```bash
# Verify credentials are set
$env:GOOGLE_APPLICATION_CREDENTIALS
# Should show: C:\path\to\service-account-key.json
```

### "Permission denied" from BigQuery
```bash
# Check service account permissions
gcloud projects get-iam-policy your-project-id \
  --flatten="bindings[].members" \
  --filter="bindings.members:user-journey-sa@*"
```

### Rate limiting issues
- Check Redis connection (if using Upstash)
- Verify rate limit configuration in `app/utils/rateLimit.ts`
- Use headers to see remaining requests: `X-RateLimit-Remaining`

---

## 📈 Scaling to Production

When you're ready to go live:

1. **Multi-region deployment**
   ```bash
   gcloud run deploy user-journey \
     --region us-central1 \
     --region europe-west1
   ```

2. **Add Cloud CDN**
   ```bash
   gcloud compute backend-services create user-journey-backend \
     --enable-cdn
   ```

3. **Load balancing**
   - Use Cloud Load Balancer for multi-region
   - Configure health checks
   - Set up auto-scaling

4. **Database sharding**
   - Partition BigQuery tables by date/region
   - Implement caching layer (Redis)

---

## 🎓 Team Onboarding

New developers should follow these steps:

1. Request service account access from admin
2. Follow "Phase 2: Local Setup"
3. Read [ENTERPRISE_SCALABLE_SOLUTION.md](./ENTERPRISE_SCALABLE_SOLUTION.md)
4. Review API endpoint examples above
5. Run tests: `npm test`
6. Start development!

---

## 📞 Support

For issues:
1. Check logs: `gcloud run logs read user-journey`
2. Review [ENTERPRISE_SCALABLE_SOLUTION.md](./ENTERPRISE_SCALABLE_SOLUTION.md)
3. Contact admin if service account issues
4. Check BigQuery console for query problems
