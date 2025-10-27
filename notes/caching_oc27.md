note: we DO NOT WANT CLIENT SIDE CACHING. we want this:  so one person in staten island lodas the page and maybe has to wait 40 seconds for all the queries, but then another person loads in manhattan and the page loads instantly?

# Caching Strategy for Civibus Campaign Finance Platform

## Current State

**Architecture:**
- React SPA fetching directly from Supabase (`sobzobykotnsltnyhohl.supabase.co`)
- No proxy layer between frontend and Supabase
- No shared cache between users
- Cloudflare serves static assets only (HTML/JS/CSS), not API responses
- Regular views (not materialized) recalculate on every query

**Performance baseline (unverified):**
- Estimated query time: 500ms-2s per view with current NC data (~80 candidates)
- NYC expansion: 200+ candidates, 3-4x data volume
- Projected query time: 1.5s-5s without optimization

**Data update frequency:**
- Campaign finance reports: Weekly during active season
- Data pipeline: Manual script execution (`loadData.js`)
- Users expect data freshness: Daily at most

## Strategic Decision: When to Cache

**Don't cache yet if:**
- Page loads measure <3s in production with real users
- Traffic <1000 requests/day
- You're still iterating on data model/views

**Cache becomes necessary when:**
- Page loads consistently >3s (user patience threshold)
- Traffic >10k requests/day (cost/performance pressure)
- Multiple users in same geography loading identical data (cache hit opportunity)

**Recommendation:** Ship NYC v1 without caching infrastructure. Instrument with performance monitoring. Let data drive optimization decision.

## Caching Layer Options

### Option A: Cloudflare Worker Proxy (Recommended for scale)

**Implementation:**
```
User → Cloudflare Worker → Supabase
     ↓
  CF Cache
```

**Setup requirements:**
1. Deploy Worker at `civibus.com`
2. Rewrite `/api/supabase/*` to proxy Supabase
3. Add `Cache-Control` and `Cache-Tag` headers to responses
4. Update frontend to call `/api/supabase/v_location_data` instead of direct Supabase URLs

**Purging mechanism:**
```javascript
// In loadData.js after data updates
await fetch('https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${CF_API_TOKEN}` },
  body: JSON.stringify({ tags: ['supabase-data'] })
});
```

**Cache tag strategy:**
- `jurisdiction:nc` - All NC data
- `jurisdiction:nyc` - All NYC data
- `geo:durham` - City-specific (requires per-response tagging logic)
- `view:location` - View-specific

**Granular purge example:**
```javascript
// Purge only NYC data after NYC report update
await purgeByTag(['jurisdiction:nyc']);

// Purge everything after schema change
await purgeByTag(['supabase-data']);
```

**Pros:**
- Edge caching (50ms response for cache hits globally)
- Granular purge control via tags
- Scales to millions of requests
- Hides Supabase credentials (Worker uses server-side key)

**Cons:**
- 4-6 hours initial setup
- Worker debugging more complex than frontend code
- Cache invalidation logic must be maintained
- Dev/prod environment divergence (local dev bypasses Worker)

**Cost:** Free tier = 100k requests/day. Sufficient for foreseeable future.

**When to implement:** When production page loads exceed 3s OR traffic exceeds 5k requests/day.

---

### Option B: Materialized Views (Complementary to Worker)

**Postgres-level caching:**
```sql
CREATE MATERIALIZED VIEW v_location_data_mat AS
SELECT * FROM v_location_data;

-- After data load:
REFRESH MATERIALIZED VIEW CONCURRENTLY v_location_data_mat;
```

**Query performance improvement:**
- Regular view with 200 candidates: 2-5s
- Materialized view: 50-200ms

**Refresh strategy:**
```javascript
// In loadData.js after all inserts complete
const viewsToRefresh = [
  'v_location_data_mat',
  'v_timeline_data_mat',
  'v_top_donors_mat'
];

for (const view of viewsToRefresh) {
  console.log(`Refreshing ${view}...`);
  await supabase.rpc('refresh_view', { view_name: view });
}
```

**Selective materialization:**
- Expensive aggregations (timeline, location rollups) → materialize
- Simple lookups (candidate list, city metadata) → keep as regular views
- Reduces refresh time while improving critical paths

**Storage overhead:**
- Aggregated view data: ~10MB per 1000 candidates
- Negligible vs raw receipts table (GB scale)

**Pros:**
- Improves query speed even on cache misses
- No frontend code changes if wrapped in regular views
- Works in dev environment identically to prod

**Cons:**
- Adds refresh step to data pipeline (30s-2min depending on data volume)
- Refresh locks during non-CONCURRENT refresh (blocks reads)
- Must track which views need refresh after schema changes

**When to implement:** When view query times exceed 2s in Supabase dashboard, regardless of traffic.

**Synergy with Worker:** Materialized views make cache misses fast. Worker makes cache hits instant. Stack them.

---

### Option C: React Query (Client-side caching only)

**Browser-level caching:**
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5min
      cacheTime: 30 * 60 * 1000, // 30min in memory
    }
  }
});

function useCityData(geoName) {
  return useQuery({
    queryKey: ['city', geoName],
    queryFn: () => fetchSupabase('v_location_data', geoName),
  });
}
```

**Pros:**
- 30 minute implementation
- Automatic loading/error states
- Works identically in dev and prod
- Per-user caching improves navigation within session

**Cons:**
- No cross-user caching (every user hits Supabase)
- No reduction in server load
- Cache cleared on page refresh/new browser

**When to implement:** Immediately. No downside. Improves UX even if backend caching added later.

