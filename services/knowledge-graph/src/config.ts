import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3005', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || 'localhost',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'knowledge_graph'
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    database: parseInt(process.env.REDIS_DB || '0', 10)
  },

  // Graph
  graph: {
    // Cache TTL in seconds
    cacheTtl: parseInt(process.env.GRAPH_CACHE_TTL || '3600', 10),
    // Maximum depth for relationship traversal
    maxDepth: parseInt(process.env.GRAPH_MAX_DEPTH || '5', 10),
    // Batch size for bulk operations
    batchSize: parseInt(process.env.GRAPH_BATCH_SIZE || '100', 10),
    // Vector embedding dimension
    embeddingDimension: parseInt(process.env.EMBEDDING_DIMENSION || '1536', 10)
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

export default config;
