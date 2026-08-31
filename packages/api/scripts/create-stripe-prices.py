#!/usr/bin/env python3
"""Create WISE² Cloud Stripe products/prices and update packages/api/.env."""

from __future__ import annotations

import json
import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ENV_PATH = Path(__file__).resolve().parents[1] / ".env"

PLANS = [
    ("starter", "Starter", 1900, "WISE² Cloud Starter hosting ($19/mo)"),
    ("business", "Business", 3900, "WISE² Cloud Business hosting ($39/mo)"),
    ("pro", "Pro", 5900, "WISE² Cloud Pro hosting ($59/mo)"),
]


def load_env(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values
    for line in path.read_text().splitlines():
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        values[key.strip()] = val.strip().strip('"')
    return values


def stripe_request(api_key: str, method: str, path: str, data: dict) -> dict:
    body = urllib.parse.urlencode(data).encode() if data else None
    request = urllib.request.Request(
        f"https://api.stripe.com/v1{path}",
        data=body,
        method=method,
        headers={"Authorization": f"Bearer {api_key}"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode())


def main() -> None:
    env = load_env(ENV_PATH)
    api_key = env.get("STRIPE_SECRET_KEY") or env.get("STRIPE_LIVE_RESTRICTED_KEY")
    if not api_key:
        raise SystemExit("Missing STRIPE_SECRET_KEY or STRIPE_LIVE_RESTRICTED_KEY in packages/api/.env")

    updates: dict[str, str] = {}
    for slug, name, amount, description in PLANS:
        product = stripe_request(
            api_key,
            "POST",
            "/products",
            {
                "name": f"WISE² Cloud {name}",
                "description": description,
                "metadata[product]": "cloud",
                "metadata[planId]": slug,
            },
        )
        price = stripe_request(
            api_key,
            "POST",
            "/prices",
            {
                "product": product["id"],
                "unit_amount": str(amount),
                "currency": "usd",
                "recurring[interval]": "month",
                "metadata[product]": "cloud",
                "metadata[planId]": slug,
            },
        )
        env_key = f"STRIPE_CLOUD_{slug.upper()}_PRICE_ID"
        updates[env_key] = price["id"]
        print(f"{env_key}={price['id']}")

    text = ENV_PATH.read_text() if ENV_PATH.exists() else ""
    for key, val in updates.items():
        if re.search(rf"^{key}=", text, re.M):
            text = re.sub(rf"^{key}=.*$", f"{key}={val}", text, flags=re.M)
        else:
            text += f"\n{key}={val}\n"
    ENV_PATH.write_text(text)
    print("Updated packages/api/.env with Stripe price IDs")


if __name__ == "__main__":
    try:
        main()
    except urllib.error.HTTPError as error:
        body = error.read().decode()
        raise SystemExit(f"Stripe API error {error.code}: {body}") from error
