-- Customer service system
CREATE TABLE IF NOT EXISTS chat_conversations (
  id SERIAL PRIMARY KEY,
  customer_email VARCHAR(255) NOT NULL,
  platform VARCHAR(50),
  messages JSONB,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_conversations_email ON chat_conversations(customer_email);
CREATE INDEX idx_chat_conversations_status ON chat_conversations(status);

CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  customer_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  agent_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_email ON support_tickets(customer_email);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

CREATE TABLE IF NOT EXISTS faq (
  id SERIAL PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_faq_category ON faq(category);
