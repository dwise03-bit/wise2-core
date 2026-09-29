import express from 'express';
import pino from 'pino';
import { ElasticsearchService } from './elasticsearch/ElasticsearchService.js';
import { VectorSearchService } from './vector/VectorSearchService.js';
import { setupSearchRoutes } from './api/routes.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();
const PORT = process.env.SEARCH_PORT || 3003;

app.use(express.json());

// Initialize search services
const elasticsearchService = new ElasticsearchService(
  process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
);

const vectorService = new VectorSearchService(
  process.env.PINECONE_API_KEY || '',
  process.env.PINECONE_INDEX || 'wise2-documents'
);

// Setup routes
setupSearchRoutes(app, elasticsearchService, vectorService, logger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    elasticsearch: elasticsearchService.isConnected() ? 'connected' : 'disconnected',
    vector_db: vectorService.isConnected() ? 'connected' : 'disconnected',
  });
});

const server = app.listen(PORT, () => {
  logger.info(`Search Service running on port ${PORT}`);
});

export { app, elasticsearchService, vectorService };
