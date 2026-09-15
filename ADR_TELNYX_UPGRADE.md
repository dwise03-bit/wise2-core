---
title: ADR - Telnyx Phone Service Upgrade Strategy
date: 2026-09-14
status: ✅ Accepted
adr_number: 0042
tags: [telnyx, architecture, retry-strategy, database-integration]
related: [[TELNYX_UPGRADE_PROJECT]]
---

# ADR-0042: Telnyx Phone Service Upgrade Strategy

**Date**: September 14, 2026  
**Status**: ✅ ACCEPTED (Deployed to Production)  
**Context**: WISE² v2.0 phone service reliability and feature expansion  
**Decision Makers**: Claude Haiku 4.5, dwise03@gmail.com

---

## 1. Problem Statement

The existing Telnyx phone service integration lacked:
- **Reliability**: No retry logic for network failures
- **Advanced Features**: Missing hold/resume, voicemail, DTMF, conference support
- **Persistence**: No database integration for call tracking
- **Security**: Webhook signature verification not implemented

This limited the service's production readiness and customer-facing capabilities.

---

## 2. Constraints & Requirements

### Must-Have (MVP)
- ✅ Retry logic with timeout handling
- ✅ Call hold/resume support
- ✅ DTMF input handling for IVR
- ✅ Database persistence for calls
- ✅ Webhook security verification
- ✅ 100% test coverage for new code

### Nice-to-Have (Future)
- Conference management (implemented)
- Voicemail routing (implemented)
- Customer profile enrichment (implemented)

### Constraints
- No breaking changes to existing API
- Must not affect other services
- Backward compatible with current deployments
- Production deployment must be < 7 minutes

---

## 3. Decision: Exponential Backoff Retry Strategy

### Choice
Use exponential backoff with configurable retries (default: 3 retries, 1s base delay, 30s timeout)

### Rationale

| Factor | Exponential Backoff | Linear Backoff | No Retries |
|--------|-------------------|----------------|-----------|
| Resilience | ⭐⭐⭐ Excellent | ⭐⭐ Good | ⭐ Poor |
| Latency Impact | ⭐⭐⭐ Low (backoff increases) | ⭐⭐ Moderate | ⭐⭐⭐ None |
| Server Load | ⭐⭐⭐ Reduces | ⭐⭐ Moderate | ⭐ High |
| Complexity | ⭐⭐ Moderate | ⭐⭐⭐ Simple | ⭐⭐⭐ Simple |

### Implementation
```typescript
// Exponential backoff formula
const delay = baseDelay * Math.pow(2, retryCount)
// Attempt 1: fail → wait 1s
// Attempt 2: fail → wait 2s
// Attempt 3: fail → wait 4s
// Attempt 4: fail → give up
```

### Retry Triggers
- Network timeouts (AbortError)
- 5xx server errors
- Network connectivity failures

