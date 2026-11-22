# WISE² Commander MCP (development)

A **stdio MCP server** for local MCP clients, using Node.js 20+ with no third-party dependencies. This is not yet a remotely hosted ChatGPT connector.

## Tools
- commander_status: local configuration
- github_repository: allowlisted repository metadata
- infrastructure_health: GitHub Actions evidence, **not live host health**
- hermes_health: optional HTTPS health check with hostname allowlist
- deployment_status: GitHub Actions run evidence
- dispatch_deployment: disabled by default, allowlisted workflow + approval required

## Run
```bash
cd tools/wise2-commander
node --test test.mjs
GITHUB_TOKEN=... node server.mjs
```

Pass MCP JSON-RPC newline-delimited requests on stdin. Example: `{"jsonrpc":"2.0","id":1,"method":"tools/list"}`.

## Configuration
`GITHUB_TOKEN` should be a least-privilege fine-grained token with read access to selected repositories and Actions. `WISE2_GITHUB_OWNER` defaults to dwise03-bit.

For Hermes, set `WISE2_HERMES_HEALTH_URL=https://<approved-host>/health` and `WISE2_ALLOWED_HEALTH_HOSTS=<approved-host>`. Never put credentials in URLs.

Deployment dispatch is **off** unless `WISE2_ENABLE_DISPATCH=true`. Also require `WISE2_ALLOWED_WORKFLOWS` (comma-separated workflow filenames) and `WISE2_DISPATCH_APPROVAL` (secret approval value). The GitHub token must have Actions write permission for dispatch. Do not enable this in an untrusted or public endpoint.

## ChatGPT integration next steps
ChatGPT's remote MCP integration needs an HTTPS-accessible MCP transport, authentication, trusted domain, and connector registration. This stdio prototype cannot be installed directly as a ChatGPT remote plugin. Build and independently security-test an authenticated Streamable HTTP gateway before registering it. Do not expose stdio directly to the Internet.

## Safety
No shell access. No direct production mutation. Never claim a workflow dispatch means deployment succeeded. Do not remove Desktop Commander until the replacement passes real end-to-end tests.
