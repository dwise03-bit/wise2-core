# Security Policy

## Reporting Vulnerabilities

**Do NOT open public GitHub issues for security vulnerabilities.**

Instead, report security vulnerabilities privately:

1. **Email:** security@wise2.net
2. **Include:**
   - Description of the vulnerability
   - Affected component/version
   - Proof of concept or reproduction steps
   - Suggested fix (if available)
   - Your contact information for follow-up

We will acknowledge receipt within 48 hours and provide updates as we work to resolve the issue.

---

## Security Standards

### Code Security

- **Input Validation** — All user input validated at system boundaries
- **Authentication** — JWT tokens for API authentication
- **Authorization** — Role-based access control (RBAC) on protected endpoints
- **Secrets Management** — Environment variables, never hardcoded
- **Dependency Updates** — Automated scanning via Dependabot
- **Code Scanning** — GitHub Actions configured for SAST

### Infrastructure Security

- **Network Isolation** — Docker services on isolated network (wise2-network)
- **Container Security** — Multi-stage builds, minimal base images
- **Database Security** — PostgreSQL with strong passwords, encrypted connections
- **SSL/TLS** — HTTPS only in production via Let's Encrypt
- **Reverse Proxy** — Nginx with security headers configured

### Data Protection

- **No Sensitive Logs** — Sensitive data never logged
- **Encryption in Transit** — TLS 1.3 for all communications
- **Access Logs** — Monitored for suspicious activity
- **Data Retention** — Defined policies for PII and user data

---

## Security Checklist

Before each deployment:

- [ ] All dependencies updated and scanned
- [ ] No hardcoded secrets in code
- [ ] Environment variables configured correctly
- [ ] Database credentials secure
- [ ] SSL/TLS certificates valid
- [ ] Access logs reviewed for anomalies
- [ ] Database backups current
- [ ] Secrets rotation completed (if applicable)

---

## Dependency Management

### Updates

- **Critical vulnerabilities** — patched within 24 hours
- **High vulnerabilities** — patched within 72 hours
- **Medium vulnerabilities** — patched within 2 weeks
- **Low vulnerabilities** — reviewed in regular updates

### Audit

Regular dependency audits via:
```bash
npm audit
npm audit fix
```

### Locked Dependencies

All production deployments use locked dependency versions (`package-lock.json` or `pnpm-lock.yaml`) to ensure consistency and prevent supply chain attacks.

---

## Authentication & Authorization

### API Security

- **OAuth 2.0** for third-party integrations
- **JWT tokens** for session management
- **API key rotation** every 90 days
- **Rate limiting** on sensitive endpoints
- **CORS** configured restrictively

### Password Policy

- Minimum 12 characters
- Complexity required (uppercase, lowercase, numbers, symbols)
- No password reuse (last 12 passwords)
- Expiration every 90 days
- Bcrypt hashing with salt rounds ≥ 12

---

## Monitoring & Logging

### Logs Monitored

- Failed authentication attempts
- Unauthorized access attempts
- Database queries for anomalies
- Deployment activity
- Configuration changes

### Retention

- Application logs: 90 days
- Security logs: 1 year
- Access logs: 6 months

---

## Incident Response

### Suspected Breach

1. **Isolate** — Take affected systems offline
2. **Assess** — Determine scope and impact
3. **Notify** — Alert security team immediately
4. **Investigate** — Root cause analysis
5. **Remediate** — Fix vulnerability and retest
6. **Communicate** — Notify affected parties per policy
7. **Document** — Post-incident review and improvements

### Timeline

- **Detection to Response:** ≤ 1 hour
- **Investigation:** ≤ 24 hours
- **Notification:** ≤ 72 hours (if user data affected)
- **Fix Verification:** ≤ 7 days

---

## Third-Party Security

### Vendor Assessment

All third-party services assessed for:
- Security certifications (SOC 2, ISO 27001, etc.)
- Data protection practices
- Incident response procedures
- Audit rights and compliance

### Integrations

- **Resend** (email) — SOC 2 Type II certified
- **Stripe** (payments) — PCI DSS Level 1 certified
- **GitHub** (VCS) — Enterprise-grade security

---

## Compliance

### Standards

- **OWASP Top 10** — All recommendations addressed
- **NIST Cybersecurity Framework** — Implemented across all tiers
- **ISO 27001** — Roadmap for certification

### Certifications

- Self-assessed: OWASP Top 10 compliance
- Planned: SOC 2 Type II (2027)
- Planned: ISO 27001 (2027)

---

## Security Advisories

Subscribe to security advisories:

- **Node.js Security:** https://nodejs.org/en/blog/
- **npm Security:** npm audit notifications
- **GitHub Security:** Dependabot alerts
- **WISE² Security:** security@wise2.net

---

## Security Contacts

- **Security Team Lead:** Daniel Wise (dwise03@gmail.com)
- **General Questions:** security@wise2.net
- **Incident Response:** Page on-call security engineer

---

## Policy Updates

This policy is reviewed and updated quarterly. Last updated: **2026-07-11**

Changes require approval from the Security Team Lead.

---

**Report vulnerabilities responsibly.** Thank you for helping keep WISE² secure.

