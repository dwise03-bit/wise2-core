# Nginx Configuration Fix - HTTPS Redirect Removal

**Issue**: HTTP requests to http://blakkhail.com/sencere/blakkhail were being redirected to HTTPS (port 443), which is blocked by a kernel socket state issue. This caused all client requests to fail.

**Solution**: Removed the HTTP→HTTPS redirect from Nginx configuration. The server now serves HTTP requests directly on port 80.

**Configuration Applied**:
- Removed `return 301 https://...` redirect
- Server now listens on port 80 and proxies directly to port 3001
- HTTPS not available (port 443 blocked by kernel issue)
- HTTP works perfectly for Blakkhail storefront

**Status**: ✅ FIXED
- Access: http://blakkhail.com/sencere/blakkhail
- Response: 200 OK (full page rendering)
- Clients: Can now access without errors

**Testing**: 
```bash
curl http://blakkhail.com/sencere/blakkhail
# Returns: SenCere Creative LLC | Blakk Hail page
```

**Note**: HTTPS remains unavailable due to kernel-level port 443 blocking. This is a known issue documented in the port audit (kernel socket state limbo). Users should use HTTP for now.
