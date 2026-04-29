# Diagnostics System - Usage Guide

## Quick Start

### 1. Access the Dashboard
Visit `https://your-domain/doctor/diagnostics` in your browser.

You'll see:
- **Summary banner** with success rate and "Fully Linked" status
- **4 metric tiles**: Success Rate, Avg Latency, Recovery Count, Slowest Check
- **Integration cards** for each service (Supabase, Hela AI, Env)
- **Live log stream** at the bottom showing detailed events

### 2. Check Status via API
For CI/CD pipelines, health checks, or automated monitoring:

```bash
# Get diagnostics report (JSON)
curl https://your-domain/api/diagnostics

# Expected response when fully linked:
{
  "generatedAt": "2026-04-29T10:15:10.239Z",
  "totalDurationMs": 245,
  "passed": 12,
  "failed": 0,
  "degraded": 0,
  "skipped": 0,
  "total": 12,
  "successRate": 100,
  "fullyLinked": true,
  "checks": [...]
}

# HTTP Status Codes:
# 200 → Some or all checks pass (dashboard is operational)
# 503 → All checks failed (dashboard is down)
```

### 3. View Logs
```bash
# Get last 10 log entries
curl https://your-domain/api/diagnostics/logs?limit=10

# Filter by level
curl https://your-domain/api/diagnostics/logs?level=error

# Filter by service
curl https://your-domain/api/diagnostics/logs?service=supabase

# Clear logs (for testing)
curl -X DELETE https://your-domain/api/diagnostics/logs
```

---

## Understanding the Dashboard

### Summary Banner
```
┌─────────────────────────────────────────┐
│ ✅ Fully Linked · Success Rate: 100%    │
│                                         │
│ All 12 integrations are operational     │
└─────────────────────────────────────────┘
```

**Colors:**
- 🟢 **Green** (≥80% success) → Healthy
- 🟡 **Yellow** (50–79% success) → Degraded
- 🔴 **Red** (<50% success) → Critical

### Metric Tiles

| Metric | What It Means |
|--------|--------------|
| **Success Rate** | Percentage of checks passing (0–100%) |
| **Avg Latency** | Average response time across all checks (ms) |
| **Recoveries** | Count of services that failed then recovered |
| **Slowest Check** | Name + duration of the slowest check |

### Integration Cards

Each service (Supabase, Hela AI, Env) has a card showing:

```
Supabase
━━━━━━━━━━━━━━━━━━━━━━━
✓ profiles table          45ms
✓ doctor_patient_relationships  52ms
✓ patient_assessments     48ms
✓ model_metrics           44ms
✓ doctor_invite_codes     46ms
✓ family_members          49ms
✓ get_patient_assessments RPC  38ms
```

**Click to expand** for detailed error info if any check fails:
```json
{
  "error": {
    "name": "SupabaseError",
    "message": "PGRST101 ...",
    "code": "PGRST101"
  },
  "hint": "...",
  "details": {}
}
```

### Log Stream

Dark-themed console at the bottom showing real-time events:

```
[10:15:10] ℹ️  runner      suite.start
[10:15:10] ℹ️  env         env.required → 3 required env vars present
[10:15:10] ℹ️  supabase    supabase.table.profiles → Reachable (124 rows) (45ms, attempt 1)
[10:15:10] ⚠️  hela-ai     hela.health → attempt 1/2 failed (500 Internal Server Error) (157ms)
[10:15:10] ℹ️  hela-ai     hela.health → recovered on attempt 2 (82ms)
[10:15:10] ℹ️  runner      suite.end → Done: 11 pass · 1 degraded · 0 fail · 0 skipped (245ms)
```

**Log Levels:**
- 🟦 **Info** (ℹ️) — Successful operations
- 🟨 **Warning** (⚠️) — Failed checks or retries
- 🟥 **Error** (❌) — Uncaught exceptions

---

## Interpreting Results

### ✅ Fully Linked (Everything Working)
```
Success Rate: 100%
Fully Linked: YES

All 12 checks: PASS
```
**Action:** None. Dashboard is fully operational.

---

### 🟡 Degraded (Some Services Recovering)
```
Success Rate: 85%
Fully Linked: YES (but degraded)

11 pass · 1 degraded · 0 fail
```
**What happened:** One service failed then recovered (e.g., temporary network issue).

**Action:** Monitor the logs for patterns. If degraded state persists, investigate the specific service (check "Slowest Check" or expand the integration card).

---

### 🔴 Critical (Services Down)
```
Success Rate: 50%
Fully Linked: NO

8 pass · 2 fail · 2 skipped
```

**Possible causes:**

| Status | Probable Cause |
|--------|----------------|
| `fail` | Network unreachable, wrong credentials, database offline |
| `skipped` | Environment variable not set (configuration issue) |

**Action:** 
1. Check the error details in the expanded card (click "Details" JSON)
2. For `skipped` checks: Set the missing env vars
3. For `fail` checks: Verify network, credentials, and service status