**Not a replacement for:** Worker or materialized views. Solves different problem (repeat views by same user vs shared cache across users).

---

## Recommended Implementation Sequence

### Phase 1: Baseline (Now)
- Ship NYC with direct Supabase calls
- Add basic performance logging:
  ```javascript
  const start = Date.now();
  const data = await fetchSupabase(...);
  console.log(`Query took ${Date.now() - start}ms`);
  ```
- Deploy and monitor for 1 week

### Phase 2: Low-hanging fruit (If >2s query times)
- Implement React Query (30 min)
- Materialize 2-3 slowest views (2-3 hours)
- Re-measure. If now <3s, stop here.

### Phase 3: Edge caching (If >3s page loads OR >5k requests/day)
- Deploy Cloudflare Worker proxy (4-6 hours)
- Tag responses by jurisdiction (NC/NYC)
- Implement purge-by-tag in `loadData.js`
- Set TTL = 3600s (1 hour)

### Phase 4: Optimization (If >100k requests/day)
- Granular cache tags (per-city, per-view)
- Separate Worker routes for high/low traffic endpoints
- Monitor cache hit rates, adjust TTLs
- Consider CDN cost optimization (unlikely to be needed)

---

## Cache Invalidation Strategy

**Development environment:**
- Bypass all caching (direct Supabase, no Workers)
- Alternative: Short TTL (60s) + manual purge script
- Accept that dev ≠ prod for cache behavior testing

**Production purge triggers:**

**Automatic (ideal state):**
```javascript
// Supabase Database Webhook on receipts table INSERT
// → Triggers your serverless function
// → Calls Cloudflare purge API with appropriate tags

// Problem: Over-triggers during batch inserts
// Solution: Debounce or only trigger on specific marker (e.g., flag column set after batch complete)
```

**Manual (MVP approach):**
```javascript
// End of loadData.js
if (process.env.NODE_ENV === 'production') {
  await purgeCloudflareCache({ tags: ['jurisdiction:nyc'] });
  console.log('✓ Cache purged');
}
```

**Emergency purge:**
```bash
# CLI command for manual intervention
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -d '{"purge_everything":true}'
```

---

## Failure Modes & Mitigations

**Stale data served after update:**
- Cause: Purge fails silently, cache still serves old data
- Detection: Log purge API responses, alert on 4xx/5xx
- Mitigation: TTL ensures auto-expiry within 1 hour even if purge fails

**Race condition during data load:**
- Cause: User requests view while inserts in progress, caches incomplete data
- Mitigation: Purge only after all inserts + view refreshes complete
- Alternative: "Under maintenance" flag during data loads (overkill for weekly updates)

**Cache hit rate lower than expected:**
- Cause: Query parameter variations create unique cache keys
- Detection: Cloudflare analytics showing <50% hit rate
- Fix: Normalize query params in Worker, canonical URL rewriting

**Worker outage breaks entire site:**
- Cause: Worker code bug or Cloudflare service issue
- Mitigation: Worker should fail-open (passthrough to Supabase on error)
- Example:
  ```javascript
  try {
    return await fetchFromSupabase(request);
  } catch (error) {
    console.error('Worker error:', error);
    return fetch(supabaseUrl); // Direct passthrough
  }
  ```

**Cost explosion if traffic spikes:**
- Workers free tier = 100k requests/day
- Paid tier = $5/mo for 10M requests
- Real risk: Very low. Would need 100x traffic growth to exceed free tier.

---

## Monitoring Requirements

**Before caching (baseline):**
- Query duration per view (Supabase dashboard)
- Page load time (browser performance API)
- Error rates on Supabase calls

**After Worker caching:**
- Cache hit rate (Cloudflare analytics)
- P50/P95 response times (cache hit vs miss)
- Purge API success rate
- Worker errors/exceptions

**After materialized views:**
- View refresh duration
- Query time improvement delta
- Storage growth rate

**Instrumentation code:**
```javascript
// Add to fetchSupabase
const start = performance.now();
const response = await fetch(url, ...);
const duration = performance.now() - start;

if (typeof gtag !== 'undefined') {
  gtag('event', 'api_call', {
    endpoint: endpoint,
    duration_ms: Math.round(duration),
    cache_status: response.headers.get('CF-Cache-Status') // HIT/MISS/BYPASS
  });
}
```

---

## Open Questions Requiring Data

1. **Actual query times at NYC scale:** Unknown until deployed. Estimate: 2-5s. Could be 500ms or 10s.

2. **Traffic patterns:** Unknown user behavior. Cache effectiveness depends on: Do users view same cities? Or widely distributed across 1000+ geographies?

3. **Update frequency in practice:** Weekly assumed, but if reports filed sporadically, longer TTL acceptable.

4. **Cost sensitivity:** If Supabase charges per-query, caching has direct cost benefit. If flat rate, only performance matters.

5. **Geographic distribution of users:** If primarily NC residents viewing NC data, edge caching less valuable than if national audience.

**Data-driven decision point:** After 2 weeks production with NYC data, evaluate:
- If P95 page load <3s → No caching needed
- If P95 3-5s → Materialized views sufficient
- If P95 >5s → Full Worker + materialized stack required

---

## Summary Recommendation

**Now:** Ship without caching. Add React Query (30 min effort, pure upside).

**Week 2:** Review performance data. If slow, materialize 2-3 views.

**Month 2:** If traffic or performance demands it, implement Worker proxy with cache tags.

**Rationale:** Premature optimization wastes effort. Your current stack may be adequate. Let user behavior and real performance data dictate investment.

**Exception:** If you have existing production traffic data showing >5k requests/day and >3s loads, skip to Worker implementation immediately.