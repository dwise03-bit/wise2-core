#!/bin/bash
# WISE² Passwordless Access Setup
# Enables SSH key-based auth for Surface, Mac, and remote control
# Run as: bash scripts/setup-passwordless-access.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   WISE² Passwordless Access Setup                      ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Variables
DWISE_USER="dwise"
DWISE_HOME="/home/$DWISE_USER"
SSH_DIR="$DWISE_HOME/.ssh"
AUTH_KEYS="$SSH_DIR/authorized_keys"
SURFACE_KEY_NAME="id_surface_ed25519"
SURFACE_KEY_PATH="$SSH_DIR/$SURFACE_KEY_NAME"
MAC_BRIDGE_KEY_NAME="id_mac_bridge"
MAC_BRIDGE_KEY_PATH="$SSH_DIR/$MAC_BRIDGE_KEY_NAME"
CLAUDE_KEY_NAME="id_claude_automation"
CLAUDE_KEY_PATH="$SSH_DIR/$CLAUDE_KEY_NAME"

# Colors for output
log() {
    echo -e "${GREEN}✓${NC} $1"
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# Ensure SSH directory exists
log "Setting up SSH directory at $SSH_DIR"
sudo mkdir -p "$SSH_DIR"
sudo chmod 700 "$SSH_DIR"
sudo chown "$DWISE_USER:$DWISE_USER" "$SSH_DIR"

# Ensure authorized_keys exists
log "Initializing authorized_keys"
sudo touch "$AUTH_KEYS"
sudo chmod 600 "$AUTH_KEYS"
sudo chown "$DWISE_USER:$DWISE_USER" "$AUTH_KEYS"

# Generate Surface SSH key
if [ ! -f "$SURFACE_KEY_PATH" ]; then
    log "Generating Surface SSH key (Ed25519)..."
    sudo ssh-keygen -t ed25519 -f "$SURFACE_KEY_PATH" -N "" -C "surface-dev@wise2" 2>/dev/null
    sudo chmod 600 "$SURFACE_KEY_PATH"
    sudo chmod 644 "$SURFACE_KEY_PATH.pub"
    sudo chown "$DWISE_USER:$DWISE_USER" "$SURFACE_KEY_PATH" "$SURFACE_KEY_PATH.pub"
    log "Surface key generated at $SURFACE_KEY_PATH"
else
    warn "Surface key already exists at $SURFACE_KEY_PATH"
fi

# Generate Mac Bridge SSH key
if [ ! -f "$MAC_BRIDGE_KEY_PATH" ]; then
    log "Generating Mac Bridge SSH key (Ed25519)..."
    sudo ssh-keygen -t ed25519 -f "$MAC_BRIDGE_KEY_PATH" -N "" -C "mac-bridge@wise2" 2>/dev/null
    sudo chmod 600 "$MAC_BRIDGE_KEY_PATH"
    sudo chmod 644 "$MAC_BRIDGE_KEY_PATH.pub"
    sudo chown "$DWISE_USER:$DWISE_USER" "$MAC_BRIDGE_KEY_PATH" "$MAC_BRIDGE_KEY_PATH.pub"
    log "Mac Bridge key generated at $MAC_BRIDGE_KEY_PATH"
else
    warn "Mac Bridge key already exists at $MAC_BRIDGE_KEY_PATH"
fi

# Generate Claude Automation key
if [ ! -f "$CLAUDE_KEY_PATH" ]; then
    log "Generating Claude Automation SSH key (Ed25519)..."
    sudo ssh-keygen -t ed25519 -f "$CLAUDE_KEY_PATH" -N "" -C "claude-automation@wise2" 2>/dev/null
    sudo chmod 600 "$CLAUDE_KEY_PATH"
    sudo chmod 644 "$CLAUDE_KEY_PATH.pub"
    sudo chown "$DWISE_USER:$DWISE_USER" "$CLAUDE_KEY_PATH" "$CLAUDE_KEY_PATH.pub"
    log "Claude Automation key generated at $CLAUDE_KEY_PATH"
else
    warn "Claude Automation key already exists at $CLAUDE_KEY_PATH"
fi

# Add public keys to authorized_keys
log "Adding public keys to authorized_keys..."

# Create temporary file with all keys
TEMP_AUTH_KEYS=$(mktemp)

# Copy existing keys (if any)
if [ -s "$AUTH_KEYS" ]; then
    sudo cat "$AUTH_KEYS" > "$TEMP_AUTH_KEYS"
fi

# Add new keys (remove duplicates first)
for key_file in "$SURFACE_KEY_PATH.pub" "$MAC_BRIDGE_KEY_PATH.pub" "$CLAUDE_KEY_PATH.pub"; do
    if [ -f "$key_file" ]; then
        KEY_CONTENT=$(cat "$key_file")
        # Check if key already exists
        if ! grep -q "$(echo "$KEY_CONTENT" | awk '{print $2}')" "$TEMP_AUTH_KEYS" 2>/dev/null; then
            echo "$KEY_CONTENT" >> "$TEMP_AUTH_KEYS"
            log "Added key from $(basename $key_file)"
        fi
    fi
done

# Replace authorized_keys atomically
sudo cp "$TEMP_AUTH_KEYS" "$AUTH_KEYS"
sudo chmod 600 "$AUTH_KEYS"
sudo chown "$DWISE_USER:$DWISE_USER" "$AUTH_KEYS"
rm -f "$TEMP_AUTH_KEYS"

# Setup passwordless sudo
log "Configuring passwordless sudo for $DWISE_USER..."
SUDOERS_FILE="/etc/sudoers.d/wise2-$DWISE_USER"

# Create sudoers file with restricted permissions
sudo tee "$SUDOERS_FILE" > /dev/null <<'EOF'
# WISE² Passwordless Sudo Rules
# Allow specific high-privilege commands without password

# Allow docker commands
dwise ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker-compose

# Allow systemd/service commands
dwise ALL=(ALL) NOPASSWD: /bin/systemctl, /bin/systemctl start, /bin/systemctl stop, /bin/systemctl restart, /bin/systemctl status

# Allow certificate renewal (Let's Encrypt)
dwise ALL=(ALL) NOPASSWD: /usr/bin/certbot, /usr/bin/certbot renew

# Allow SSH key management
dwise ALL=(ALL) NOPASSWD: /usr/bin/ssh-keygen

# Allow port operations
dwise ALL=(ALL) NOPASSWD: /usr/sbin/ss, /bin/netstat

# Allow mail server commands (Postfix/Dovecot)
dwise ALL=(ALL) NOPASSWD: /usr/sbin/postfix, /usr/bin/postfix, /usr/sbin/dovecot

# Allow disk/log operations
dwise ALL=(ALL) NOPASSWD: /usr/bin/df, /bin/du, /usr/bin/tail, /usr/bin/head, /bin/ls

EOF

sudo chmod 440 "$SUDOERS_FILE"
log "Passwordless sudo configured at $SUDOERS_FILE"

# Verify sudoers file
echo ""
log "Verifying sudoers configuration..."
sudo visudo -c -f "$SUDOERS_FILE" && log "Sudoers file is valid"

# Create SSH config for convenience
log "Creating SSH config for easy access..."
SSH_CONFIG="$DWISE_HOME/.ssh/config"

sudo tee "$SSH_CONFIG" > /dev/null <<EOF
# WISE² SSH Configuration

# Main VPS
Host wise2-vps
    HostName $(hostname -I | awk '{print $1}')
    User $DWISE_USER
    IdentityFile ~/.ssh/$CLAUDE_KEY_NAME
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

# Surface Remote
Host wise2-surface
    HostName 192.168.1.100
    User $DWISE_USER
    IdentityFile ~/.ssh/$SURFACE_KEY_NAME
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null

# Mac Bridge
Host wise2-mac
    HostName localhost
    Port 9999
    User $DWISE_USER
    IdentityFile ~/.ssh/$MAC_BRIDGE_KEY_NAME
    StrictHostKeyChecking no

EOF

sudo chmod 600 "$SSH_CONFIG"
sudo chown "$DWISE_USER:$DWISE_USER" "$SSH_CONFIG"
log "SSH config created at $SSH_CONFIG"

# Setup SSH agent forwarding for automation
log "Configuring SSH agent for automation..."
SSH_AGENT_CONFIG="$DWISE_HOME/.ssh/agent-setup.sh"

sudo tee "$SSH_AGENT_CONFIG" > /dev/null <<'EOF'
#!/bin/bash
# WISE² SSH Agent Setup
# Source this file to load SSH keys into agent

export SSH_KEY_DIR="$HOME/.ssh"
export SSH_KEYS=(
    "$SSH_KEY_DIR/id_surface_ed25519"
    "$SSH_KEY_DIR/id_mac_bridge"
    "$SSH_KEY_DIR/id_claude_automation"
)

# Start agent if not running
if [ -z "$SSH_AUTH_SOCK" ]; then
    eval "$(ssh-agent -s)" > /dev/null
fi

# Add all keys to agent
for key in "${SSH_KEYS[@]}"; do
    if [ -f "$key" ]; then
        ssh-add "$key" 2>/dev/null || true
    fi
done

echo "SSH agent configured with $(ssh-add -l | wc -l) keys"
EOF

sudo chmod 755 "$SSH_AGENT_CONFIG"
sudo chown "$DWISE_USER:$DWISE_USER" "$SSH_AGENT_CONFIG"
log "SSH agent setup script created"

# Display summary
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Setup Complete                                       ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}SSH Keys Generated:${NC}"
echo "  • Surface: $SURFACE_KEY_PATH"
echo "  • Mac Bridge: $MAC_BRIDGE_KEY_PATH"
echo "  • Claude Automation: $CLAUDE_KEY_PATH"
echo ""

echo -e "${YELLOW}Public Keys (add to other systems):${NC}"
for key_file in "$SURFACE_KEY_PATH.pub" "$MAC_BRIDGE_KEY_PATH.pub" "$CLAUDE_KEY_PATH.pub"; do
    if [ -f "$key_file" ]; then
        echo ""
        echo "$(basename $key_file):"
        sudo cat "$key_file"
    fi
done
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Copy Surface public key to Surface device ~/.ssh/authorized_keys"
echo "  2. Copy Mac Bridge key to Mac ~/.ssh/authorized_keys"
echo "  3. Test passwordless SSH:"
echo "     ssh -i $SURFACE_KEY_PATH $DWISE_USER@$(hostname -I | awk '{print $1}')"
echo ""

log "Passwordless access setup complete!"
