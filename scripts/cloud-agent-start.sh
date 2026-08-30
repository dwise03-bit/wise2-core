#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="/workspace/scripts/docker-compose.cloud-agent.yml"

docker_cmd() {
  if docker info >/dev/null 2>&1; then
    docker "$@"
  else
    sudo docker "$@"
  fi
}

ensure_docker_daemon() {
  if docker_cmd info >/dev/null 2>&1; then
    return 0
  fi

  sudo mkdir -p /etc/docker
  if [ ! -f /etc/docker/daemon.json ]; then
    echo '{"storage-driver": "fuse-overlayfs"}' | sudo tee /etc/docker/daemon.json >/dev/null
  fi

  if ! pgrep -x dockerd >/dev/null; then
    sudo dockerd --iptables=false >/tmp/dockerd.log 2>&1 &
  fi

  for _ in $(seq 1 30); do
    if docker_cmd info >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "Docker daemon failed to start" >&2
  return 1
}

wait_for_postgres() {
  for _ in $(seq 1 30); do
    if docker_cmd compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "PostgreSQL failed readiness check" >&2
  return 1
}

postgres_ready() {
  docker_cmd compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U postgres >/dev/null 2>&1
}

ensure_docker_daemon

if postgres_ready; then
  exit 0
fi

docker_cmd compose -f "$COMPOSE_FILE" up -d
wait_for_postgres