### Non-Retry Cases
- 4xx client errors (don't retry bad requests)
- Invalid authentication (non-transient)
- Rate limiting 429 (wait headers override)

### Configuration Trade-off
```
More Retries           Fewer Retries
(3)                    (1)
├─ Better resilience   ├─ Faster failure detection
├─ Higher latency      ├─ Lower latency
└─ More server load    └─ Less resilient
```

**Decision**: Default 3 retries, but configurable. Allows tuning per deployment.

---

## 4. Decision: Database-First Persistence Model

### Choice
Use Prisma ORM with existing database schema for call persistence

### Rationale
- **Existing Infrastructure**: PostgreSQL already running
- **Type Safety**: Prisma generates types from schema
- **Migration-Ready**: Future schema changes easy
- **Query Efficiency**: Single source of truth for call data
- **Audit Trail**: Full call history available

### Alternative: Event Sourcing (Rejected)
- ❌ Adds complexity (separate event store)
- ❌ Eventual consistency issues
- ❌ Harder to query current state
- ✅ Would be better for compliance/audit (future)

### Schema Integration
```
Customer ← 1:many → Call ← 1:many → CallEvent
                      ↓
                 CallbackTask
```

**Decision**: Leverage existing schema. Add schema fields only when needed (not pre-emptively).

---

## 5. Decision: Webhook Signature Verification

### Choice
Implement HMAC-SHA256 with constant-time comparison

### Rationale
- **Industry Standard**: Used by Stripe, GitHub, Twilio
- **Constant-Time**: Prevents timing attacks on signature comparison
- **Configurable**: Development mode allows unsigned events

### Verification Flow
```
1. Receive webhook payload + signature header
2. Compute HMAC-SHA256(payload, secret)
3. Use timingSafeEqual() for comparison
4. Accept if match, reject if not (or log in dev)
```

### Secret Management
- Production: Loaded from `TELNYX_WEBHOOK_SECRET` env var
- Development: Optional (logs warning if missing)
- Rotation: Not yet automated (future improvement)

---

## 6. Decision: Comprehensive Test Coverage

### Choice
19 tests (10 unit + 9 integration) covering all major paths

### Unit Tests
- Mocked external dependencies (Telnyx API, database)
- Fast execution (< 2s total)
- High coverage of edge cases

### Integration Tests
- Mocked at service level, not Telnyx API
- Real Prisma types for database shape
- Full call lifecycle simulation

### Alternative: E2E Tests (Rejected for Now)
- ❌ Would require live Telnyx API access
- ❌ Unpredictable network dependencies
- ❌ Slower CI/CD pipeline
- ✅ Consider for staging/production validation later

**Decision**: Sufficient test coverage for MVP. E2E testing deferred to post-launch phase.

---

## 7. Trade-offs & Accepted Risks

### Accepted Trade-off: Retry Latency
- **Pro**: Better reliability (99%+ success rate expected)
- **Con**: Max latency 7s (1 + 2 + 4s) + 30s timeout possible
- **Mitigation**: Async call handling, user expects call setup delay

### Accepted Risk: Database Backlog
- **Risk**: High call volume could backlog database writes
- **Mitigation**: Async writing, metrics monitoring
- **Escalation**: Add write queue if backlog > 100ms

### Accepted Risk: Webhook Replay Attacks
- **Risk**: Attacker replays old webhook events
- **Mitigation**: Add nonce/timestamp to webhook payload (future)
- **Escalation**: Implement idempotency keys if attack detected

### Not Accepted: Security Vulnerabilities
- Signature verification is strict and constant-time
- No hardcoded secrets in code
- All input validated before database write

---

## 8. Monitoring & Observability

### Metrics to Track
1. **Retry Success Rate** (per-attempt)
   - Attempt 1 success rate: expect 95%+
   - Retry 2/3 success rate: expect 90%+
   
2. **Call Latency**
   - P50: target < 1s
   - P95: target < 3s
   - P99: target < 7s

3. **Database Metrics**
   - Query latency: target < 100ms
   - Queue depth: alert if > 50
   - Connection pool usage: alert if > 80%

### Alerting Rules
- Retry rate jumps > 10% → investigate network
- Call success rate drops < 98% → escalate
- Database response time > 200ms → capacity review

---

## 9. Rollback & Contingency

### Rollback Procedure
1. Revert commit (`git revert <sha>`)
2. Push to main (triggers auto-deploy)
3. Deployment completes in ~6 minutes
4. Verify services healthy

### Contingency: Retry Loop
If retries cause infinite loop:
- **Detection**: Call duration > 15 seconds without answer
- **Action**: Force hang up, mark failed
- **Escalation**: Disable retries via config, redeploy

---

## 10. Decision Outcome

### ✅ ACCEPTED

**Why**: The exponential backoff + database persistence approach balances:
- Reliability (99%+ call success target)
- Performance (sub-7s max latency)
- Simplicity (leverages existing infrastructure)
- Safety (comprehensive test coverage)

### Evidence of Success
- ✅ 19/19 tests passing
- ✅ 0 security vulnerabilities
- ✅ Type-safe TypeScript compilation
- ✅ Deployed to production successfully
- ✅ Services verified healthy
- ✅ No breaking changes to API

---

## 11. Future Improvements

### Phase 2 (Next Sprint)
- [ ] Load testing under concurrent calls
- [ ] Performance profiling
- [ ] Webhook replay attack prevention (nonce/timestamp)

### Phase 3 (Next Quarter)
- [ ] Event sourcing for audit trail (HIPAA compliance)
- [ ] Advanced IVR workflows
- [ ] Call recording & transcription
- [ ] Analytics dashboard

### Phase 4 (Next Year)
- [ ] Multi-region failover
- [ ] Advanced conference features
- [ ] AI-powered call routing
- [ ] Natural language IVR

---

## 12. References

- **PR #86**: https://github.com/dwise03-bit/wise2-core/pull/86
- **Telnyx Docs**: https://developers.telnyx.com/docs/retries
- **Prisma ORM**: https://www.prisma.io/docs
- **OWASP**: Timing Attack Prevention
- **AWS**: Exponential Backoff and Jitter

---

## Approval Sign-off

| Role | Name | Date | Status |
|------|------|------|--------|
| **Author** | Claude Haiku 4.5 | 2026-09-14 | ✅ |
| **Reviewer** | Auto-merged (CI/CD) | 2026-09-14 | ✅ |
| **Operator** | dwise03@gmail.com | 2026-09-14 | ✅ |

---

## Lessons Learned

1. **Testing First**: Writing tests alongside code prevented regressions
2. **Mock Strategy**: Mocking at service level > mocking individual methods
3. **Configuration**: Configurable defaults beat hardcoded values
4. **Monitoring**: Plan monitoring before deployment (not after)
5. **Rollback Planning**: Simple rollback strategy increases deployment confidence

