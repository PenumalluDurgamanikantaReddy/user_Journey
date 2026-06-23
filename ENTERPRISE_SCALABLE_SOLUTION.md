# BigQuery Integration - Enterprise Scalable Architecture

## 🏛️ Long-Term Production Strategy

### 1. Proper Service Account Access (The Right Way)

Instead of using ADC, you need a **dedicated service account** for your application. This is the enterprise standard.

**What to Request from Your Admin:**

Send this to your system administrator:

```
PROJECT: [your-project-id]
REQUEST: Service Account Creation for user_journey Application

REQUIRED PERMISSIONS:
- Permission: "iam.serviceAccounts.create"
- Permission: "iam.serviceAccounts.getAccessToken"
- Permission: "resourcemanager.projects.getIamPolicy"

SERVICE ACCOUNT DETAILS:
- Name: user-journey-bigquery-sa
- Display Name: User Journey BigQuery Service Account
- Description: Backend API for fetching user analytics from BigQuery

REQUIRED ROLES FOR SERVICE ACCOUNT:
1. roles/bigquery.dataViewer (view datasets and tables)
2. roles/bigquery.jobUser (run queries)
3. roles/bigquery.resourceEditor (create datasets/tables if needed)

GRANT THIS SERVICE ACCOUNT PERMISSIONS ON:
- Dataset: users (or your actual dataset name)
- Tables: All tables the app needs to access

DELIVERABLES NEEDED:
- JSON Key File (service account credentials)
- Service account email
```

---

### 2. Scalable Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Google Cloud Platform (GCP)                   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         BigQuery                                 │   │
│  │  - users_dataset                                 │   │
│  │  - analytics_dataset                             │   │
│  │  - events_dataset                                │   │
│  └──────────────────┬───────────────────────────────┘   │
│                     │                                     │
│  ┌──────────────────▼───────────────────────────────┐   │
│  │  Service Account (user-journey-bigquery-sa)      │   │
│  │  - JSON credentials stored securely              │   │
│  │  - Minimal permissions (least privilege)         │   │
│  └──────────────────┬───────────────────────────────┘   │
│                     │                                     │
└─────────────────────┼─────────────────────────────────────┘
                      │
            ┌─────────▼──────────┐
            │   Cloud Run        │
            │   (Production API) │
            └─────────┬──────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼───┐    ┌────▼───┐   ┌────▼───┐
   │CDN     │    │Cache   │   │Monitor │
   │CloudFl │    │Redis   │   │Datadog │
   │are     │    │(optional)  │or Cloud│
   └────────┘    └────────┘   │Trace   │
                              └────────┘
                              
        ┌──────────────────────────────┐
        │  Frontend (Next.js)          │
        │  - React Components          │
        │  - Authentication (OAuth)    │
        │  - Rate Limiting             │
        └──────────────────────────────┘
```

---

### 3. Multi-Environment Setup

```
DEVELOPMENT
  └─ Service Account: user-journey-dev-sa
  └─ BigQuery Project: dev-project-id
  └─ Dataset: dev_users_data
  └─ Credentials: .env.local (never commit)

STAGING
  └─ Service Account: user-journey-staging-sa
  └─ BigQuery Project: staging-project-id
  └─ Dataset: staging_users_data
  └─ Credentials: Cloud Secret Manager
  └─ Deployment: Cloud Run (staging)

PRODUCTION
  └─ Service Account: user-journey-prod-sa
  └─ BigQuery Project: prod-project-id
  └─ Dataset: prod_users_data
  └─ Credentials: Cloud Secret Manager + Encryption
  └─ Deployment: Cloud Run (production)
  └─ CDN: Cloud CDN (caching)
  └─ Monitoring: Cloud Trace + Logging
```

---

### 4. Secure Credential Management

#### Local Development
```env
# .env.local (NEVER commit this)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
GOOGLE_CLOUD_PROJECT=dev-project-id
```

#### Production (Cloud Run)
```bash
# Store credentials in Google Cloud Secret Manager
gcloud secrets create bigquery-sa-key --data-file=service-account-key.json

# Grant Cloud Run service account permission to access secret
gcloud secrets add-iam-policy-binding bigquery-sa-key \
  --member=serviceAccount:cloud-run-service-account@PROJECT.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# In Cloud Run, mount as environment variable
