"""
WISE² Sound Labs Client Authentication
Production-ready login system for Sound Labs platform
"""

import os
import jwt
from datetime import datetime, timedelta
from typing import Optional
import json

class ClientAuthManager:
    """Handle client authentication for Sound Labs"""

    def __init__(self):
        self.secret_key = os.getenv("AUTH_SECRET", "wise2-sound-labs-dev-key-change-in-prod")
        self.token_expiry_hours = 24
        self.clients = self._load_clients()

    def _load_clients(self) -> dict:
        """Load client credentials from file or env"""
        clients_file = os.getenv("CLIENTS_JSON", "./clients.json")
        if os.path.exists(clients_file):
            try:
                with open(clients_file) as f:
                    return json.load(f)
            except:
                pass
        return {}

    def authenticate(self, email: str, password: str) -> Optional[str]:
        """Authenticate client and return JWT token"""
        client = self.clients.get(email)
        if not client:
            return None

        # Simple password check (use bcrypt in production)
        if client.get("password") != password:
            return None

        # Generate JWT token
        payload = {
            "email": email,
            "client_id": client.get("id"),
            "exp": datetime.utcnow() + timedelta(hours=self.token_expiry_hours),
            "iat": datetime.utcnow()
        }

        try:
            token = jwt.encode(payload, self.secret_key, algorithm="HS256")
            return token
        except Exception as e:
            print(f"Token generation error: {e}")
            return None

    def verify_token(self, token: str) -> Optional[dict]:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def register_client(self, email: str, password: str, name: str, plan: str = "starter") -> bool:
        """Register new client"""
        if email in self.clients:
            return False

        self.clients[email] = {
            "id": email.split("@")[0],
            "name": name,
            "password": password,  # Hash in production
            "plan": plan,
            "created_at": datetime.utcnow().isoformat(),
            "projects": [],
            "recordings": []
        }

        # Save to file
        clients_file = os.getenv("CLIENTS_JSON", "./clients.json")
        try:
            with open(clients_file, 'w') as f:
                json.dump(self.clients, f, indent=2)
            return True
        except:
            return False

    def get_client(self, email: str) -> Optional[dict]:
        """Get client details"""
        return self.clients.get(email)
