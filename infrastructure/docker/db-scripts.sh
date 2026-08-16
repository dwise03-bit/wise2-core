#!/bin/bash
# WISE² Database Management Scripts
# Provides common database operations for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
DB_CONTAINER="wise2-postgres-prod"
DB_USER="${POSTGRES_APP_USER:-wise2_prod_user}"
DB_NAME="wise2_core_prod"
BACKUP_DIR="./backups"
RETENTION_DAYS=30

# Help function
show_help() {
    cat << EOF
WISE² Database Management Scripts

Usage: $0 <command> [options]

Commands:
  backup              Create database backup
  restore <file>      Restore database from backup
  health              Check database health status
  tables              List all tables in database
  query <sql>         Execute SQL query
  vacuum              Run VACUUM FULL ANALYZE
  analyze             Analyze query performance
  slow-queries        Show top slow queries
  connection-count    Show active connections
  table-sizes         Show table sizes
  index-unused        Show unused indexes
  reindex             Reindex all tables
  vacuum-analyze      Run maintenance (VACUUM + ANALYZE)
  reset               Reset database (WARNING: deletes data!)
  help                Show this help message

Examples:
  $0 backup
  $0 restore ./backups/wise2_db_20260716_120000.sql.gz
  $0 health
  $0 query "SELECT COUNT(*) FROM users;"
  $0 slow-queries
  $0 table-sizes

Environment Variables:
  POSTGRES_APP_USER      Application user (default: wise2_prod_user)
  POSTGRES_APP_PASSWORD  Application password (required)

EOF
}

# Check if compose file exists
check_compose_file() {
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        echo -e "${RED}Error: $COMPOSE_FILE not found${NC}"
        exit 1
    fi
}

# Check if container is running
check_container() {
    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "$DB_CONTAINER"; then
        echo -e "${RED}Error: Database container is not running${NC}"
        echo "Start with: docker-compose -f $COMPOSE_FILE up -d postgres"
        exit 1
    fi
}

# Backup database
backup() {
    check_compose_file
    check_container

    echo -e "${BLUE}Creating database backup...${NC}"

    mkdir -p "$BACKUP_DIR"

    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/wise2_db_$timestamp.sql.gz"

    docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" | \
        gzip > "$backup_file"

    if [ $? -eq 0 ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        echo -e "${GREEN}Backup successful: $backup_file ($size)${NC}"

        # Clean old backups
        echo -e "${BLUE}Removing backups older than $RETENTION_DAYS days...${NC}"
        find "$BACKUP_DIR" -name "wise2_db_*.sql.gz" -mtime "+$RETENTION_DAYS" -delete
    else
        echo -e "${RED}Backup failed${NC}"
        exit 1
    fi
}

# Restore database
restore() {
    local backup_file="$1"

    if [[ -z "$backup_file" ]]; then
        echo -e "${RED}Error: Backup file not specified${NC}"
        echo "Usage: $0 restore <backup_file>"
        exit 1
    fi

    if [[ ! -f "$backup_file" ]]; then
        echo -e "${RED}Error: Backup file not found: $backup_file${NC}"
        exit 1
    fi

    check_compose_file
    check_container

    echo -e "${YELLOW}WARNING: This will restore the database from backup${NC}"
    echo "Backup file: $backup_file"
    read -p "Continue? (yes/no): " confirm

    if [[ "$confirm" != "yes" ]]; then
        echo "Restore cancelled"
        exit 0
    fi

    echo -e "${BLUE}Restoring database from backup...${NC}"

    # Stop API to prevent connections
    echo "Stopping API container..."
    docker-compose -f "$COMPOSE_FILE" stop api 2>/dev/null || true

    # Restore database
    gunzip < "$backup_file" | \
        docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Restore successful${NC}"
        echo "Starting API container..."
        docker-compose -f "$COMPOSE_FILE" up -d api
    else
        echo -e "${RED}Restore failed${NC}"
        exit 1
    fi
}

# Check database health
health() {
    check_compose_file
    check_container

    echo -e "${BLUE}Checking database health...${NC}"

    # Check admin user
    docker exec "$DB_CONTAINER" pg_isready -U postgres -h localhost -p 5432
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Admin user (postgres): Connected${NC}"
    else
        echo -e "${RED}Admin user (postgres): Failed${NC}"
    fi

    # Check app user
    docker exec "$DB_CONTAINER" pg_isready -U "$DB_USER" -h localhost -p 5432 -d "$DB_NAME"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}App user ($DB_USER): Connected${NC}"
    else
        echo -e "${RED}App user ($DB_USER): Failed${NC}"
    fi

    # Check database exists
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Database ($DB_NAME): Accessible${NC}"
    else
        echo -e "${RED}Database ($DB_NAME): Not accessible${NC}"
    fi
}