gcloud run deploy user-journey \
  --set-secrets GOOGLE_APPLICATION_CREDENTIALS=bigquery-sa-key:latest
```

#### Staging/Production (Terraform - IaC)
```hcl
# terraform/main.tf
resource "google_service_account" "bigquery_sa" {
  account_id   = "user-journey-bigquery-sa"
  display_name = "User Journey BigQuery Service Account"
}

resource "google_service_account_key" "bigquery_key" {
  service_account_id = google_service_account.bigquery_sa.name
}

resource "google_bigquery_dataset_iam_member" "bq_viewer" {
  dataset_id = google_bigquery_dataset.users.dataset_id
  role       = "roles/bigquery.dataViewer"
  member     = "serviceAccount:${google_service_account.bigquery_sa.email}"
}

resource "google_cloud_run_service_iam_member" "secret_accessor" {
  service         = google_cloud_run_service.api.name
  location        = google_cloud_run_service.api.location
  role            = "roles/secretmanager.secretAccessor"
  member          = "serviceAccount:${google_cloud_run_service.api.template.spec.service_account_name}"
}
```

---

### 5. Data Access Patterns (Scalable)

#### Pattern 1: Public Aggregated Data
```typescript
// No authentication needed
// GET /api/public/stats

export async function GET(request: NextRequest) {
  const result = await queryBigQuery(
    `SELECT country, COUNT(*) as count FROM users GROUP BY country`,
    true // Cache for 24 hours
  );
  return NextResponse.json(result);
}
```

#### Pattern 2: Authenticated User Data
```typescript
// Requires user authentication
// GET /api/user/data?userId=123

import { verifyAuth } from '@/app/auth/verify';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth) return new Response('Unauthorized', { status: 401 });

  const userId = request.nextUrl.searchParams.get('userId');
  
  // Verify user can only access their own data
  if (userId !== auth.userId) {
    return new Response('Forbidden', { status: 403 });
  }

  const result = await queryBigQuery(
    `SELECT * FROM users WHERE user_id = '${userId}'`
  );
  return NextResponse.json(result);
}
```

#### Pattern 3: Admin Analytics (Role-Based)
```typescript
// Requires admin role
// GET /api/admin/analytics

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth || auth.role !== 'admin') {
    return new Response('Forbidden', { status: 403 });
  }

  const result = await queryBigQuery(
    `SELECT * FROM analytics_dashboard_view`
  );
  return NextResponse.json(result);
}
```

---

### 6. Performance & Scalability

#### Query Optimization
```typescript
// Bad: Fetches too much data
SELECT * FROM users WHERE created_at > '2024-01-01'

// Good: Filtered and aggregated
SELECT 
  user_id, 
  name, 
  email,
  CAST(created_at AS DATE) as signup_date
FROM users 
WHERE created_at > '2024-01-01'
  AND deleted_at IS NULL
LIMIT 1000
OFFSET 0
```

#### Caching Strategy
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

export async function getCachedUsers(limit: number = 100) {
  const cacheKey = `users:list:${limit}`;
  
  // Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached as string);
  
  // Query BigQuery
  const result = await queryBigQuery(
    `SELECT * FROM users LIMIT ${limit}`
  );
  
  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(result.data));
  
  return result.data;
}
```

#### Database Views & Materialized Tables
```sql
-- Create a materialized view for common queries
CREATE OR REPLACE TABLE `project.dataset.users_summary` AS
SELECT 
  user_id,
  name,
  email,
  country,
  signup_date,
  last_activity,
  total_purchases,
  total_spent
FROM users
WHERE deleted_at IS NULL;

-- Index frequently queried columns
CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_users_signup ON users(signup_date);
CREATE INDEX idx_users_status ON users(status);
```

---

### 7. Monitoring & Observability

#### Application Performance Monitoring
```typescript
// app/utils/monitoring.ts
import { trace } from '@google-cloud/trace-agent';

export async function monitoredQuery(sql: string, label: string) {
  const startTime = Date.now();
  
  try {
    const result = await queryBigQuery(sql);
    const duration = Date.now() - startTime;
    
    // Log to Cloud Logging
    console.log({
      timestamp: new Date().toISOString(),
      label,
      duration_ms: duration,
      rows_returned: result.rowCount,
      success: true,
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error({
      timestamp: new Date().toISOString(),
      label,
      duration_ms: duration,
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false,
    });
    
    throw error;
  }
}
```

