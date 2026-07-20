# WISE² API Reference - v1

**Base URL**: http://localhost:3000 (dev) | https://api.wise2.net (prod)  
**API Version**: v1  
**Auth**: JWT Bearer Token

---

## Endpoints Summary

### Authentication (No Auth)
- POST /api/v1/auth/signup
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh

### Authentication (Requires Auth)
- POST /api/v1/auth/logout
- GET /api/v1/auth/profile
- PUT /api/v1/auth/profile

### Payments (Requires Auth)
- POST /api/v1/payments/create-order
- GET /api/v1/payments/orders
- GET /api/v1/payments/orders/:orderId
- POST /api/v1/payments/confirm
- POST /api/v1/payments/cancel/:orderId
- GET /api/v1/payments/products
- GET /api/v1/payments/products/:productId

### Files (Requires Auth)
- POST /api/v1/files/upload-url
- POST /api/v1/files/confirm
- GET /api/v1/files
- GET /api/v1/files/:fileId
- DELETE /api/v1/files/:fileId
- POST /api/v1/files/showcase
- GET /api/v1/files/showcase
- GET /api/v1/files/showcase/:assetId
- PUT /api/v1/files/showcase/:assetId
- DELETE /api/v1/files/showcase/:assetId
- GET /api/v1/files/showcase/featured (No Auth)

---

## Complete Documentation

See `/packages/db/migrations/` for database schema details.
See source code in `/services/api/src/routes/` for full endpoint implementation.

Key request/response examples in code comments.

---

**Status**: API fully functional and ready for testing
