-- CC Craft & Create Database Schema

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  occasion VARCHAR(100),
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(10),
  order_count INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  items_json TEXT,
  notes TEXT,
  subtotal DECIMAL(10, 2),
  shipping DECIMAL(10, 2),
  tax DECIMAL(10, 2),
  total DECIMAL(10, 2) NOT NULL,
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order Items Table (for detailed line items)
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Seed initial products
INSERT INTO products (name, category, occasion, description, price, in_stock) VALUES
('Personalized Drink Labels', 'Labels', 'Birthday', 'Custom drink labels for any celebration', 24.99, true),
('Chip Bags & Candy Wrappers', 'Wrappers', 'Birthday', 'Personalized snack packaging', 19.99, true),
('Water Bottle Labels', 'Labels', 'Events', 'Hydration labels for guests', 16.99, true),
('Custom Party Package', 'Packages', 'Birthday', 'Complete party package with multiple items', 89.99, true),
('Memorial Bookmarks', 'Keepsakes', 'Memorials', 'Lasting memories', 12.99, true),
('Graduation Certificates', 'Certificates', 'Graduations', 'Personalized achievement certificates', 34.99, true),
('Holiday Gift Tags', 'Tags', 'Holidays', 'Custom holiday tags', 14.99, true),
('Shower Invitation Set', 'Invitations', 'Baby Shower', 'Complete invitation suite', 44.99, true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
