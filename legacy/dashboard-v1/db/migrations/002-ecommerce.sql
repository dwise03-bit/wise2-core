-- Merch e-commerce system
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  price NUMERIC(10,2) NOT NULL,
  cost NUMERIC(10,2),
  sku VARCHAR(100) UNIQUE,
  images TEXT[] DEFAULT '{}',
  stock_count INT DEFAULT 0,
  is_dropship BOOLEAN DEFAULT false,
  supplier_id INT,
  related_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_dropship ON products(is_dropship);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_email VARCHAR(255) NOT NULL,
  customer_address TEXT NOT NULL,
  items JSONB NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  tracking_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  api_endpoint VARCHAR(500),
  contact_email VARCHAR(255),
  api_key VARCHAR(500)
);