#### Cost Monitoring
```bash
# BigQuery automatically tracks costs
# View in Cloud Console: BigQuery > Project settings > Query settings

# Set up budget alerts
gcloud billing budgets create \
  --billing-account BILLING_ID \
  --display-name "BigQuery Budget" \
  --budget-amount 1000 \
  --threshold-rule percent=50 \
  --threshold-rule percent=100
```

---

### 8. Security Best Practices

#### SQL Injection Prevention
```typescript
// ❌ VULNERABLE - Never do this
const userId = request.nextUrl.searchParams.get('userId');
const sql = `SELECT * FROM users WHERE user_id = '${userId}'`; // DANGEROUS!

// ✅ SAFE - Use parameterized queries
import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery();
const query = `
  SELECT * FROM users 
  WHERE user_id = @userId
`;

const options = {
  query: query,
  params: { userId: userId },
};

const [rows] = await bigquery.query(options);
```

#### Rate Limiting
```typescript
// Rate limit API endpoints
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour
});

export async function GET(request: NextRequest) {
  const { success } = await ratelimit.limit(
    request.ip || 'anonymous'
  );

  if (!success) {
    return new Response('Rate limited', { status: 429 });
  }

  // ... handle request
}
```

#### Data Encryption
```typescript
// Encrypt sensitive data in transit
export const runtime = 'nodejs';

// Cloud Run automatically encrypts data in transit with TLS 1.3
// For at-rest encryption, enable in BigQuery:
gcloud bigquery datasets update users_dataset \
  --cmek-encryption-kms-key-name projects/KEY_PROJECT_ID/locations/LOCATION/keyRings/KEY_RING/cryptoKeys/KEY
```

---

### 9. CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build Next.js
        run: npm run build
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy user-journey \
            --source . \
            --platform managed \
            --region us-central1 \
            --set-secrets GOOGLE_APPLICATION_CREDENTIALS=bigquery-sa-key:latest \
            --memory 1Gi \
            --timeout 300
```

---

### 10. Disaster Recovery & Backup

```bash
# Backup BigQuery datasets regularly
gcloud bq mk --dataset --location=US backup_dataset

# Export data to Cloud Storage
bq extract users.users_table gs://backup-bucket/users-*.json

# Schedule with Cloud Scheduler
gcloud scheduler jobs create app-engine backup-bigquery \
  --schedule="0 2 * * *" \
  --http-method=POST \
  --uri="https://FUNCTION_URL/backup"
```

---

### 11. Team Onboarding

**Setup Steps for New Developers:**

1. **Request Service Account Access**
   - Send the request template above to admin
   - Get JSON credentials file

2. **Local Development**
   ```bash
   # Clone repo
   git clone your-repo
   cd user_journey
   
   # Set credentials path
   export GOOGLE_APPLICATION_CREDENTIALS="$PWD/credentials.json"
   
   # Create .env.local
   echo "GOOGLE_CLOUD_PROJECT=dev-project-id" > .env.local
   
   # Install and run
   npm install
   npm run dev
   ```

3. **Testing**
   ```bash
   npm test  # Unit tests
   npm run test:integration  # Integration tests with BigQuery
   ```

---

### 12. Cost Optimization

```typescript
// Estimate query cost before running
const estimatedBytes = 1000000; // 1MB
const costPerTB = 6.25; // $6.25 per TB
const estimatedCost = (estimatedBytes / (1024 ** 4)) * costPerTB;

console.log(`Estimated cost: $${estimatedCost.toFixed(4)}`);

// Use LIMIT to reduce scanned data
SELECT * FROM huge_table LIMIT 100  // Scans only needed data

// Use partitioned tables
CREATE TABLE users_partitioned
PARTITION BY DATE(created_at) AS
SELECT * FROM users;
```

---

## Summary: What to Do Now (Long-Term)

1. **Request Service Account** (send template above to admin)
2. **Wait for Admin Approval** (usually 1-3 days)
3. **Implement Multi-Environment Setup** (dev/staging/prod)
4. **Set Up Monitoring & Logging**
5. **Implement Caching Strategy**
6. **Deploy with CI/CD**
7. **Set Budget Alerts**
8. **Document Everything for Team**

This approach scales to millions of users and petabytes of data! 🚀
