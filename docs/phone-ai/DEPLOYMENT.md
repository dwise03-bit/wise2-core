# Deployment and Rollback

Deploy the API through the existing WISE² deployment path after a build and migration review. Confirm the health endpoint, webhook TLS, Telnyx signature rejection, CRM writes, and a controlled test call before moving the number to the new endpoint.

Rollback is the existing application rollback plus restoring the prior Telnyx Voice API application webhook URL. Do not delete call records or rotate secrets during rollback. Rotate any credential that was exposed outside secret storage.
