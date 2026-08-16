#!/bin/bash

echo "🚀 Starting V6 One-Click Install..."

# update system
sudo apt update -y && sudo apt upgrade -y

# install basics
sudo apt install -y git curl build-essential

# install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# install PM2
sudo npm install -g pm2

# clone repo
cd ~
git clone https://github.com/dwise03-bit/wise-defense-saas.git

cd wise-defense-saas

# install engine deps
cd deploy-engine
npm install express

# start engine
pm2 start engine.js --name v6-engine
pm2 save

# enable startup
pm2 startup || true

echo "✅ V6 INSTALL COMPLETE"
echo "👉 Run: curl http://localhost:4000/health"
