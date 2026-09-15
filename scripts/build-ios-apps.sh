#!/bin/bash

##############################################################################
# WISE² iOS Apps - Build & Distribution Script
#
# Usage:
#   ./scripts/build-ios-apps.sh [app] [action]
#
# Examples:
#   ./scripts/build-ios-apps.sh blakkhail build          # Build Blakkhail
#   ./scripts/build-ios-apps.sh wise2-cc testflight      # Build WISE² CC for TestFlight
#   ./scripts/build-ios-apps.sh all archive              # Archive all apps
#   ./scripts/build-ios-apps.sh status                   # Show all app statuses
#
##############################################################################

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPS_DIR="$PROJECT_ROOT/apps"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# App definitions
declare -A APP_PATHS=(
  [blakkhail]="$APPS_DIR/blakkhail-ios"
  [wise2-cc]="$APPS_DIR/wise2-command-center-ios"
  [sencere]="$APPS_DIR/sencere-ios"
)

declare -A APP_SCHEMES=(
  [blakkhail]="Blakkhail"
  [wise2-cc]="WISE2"
  [sencere]="SenCere"
)

declare -A APP_BUNDLES=(
  [blakkhail]="com.sencere.blakkhail"
  [wise2-cc]="com.dwise954.wise2"
  [sencere]="com.sencere.creative"
)

# Team ID (unified across all apps)
TEAM_ID="FB042344774DE4FA29C74D7260790DD49A04F257"

##############################################################################
# Functions
##############################################################################

log_info() {
  echo -e "${BLUE}ℹ ${1}${NC}"
}

log_success() {
  echo -e "${GREEN}✓ ${1}${NC}"
}

log_error() {
  echo -e "${RED}✗ ${1}${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠ ${1}${NC}"
}

show_usage() {
  cat << EOF
Usage: $0 [app] [action]

Apps:
  blakkhail         - BLAKKHAIL eCommerce app
  wise2-cc          - WISE² Command Center
  sencere           - SenCere Creative Studio
  all               - All apps

Actions:
  build             - Build for simulator
  archive           - Create archive for distribution
  testflight        - Build and prepare for TestFlight
  status            - Show app status
  clean             - Clean build artifacts
  help              - Show this help message

Examples:
  $0 blakkhail build
  $0 wise2-cc testflight
  $0 all archive
  $0 status
EOF
}

check_app() {
  local app=$1
  if [[ -z "${APP_PATHS[$app]}" ]]; then
    log_error "Unknown app: $app"
    show_usage
    exit 1
  fi
}

app_status() {
  local app=$1
  local path="${APP_PATHS[$app]}"
  local scheme="${APP_SCHEMES[$app]}"

  log_info "Checking status of $app..."

  if [[ ! -d "$path" ]]; then
    log_error "App directory not found: $path"
    return 1
  fi

  # Check for project file
  local project=$(find "$path" -maxdepth 1 -name "*.xcodeproj" | head -1)
  if [[ -z "$project" ]]; then
    log_error "No .xcodeproj found in $path"
    return 1
  fi

  log_success "Project found: $(basename $project)"

  # Check for icon assets
  local icon_dir="$path/Assets.xcassets/AppIcon.appiconset"
  if [[ -d "$icon_dir" ]]; then
    local icon_count=$(find "$icon_dir" -name "*.png" | wc -l)
    if [[ $icon_count -gt 0 ]]; then
      log_success "App icons: $icon_count PNG files found"
    else
      log_warning "No app icons found in $icon_dir"
    fi
  fi

  # Check for main app file
  local main_app="$path/${APP_SCHEMES[$app]}App.swift"
  if [[ -f "$main_app" ]]; then
    log_success "Main app file found: $(basename $main_app)"
  fi

  echo ""
}

