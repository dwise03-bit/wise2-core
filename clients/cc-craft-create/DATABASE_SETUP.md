# CC Craft & Create - Database Setup Guide

## Prerequisites

- PostgreSQL 12+ installed locally or remote database access
- Node.js 18+ (already configured)
- `psql` CLI tool or database client

## Local Development Setup

### 1. Create the Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE cc_craft_create;

# Exit psql
\q
```

### 2. Load the Schema

```bash
# Run the schema file
psql -U postgres -d cc_craft_create -f config/db-schema.sql
```

This will:
- Create `products`, `customers`, `orders`, and `order_items` tables
- Create indexes for performance
- Seed 8 initial products (Drink Labels, Party Packages, etc.)

### 3. Verify Installation

```bash
psql -U postgres -d cc_craft_create

# Check tables
\dt

# Check products were seeded
SELECT * FROM products;

# Exit
\q
```

### 4. Configure .env.local

Update `.env.local` with your database URL:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/cc_craft_create
```

## Database Schema

### Products Table
- `id`: Auto-incrementing primary key
- `name`: Product name
- `category`: Product type (Labels, Wrappers, Packages, etc.)
- `occasion`: Event type (Birthday, Baby Shower, etc.)
- `description`: Product details
- `price`: DECIMAL(10, 2)
- `image_url`: Optional product image URL
- `in_stock`: Boolean availability flag

### Customers Table
- `id`: Auto-incrementing primary key
- `name`, `email`, `phone`: Contact info
- `address`, `city`, `state`, `zip`: Shipping address
- `order_count`, `total_spent`: Customer metrics

### Orders Table
- `id`: Auto-incrementing primary key
- `order_number`: Unique order identifier (CC-{timestamp})
- `customer_id`: Foreign key to customers
- `status`: pending, confirmed, shipped, delivered, cancelled
- `items_json`: JSON array of order items
- `subtotal`, `shipping`, `tax`, `total`: Order totals
- `stripe_payment_id`: Stripe transaction ID (optional)

### Order Items Table
- `id`: Auto-incrementing primary key
- `order_id`: Foreign key to orders
- `product_id`: Foreign key to products
- `quantity`, `price`: Line item details

## Seeded Products

1. Personalized Drink Labels ($24.99)
2. Chip Bags & Candy Wrappers ($19.99)
3. Water Bottle Labels ($16.99)
4. Custom Party Package ($89.99)
5. Memorial Bookmarks ($12.99)
6. Graduation Certificates ($34.99)
7. Holiday Gift Tags ($14.99)
8. Shower Invitation Set ($44.99)

## Cloud Database Setup (Production)

For production deployment (AWS RDS, Heroku Postgres, etc.):

```
DATABASE_URL=postgresql://user:password@host:5432/cc_craft_create
```

1. Create the database via cloud provider UI
2. Run the schema: `psql -U user -d cc_craft_create -f config/db-schema.sql`
3. Update `.env.local` with the remote connection string

## Development Commands

### View database contents

```bash
psql -U postgres -d cc_craft_create

# View all products
SELECT * FROM products ORDER BY name;

# View customer orders
SELECT o.*, c.name FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
ORDER BY o.created_at DESC;

# View order details
SELECT oi.*, p.name FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = 1;
```

### Reset database (development only)

```bash
psql -U postgres

DROP DATABASE cc_craft_create;
CREATE DATABASE cc_craft_create;

\q

psql -U postgres -d cc_craft_create -f config/db-schema.sql
```

## Troubleshooting

### Connection refused
- Ensure PostgreSQL is running: `brew services list` (macOS)
- Check port 5432 is accessible
- Verify DATABASE_URL format

### "role postgres does not exist"
- Use your actual PostgreSQL username instead of `postgres`
- Or: `psql -U $USER -d cc_craft_create`

### Migrations failed
- Ensure schema file exists at `config/db-schema.sql`
- Check SQL syntax for errors
- Verify database user has CREATE TABLE permissions

## Next Steps

1. Start development server: `npm run dev`
2. Visit `http://localhost:3011/shop` to browse products from the database
3. Add items to cart and test checkout with test API
4. Orders will be saved to the database
