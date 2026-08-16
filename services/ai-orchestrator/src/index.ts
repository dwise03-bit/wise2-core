import pino from 'pino';
import { AIOrchestrator } from './orchestrator/AIOrchestrator.js';
import { IntentDetector } from './intent/IntentDetector.js';
import { ContextRetriever } from './context/ContextRetriever.js';
import { PromptOptimizer } from './prompt/PromptOptimizer.js';
import { ModelSelector } from './models/ModelSelector.js';
import { MemoryManager } from './memory/MemoryManager.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Initialize all components
const intentDetector = new IntentDetector();
const contextRetriever = new ContextRetriever();
const promptOptimizer = new PromptOptimizer();
const modelSelector = new ModelSelector();
const memoryManager = new MemoryManager();

// Initialize orchestrator with all components
const orchestrator = new AIOrchestrator(
  intentDetector,
  contextRetriever,
  promptOptimizer,
  modelSelector,
  memoryManager,
);

// Export for use in applications
export {
  AIOrchestrator,
  IntentDetector,
  ContextRetriever,
  PromptOptimizer,
  ModelSelector,
  MemoryManager,
  orchestrator,
};

logger.info('AI Orchestrator initialized and ready');
