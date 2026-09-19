# Production Deployment Verification Invariant

## Decision

Every WISE² client project deployment must use one canonical runtime compose path per host. The reverse proxy upstream port must be verified against the running container's published host port after deployment; compose-file intent is not sufficient.

## Required release gate

1. Identify the compose file and project that owns the live container.
2. Confirm the container is running and healthy.
3. Confirm the host port mapping with `docker inspect` or `docker compose ps`.
4. Confirm the active Nginx virtual host and `proxy_pass` with `nginx -T`.
5. Test the exact public page URL repeatedly, including during the post-restart window.
6. Test every public API route the page depends on repeatedly and verify the response body/status.
7. Do not report completion while any request returns 502, 5xx, connection refused, or while competing deployment processes can recreate the service with a different port.

## Incident that prompted this decision

On 2026-09-19, Ray-Ban intermittently returned 502 because different deployment paths alternated the website between host ports 3000 and 3001 while Nginx configurations also differed. A healthy Docker container therefore did not prove public availability. The capture proxy also had two independent issues: it appended `/api` twice when the configured API URL already contained `/api`, and its build-time fallback ignored the runtime internal API URL.

## Scope

This invariant applies to every WISE² website, dashboard, client project, subdomain, and API gateway—not only Ray-Ban.
