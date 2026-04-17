# Pre-Deployment Security Checklist

Use this checklist before deploying PDV System to production.

## Critical Items

### Secrets Management
- [ ] Generate strong SESSION_SECRET (32+ random characters)
- [ ] Generate strong CSRF_SECRET (different from SESSION_SECRET)
- [ ] Copy `.env.example` to `.env` and fill values
- [ ] Verify `.env` is in `.gitignore` (never commit secrets)
- [ ] Verify no secrets are hardcoded in source code

### Environment Configuration
- [ ] Set `NODE_ENV=production`
- [ ] Set `DEBUG_ERRORS=false` (prevents stack traces in responses)
- [ ] Set `SECURITY_REPORT_ONLY=false` (enforce CSP)
- [ ] Configure `API_BASE_URL` for production backend

### Security Headers
- [ ] Verify CSP meta tags are present in `index.html`
- [ ] Test CSP doesn't block legitimate resources
- [ ] Confirm `X-Frame-Options: DENY` (prevents clickjacking)
- [ ] Confirm `X-Content-Type-Options: nosniff`
- [ ] Confirm `Referrer-Policy: strict-origin-when-cross-origin`

### Dependencies
- [ ] Run `npm audit` and fix all **critical** vulnerabilities
- [ ] Run `npm audit` and review **high** severity issues
- [ ] Update all dependencies to latest secure versions
- [ ] Verify Zod and DOMPurify are properly loaded from CDN

## Security Features

### Input Validation
- [ ] Test product validation with invalid data
- [ ] Test quantity bounds (1-999)
- [ ] Test price validation (positive numbers only)
- [ ] Verify validation errors are user-friendly

### XSS Protection
- [ ] Test XSS payload: `<script>alert('xss')</script>`
- [ ] Test event handler: `<img src=x onerror=alert('xss')>`
- [ ] Verify innerHTML uses in app.js use sanitization
- [ ] Confirm textContent is used where possible

### CSRF Protection
- [ ] Verify CSRF token is generated on page load
- [ ] Test that POST requests include CSRF header
- [ ] Test that form submissions include CSRF token
- [ ] Verify cookie has `SameSite=Strict` attribute

### Rate Limiting
- [ ] Test cart operations limit (30/min)
- [ ] Test checkout limit (5/min)
- [ ] Test search limit (10/min)
- [ ] Verify rate limit exceeded shows user-friendly message

### Error Handling
- [ ] Test error responses don't include stack traces
- [ ] Verify error logs don't contain secrets/passwords
- [ ] Confirm generic error messages for users
- [ ] Test XSS payload in error messages is sanitized

### File Upload (if applicable)
- [ ] Test upload of file > 5MB is rejected
- [ ] Test upload of `.exe` file is rejected
- [ ] Test upload of file with double extension (`file.jpg.exe`)
- [ ] Verify filename sanitization removes path traversal (`../file.jpg`)

## Testing

### Manual Security Testing
- [ ] Navigate through all views as logged-in user
- [ ] Attempt to access admin features as regular user
- [ ] Test session timeout behavior
- [ ] Verify logout clears all session data

### Browser Testing
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)

### Responsive Testing
- [ ] Test on mobile viewport (320px-767px)
- [ ] Test on tablet viewport (768px-1023px)
- [ ] Test on desktop viewport (1024px+)

## Infrastructure

### HTTPS
- [ ] Verify site loads only via HTTPS in production
- [ ] Check for mixed content warnings (HTTP resources on HTTPS page)
- [ ] Confirm cookies have `Secure` flag in production

### Server Configuration
- [ ] Configure server-level security headers (if applicable)
- [ ] Set up proper CORS policy
- [ ] Configure rate limiting at server level (if applicable)
- [ ] Set up monitoring and alerting

## Documentation
- [ ] Review SECURITY.md is up to date
- [ ] Verify environment variables are documented
- [ ] Confirm incident response process is defined
- [ ] Document how to report security issues

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Security Reviewer | | | |
| QA Lead | | | |
| DevOps | | | |

## Post-Deployment

After deployment:
- [ ] Monitor error logs for security issues
- [ ] Set up CSP violation reporting
- [ ] Enable security monitoring/alerting
- [ ] Schedule security review in 30 days

---

**Version:** 1.0  
**Last Updated:** 2026-04-17  
**Change:** Initial security checklist for PDV System
