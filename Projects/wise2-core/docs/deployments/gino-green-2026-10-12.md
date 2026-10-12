# Gino Green deployment — October 12, 2026

Production: https://wise2.net/gino-green/

Server: `gpu-nmls`, accessed through the existing `wise2-gpu` SSH alias.

## Repair

Public TCP 443 is redirected to 8443 by existing firewall rules. Nginx had no wise2.net TLS virtual host on 8443, so external visitors received a certificate for another domain and Cloudflare returned 526. The wise2.net certificate itself was valid through December 27, 2026.

Added wise2.net to the existing 8443 listener, preserved its public-IP-specific 443 binding to avoid the Tailscale listener, and moved an accidentally enabled backup configuration outside sites-enabled. Reload passed. No DNS, Cloudflare SSL mode, firewall rules, other site configurations, or application containers were changed.

Published the existing `/var/www/cloud.wise2.net/gino-green.html` preview atomically to `/var/www/wise2.net/gino-green/index.html`. This is the animated concept preview, not a verified approved original or a working store. Its deployed source is preserved in `gino-green-live.html` alongside this record.

The slashless route redirects to HTTPS without exposing the internal port. Missing assets return 404.

## Verification

- Public production and www production Gino routes: 200.
- Direct origin HTTPS with hostname validation: 200.
- WISE² root, Prompt Shop, Pixel Slate, cloud root and Blakkhail public HTTPS: 200.
- Other configured HTTP virtual hosts retained baseline responses: cloud 301, Blakkhail 200, EDT 404, Petals/Potions 200.
- EDT public DNS and Petals/Potions public TLS had pre-existing failures; these were not repaired by this deployment.
- certbot.timer is enabled and active. The old shared certificate renewal simulation failed for www with a Cloudflare 522 during temporary Nginx challenge configuration.
- Added persistent HTTP and HTTPS ACME challenge locations rooted at `/var/www/wise2-acme` to the main virtual host. Both public names returned the probe successfully.
- Issued a dedicated `wise2-main` certificate for wise2.net and www.wise2.net using webroot verification, expiring January 10, 2027. The main virtual host now uses this certificate; other certificate consumers remain unchanged.
- Added `/etc/letsencrypt/renewal-hooks/deploy/wise2-main-reload` to test and reload Nginx after this certificate renews.
- Dedicated certificate renewal simulation passed.
- A later Blakkhail public recheck timed out after an earlier successful 200; no Blakkhail configuration was changed. Network/SSH access was intermittently slow during the audit.

## Rollback

Server backups: `/var/backups/wise2-gino-20261012T065737Z/`.

Restore its `wise2.net.conf` to `/etc/nginx/sites-enabled/wise2.net.conf` and its `index.html` to `/var/www/wise2.net/gino-green/index.html`, then test and reload Nginx. The backed-up configuration contained a wildcard 443 binding that caused reload failures, so reverting it verbatim requires correcting that binding. Keep `wise2.net.conf.backup-20261011` outside sites-enabled to avoid duplicate virtual hosts.

This repairs persistent configuration but does not guarantee perpetual availability. Preserve the existing 443-to-8443 forwarding and certificate renewal timer.
