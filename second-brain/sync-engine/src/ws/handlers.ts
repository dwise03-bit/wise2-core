import { WebSocket } from 'ws';
import { SyncManager } from '../sync/SyncManager.js';
import { VaultStateManager } from '../vault/VaultStateManager.js';
import pino from 'pino';
import type { Logger } from 'pino';

export interface SyncMessage {
  type: 'sync' | 'subscribe' | 'publish' | 'query' | 'resolve-conflict';
  docId?: string;
  update?: string; // base64 encoded Uint8Array
  clientId?: string;
  content?: string;
  folder?: string;
  title?: string;
  version?: number;
  localData?: any;
  remoteData?: any;
}

export function setupWebSocketHandlers(
  ws: WebSocket,
  clientId: string,
  syncManager: SyncManager,
  vaultManager: VaultStateManager,
  logger: Logger,
): void {
  const subscriptions = new Set<string>();

  ws.on('message', async (data: string) => {
    try {
      const message: SyncMessage = JSON.parse(data);

      switch (message.type) {
        case 'sync':
          handleSync(
            ws,
            clientId,
            message,
            syncManager,
            vaultManager,
            logger,
          );
          break;

        case 'subscribe':
          handleSubscribe(ws, clientId, message, subscriptions, logger);
          break;

        case 'publish':
          handlePublish(
            ws,
            clientId,
            message,
            subscriptions,
            vaultManager,
            logger,
          );
          break;

        case 'query':
          handleQuery(ws, clientId, message, vaultManager, logger);
          break;

        case 'resolve-conflict':
          handleConflictResolution(
            ws,
            clientId,
            message,
            syncManager,
            logger,
          );
          break;

        default:
          logger.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      logger.error(`Error handling message: ${error}`);
      ws.send(
        JSON.stringify({
          type: 'error',
          message: String(error),
        }),
      );
    }
  });

  ws.on('close', () => {
    logger.info(`Client disconnected: ${clientId}`);
  });

  ws.on('error', (error) => {
    logger.error(`WebSocket error: ${error}`);
  });
}

function handleSync(
  ws: WebSocket,
  clientId: string,
  message: SyncMessage,
  syncManager: SyncManager,
  vaultManager: VaultStateManager,
  logger: Logger,
): void {
  const { docId, update, version } = message;

  if (!docId) {
    ws.send(JSON.stringify({ type: 'error', message: 'docId required' }));
    return;
  }

  // Decode update from base64
  const updateBytes = update ? Buffer.from(update, 'base64') : undefined;
  const updateArray = updateBytes ? new Uint8Array(updateBytes) : undefined;

  if (updateArray) {
    const result = syncManager.applyUpdate(docId, updateArray, clientId);
    ws.send(
      JSON.stringify({
        type: 'sync-ack',
        docId,
        version: version || 0,
        resolved: result.resolved,
        conflicts: result.conflicts,
      }),
    );
  }
}

function handleSubscribe(
  ws: WebSocket,
  clientId: string,
  message: SyncMessage,
  subscriptions: Set<string>,
  logger: Logger,
): void {
  const { docId } = message;

  if (!docId) {
    ws.send(JSON.stringify({ type: 'error', message: 'docId required' }));
    return;
  }

  subscriptions.add(docId);
  logger.info(`Client ${clientId} subscribed to ${docId}`);

  ws.send(
    JSON.stringify({
      type: 'subscribed',
      docId,
    }),
  );
}

function handlePublish(
  ws: WebSocket,
  clientId: string,
  message: SyncMessage,
  subscriptions: Set<string>,
  vaultManager: VaultStateManager,
  logger: Logger,
): void {
  const { docId, content, folder, title } = message;

  if (!docId || !content || !folder || !title) {
    ws.send(
      JSON.stringify({
        type: 'error',
        message: 'docId, content, folder, title required',
      }),
    );
    return;
  }

  // Update in vault
  const existingDoc = vaultManager.getDocument(docId);
  let doc;

  if (existingDoc) {
    doc = vaultManager.updateDocument(docId, content, clientId);
  } else {
    doc = vaultManager.createDocument(folder, title, content, clientId);
  }

  logger.info(`Document published: ${docId} by ${clientId}`);

  // Broadcast to subscribers
  ws.send(
    JSON.stringify({
      type: 'published',
      docId,
      data: doc,
    }),
  );
}

function handleQuery(
  ws: WebSocket,
  clientId: string,
  message: SyncMessage,
  vaultManager: VaultStateManager,
  logger: Logger,
): void {
  const { folder, docId } = message;

  if (docId) {
    const doc = vaultManager.getDocument(docId);
    ws.send(
      JSON.stringify({
        type: 'query-result',
        data: doc,
      }),
    );
  } else if (folder) {
    const docs = vaultManager.getDocumentsByFolder(folder);
    ws.send(
      JSON.stringify({
        type: 'query-result',
        data: docs,
      }),
    );
  }
}

function handleConflictResolution(
  ws: WebSocket,
  clientId: string,
  message: SyncMessage,
  syncManager: SyncManager,
  logger: Logger,
): void {
  const { docId, localData, remoteData } = message;

  if (!docId || !localData || !remoteData) {
    ws.send(
      JSON.stringify({
        type: 'error',
        message: 'docId, localData, remoteData required',
      }),
    );
    return;
  }

  const result = syncManager.resolveConflict(
    docId,
    localData,
    remoteData,
    clientId,
  );

  logger.info(`Resolved conflict in ${docId}: ${result.winner}`);

  ws.send(
    JSON.stringify({
      type: 'conflict-resolved',
      docId,
      result,
    }),
  );
}