build_app() {
  local app=$1
  local path="${APP_PATHS[$app]}"
  local scheme="${APP_SCHEMES[$app]}"

  log_info "Building $app..."

  if [[ ! -d "$path" ]]; then
    log_error "App directory not found: $path"
    return 1
  fi

  cd "$path"

  local project=$(find . -maxdepth 1 -name "*.xcodeproj" | head -1)
  if [[ -z "$project" ]]; then
    log_error "No .xcodeproj found"
    return 1
  fi

  log_info "Building scheme: $scheme"
  xcodebuild build \
    -project "$project" \
    -scheme "$scheme" \
    -sdk iphonesimulator \
    -configuration Debug

  log_success "Build completed for $app"
}

archive_app() {
  local app=$1
  local path="${APP_PATHS[$app]}"
  local scheme="${APP_SCHEMES[$app]}"

  log_info "Creating archive for $app..."

  if [[ ! -d "$path" ]]; then
    log_error "App directory not found: $path"
    return 1
  fi

  cd "$path"

  local project=$(find . -maxdepth 1 -name "*.xcodeproj" | head -1)
  if [[ -z "$project" ]]; then
    log_error "No .xcodeproj found"
    return 1
  fi

  local archive_path="$PROJECT_ROOT/build/archives/${app}_$(date +%Y%m%d_%H%M%S).xcarchive"
  mkdir -p "$(dirname $archive_path)"

  log_info "Archiving to: $archive_path"
  xcodebuild archive \
    -project "$project" \
    -scheme "$scheme" \
    -archivePath "$archive_path" \
    -configuration Release \
    DEVELOPMENT_TEAM="$TEAM_ID"

  log_success "Archive created: $(basename $archive_path)"
}

testflight_build() {
  local app=$1

  log_info "Building $app for TestFlight..."

  # Archive the app
  archive_app "$app"

  log_info "Archive ready for TestFlight upload"
  log_warning "Manual step: Upload archive via Xcode or Transporter"
  log_info "1. Open $PROJECT_ROOT/build/archives/"
  log_info "2. Upload the .xcarchive using Transporter or Xcode"
}

clean_app() {
  local app=$1
  local path="${APP_PATHS[$app]}"

  log_info "Cleaning $app..."

  if [[ ! -d "$path" ]]; then
    log_error "App directory not found: $path"
    return 1
  fi

  cd "$path"

  local project=$(find . -maxdepth 1 -name "*.xcodeproj" | head -1)
  if [[ -z "$project" ]]; then
    log_error "No .xcodeproj found"
    return 1
  fi

  xcodebuild clean -project "$project"
  log_success "Clean completed for $app"
}

##############################################################################
# Main Script
##############################################################################

# Parse arguments
APP_ARG="${1:-help}"
ACTION_ARG="${2:-help}"

# Handle 'all' for multiple apps
if [[ "$APP_ARG" == "all" ]]; then
  for app in "${!APP_PATHS[@]}"; do
    if [[ "$ACTION_ARG" != "status" ]]; then
      log_info "Processing $app..."
    fi

    case "$ACTION_ARG" in
      build) build_app "$app" || true ;;
      archive) archive_app "$app" || true ;;
      testflight) testflight_build "$app" || true ;;
      clean) clean_app "$app" || true ;;
      status) app_status "$app" || true ;;
      help) show_usage ;;
      *) show_usage ;;
    esac
  done
  exit 0
fi

# Handle 'status' without app name
if [[ "$APP_ARG" == "status" ]]; then
  log_info "WISE² iOS Apps Status Report"
  log_info "=============================="
  for app in "${!APP_PATHS[@]}"; do
    app_status "$app"
  done
  exit 0
fi

# Handle help
if [[ "$APP_ARG" == "help" ]]; then
  show_usage
  exit 0
fi

# Validate app
check_app "$APP_ARG"

# Execute action
case "$ACTION_ARG" in
  build) build_app "$APP_ARG" ;;
  archive) archive_app "$APP_ARG" ;;
  testflight) testflight_build "$APP_ARG" ;;
  clean) clean_app "$APP_ARG" ;;
  status) app_status "$APP_ARG" ;;
  help) show_usage ;;
  *)
    log_error "Unknown action: $ACTION_ARG"
    show_usage
    exit 1
    ;;
esac

log_success "Done!"