# List tables
tables() {
    check_container

    echo -e "${BLUE}Tables in $DB_NAME:${NC}"
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "\dt"
}

# Execute SQL query
query() {
    local sql="$1"

    if [[ -z "$sql" ]]; then
        echo -e "${RED}Error: SQL query not specified${NC}"
        echo "Usage: $0 query \"SELECT COUNT(*) FROM users;\""
        exit 1
    fi

    check_container

    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "$sql"
}

# Vacuum analysis
vacuum() {
    check_container

    echo -e "${BLUE}Running VACUUM FULL ANALYZE (this may take a while)...${NC}"
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
        -c "VACUUM FULL ANALYZE;"

    echo -e "${GREEN}Vacuum complete${NC}"
}

# Analyze performance
analyze() {
    check_container

    echo -e "${BLUE}Analyzing query performance...${NC}"
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
        -c "ANALYZE;"

    echo -e "${GREEN}Analysis complete${NC}"
}

# Show slow queries
slow_queries() {
    check_container

    echo -e "${BLUE}Top 10 slowest queries:${NC}"
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT query, calls, mean_time::numeric(10,2) FROM pg_stat_statements
         ORDER BY mean_time DESC LIMIT 10;"
}

# Show connection count
connection_count() {
    check_container

    echo -e "${BLUE}Active connections:${NC}"
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT datname, usename, count(*) FROM pg_stat_activity
         GROUP BY datname, usename;"
}

# Show table sizes
table_sizes() {
    check_container

    echo -e "${BLUE}Table sizes:${NC}"
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT schemaname, tablename,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
         FROM pg_tables
         WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
         ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
}

# Show unused indexes
index_unused() {
    check_container

    echo -e "${BLUE}Unused indexes:${NC}"
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT schemaname, tablename, indexname, idx_scan
         FROM pg_stat_user_indexes
         WHERE idx_scan = 0
         ORDER BY pg_relation_size(indexrelid) DESC;"
}

# Reindex tables
reindex() {
    check_container

    echo -e "${YELLOW}WARNING: Reindexing may lock tables temporarily${NC}"
    read -p "Continue? (yes/no): " confirm

    if [[ "$confirm" != "yes" ]]; then
        echo "Reindex cancelled"
        exit 0
    fi

    echo -e "${BLUE}Reindexing database (this may take a while)...${NC}"
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
        -c "REINDEX DATABASE $DB_NAME;"

    echo -e "${GREEN}Reindex complete${NC}"
}

# Vacuum and analyze
vacuum_analyze() {
    echo -e "${BLUE}Running VACUUM and ANALYZE...${NC}"
    vacuum
    analyze
    echo -e "${GREEN}Maintenance complete${NC}"
}

# Reset database (WARNING!)
reset() {
    check_container

    echo -e "${RED}WARNING: This will DELETE ALL DATA from the database!${NC}"
    echo "This cannot be undone unless you have a backup."
    read -p "Type 'yes-reset-database' to confirm: " confirm

    if [[ "$confirm" != "yes-reset-database" ]]; then
        echo "Reset cancelled"
        exit 0
    fi

    echo -e "${BLUE}Stopping API...${NC}"
    docker-compose -f "$COMPOSE_FILE" stop api 2>/dev/null || true

    echo -e "${BLUE}Resetting database...${NC}"
    docker-compose -f "$COMPOSE_FILE" down postgres 2>/dev/null || true
    docker volume rm wise2-core_postgres_data wise2-core_postgres_wal 2>/dev/null || true

    echo -e "${BLUE}Starting fresh database...${NC}"
    docker-compose -f "$COMPOSE_FILE" up -d postgres

    echo -e "${BLUE}Waiting for initialization...${NC}"
    sleep 10

    docker-compose -f "$COMPOSE_FILE" logs postgres | tail -20

    echo -e "${BLUE}Starting API...${NC}"
    docker-compose -f "$COMPOSE_FILE" up -d api

    echo -e "${GREEN}Database reset complete${NC}"
}

# Main command handler
main() {
    local command="$1"

    case "$command" in
        backup)
            backup
            ;;
        restore)
            restore "$2"
            ;;
        health)
            health
            ;;
        tables)
            tables
            ;;
        query)
            query "$2"
            ;;
        vacuum)
            vacuum
            ;;
        analyze)
            analyze
            ;;
        slow-queries)
            slow_queries
            ;;
        connection-count)
            connection_count
            ;;
        table-sizes)
            table_sizes
            ;;
        index-unused)
            index_unused
            ;;
        reindex)
            reindex
            ;;
        vacuum-analyze)
            vacuum_analyze
            ;;
        reset)
            reset
            ;;
        help|--help|-h|"")
            show_help
            ;;
        *)
            echo -e "${RED}Unknown command: $command${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