---

## Common Scenarios

### Scenario 1: All Checks Skipped (No Env Vars)
```
Status: 1 fail (env check) · 11 skipped
Fully Linked: NO
```

**Why:** Environment variables `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_HELA_API_URL` are not set.

**Fix:**
```bash
# In Vercel Settings → Variables, add:
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_HELA_API_URL=your_url
```

Then refresh `/doctor/diagnostics` — all checks will run.

---

### Scenario 2: Supabase Tables Failing
```
✓ env check
✓ Hela AI checks
✗ Supabase tables (all 7 failing)
```

**Why:** 
- Database offline or unreachable
- Wrong credentials
- Tables don't exist (not migrated)

**Check:**
1. Verify credentials: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Verify network: Can you reach Supabase from your location?
3. Verify schema: Run your database migrations

---

### Scenario 3: Hela AI Health Check Failing
```
✓ env check
✓ Supabase checks
✗ Hela AI /health
```

**Why:**
- Hela API server is offline
- Wrong API URL or key
- Network firewall blocking access

**Check:**
1. Verify URL: `NEXT_PUBLIC_HELA_API_URL` matches your backend
2. Verify key: `NEXT_PUBLIC_HELA_API_KEY` (if required)
3. Try direct request:
   ```bash
   curl https://your-hela-url/health -H "Authorization: Bearer your-key"
   ```

---

### Scenario 4: Doctor Chat Failing (Other Checks Pass)
```
✓ Hela /health
✓ Hela /risk-queue
✓ Hela /glossary
✗ Hela /doctor/chat
```

**Why:** The `/doctor/chat` endpoint has a specific dependency (e.g., model not loaded, special auth required).

**Action:** Contact Hela support — other endpoints are working, so the issue is service-specific.

---

## Monitoring & Alerts

### Set Up Uptime Monitoring
Use any uptime monitor (Uptimerobot, Pingdom, DataDog, etc.):

```
Service:     Dashboard Health Check
URL:         https://your-domain/api/diagnostics
Method:      GET
Expected:    Status 200
Frequency:   Every 5 minutes
Alert on:    Status ≠ 200
```

### Parse for Alerting
```bash
# Check if fully linked (for critical alerts)
curl -s https://your-domain/api/diagnostics | jq '.fullyLinked'
# Output: true or false

# Get success rate (for threshold alerts)
curl -s https://your-domain/api/diagnostics | jq '.successRate'
# Output: 0–100
```

### Example Alert Condition (Datadog)
```
if diagnostics.successRate < 80 {
  alert("Dashboard integration health degraded")
}
```

---

## Performance Insights

### Latency by Check
Check the "Slowest Check" tile or expand each integration card to see individual check duration.

**Typical latencies:**
- Environment checks: <1ms
- Supabase table query: 40–80ms
- Hela API call: 100–500ms

If a check is **>500ms:**
- Network latency issue (check geolocation)
- Service load (check service status)
- Firewall/proxy delays (check network config)

---

## Auto-Refresh

Toggle **"Auto-Refresh (15s)"** in the log stream to continuously probe integrations every 15 seconds.

**When to use:**
- Debugging transient failures
- Verifying recovery after fixing an issue
- Continuous monitoring during deployment

---

## Developer Workflow

### 1. Before Deployment
```bash
curl https://your-domain/api/diagnostics | jq '.fullyLinked'
```
Must return `true` before pushing to production.

### 2. During Incident
```bash
# Quick status check
curl https://your-domain/api/diagnostics | jq '.{successRate, fullyLinked}'

# Get error details
curl https://your-domain/api/diagnostics | jq '.checks[] | select(.status=="fail")'
```

### 3. Post-Incident
```bash
# Verify recovery
curl https://your-domain/api/diagnostics/logs?level=info | jq '.'
# Look for "recovered on attempt X" messages
```

---

## FAQ

**Q: Why are some checks skipped?**  
A: Environment variables are not set. Set them in Vercel Settings → Variables.

**Q: Can I test a specific check?**  
A: Not yet — all checks run together. You can clear logs and refresh the page to re-run.

**Q: Does diagnostics slow down my dashboard?**  
A: No. Diagnostics only run when you visit `/doctor/diagnostics`. The ring buffer has zero impact.

**Q: Can I use diagnostics in production?**  
A: Yes. The API is safe and read-only. You can expose `/api/diagnostics` to monitoring tools.

**Q: How often should I check diagnostics?**  
A: Set up automated monitoring to check `/api/diagnostics` every 5–10 minutes. Check the dashboard manually during deployments or when issues arise.

---

## Support

If checks are consistently failing:

1. **Check the error details** — Click "Details" JSON on the failing card
2. **Review the logs** — Filter by service and level to understand the sequence
3. **Verify credentials** — Ensure all env vars are correct and accessible
4. **Test externally** — Use `curl` to reach the service directly from the server
5. **Check service status** — Visit Supabase and Hela status pages

