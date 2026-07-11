// Drop Shipping Bot Monitor (Blackhail)
// Monitors: orders processed, sync status, error rates, product sync
const { query } = require('./db-utils');

class DropshippingBotMonitor {
  constructor() {
    this.name = 'Drop Shipping Monitor';
  }

  async getOrderStats() {
    try {
      // Get order processing stats
      const result = await query(`
        SELECT
          COUNT(*) as total_orders,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          SUM(amount) as total_revenue
        FROM orders
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `);

      const row = result.rows[0];
      return {
        totalOrders: row.total_orders || 0,
        completed: row.completed || 0,
        failed: row.failed || 0,
        pending: row.pending || 0,
        totalRevenue: parseFloat(row.total_revenue) || 0,
        successRate: row.total_orders > 0
          ? ((row.completed / row.total_orders) * 100).toFixed(1)
          : 0
      };
    } catch (error) {
      console.error(`[${this.name}] Order stats fetch failed:`, error.message);
      return {
        totalOrders: 0,
        completed: 0,
        failed: 0,
        pending: 0,
        totalRevenue: 0,
        successRate: 0
      };
    }
  }

  async getSyncStatus() {
    try {
      // Get product sync status
      const result = await query(`
        SELECT
          COUNT(*) as total_products,
          COUNT(CASE WHEN synced_at > NOW() - INTERVAL '1 hour' THEN 1 END) as synced_last_hour,
          COUNT(CASE WHEN sync_status = 'error' THEN 1 END) as sync_errors,
          MAX(synced_at) as last_sync
        FROM products
      `);

      const row = result.rows[0];
      return {
        totalProducts: row.total_products || 0,
        syncedLastHour: row.synced_last_hour || 0,
        syncErrors: row.sync_errors || 0,
        lastSync: row.last_sync ? new Date(row.last_sync) : null
      };
    } catch (error) {
      console.error(`[${this.name}] Sync status fetch failed:`, error.message);
      return {
        totalProducts: 0,
        syncedLastHour: 0,
        syncErrors: 0,
        lastSync: null
      };
    }
  }

  async getTopErrors() {
    try {
      const result = await query(`
        SELECT
          error_message,
          COUNT(*) as error_count
        FROM orders
        WHERE status = 'failed'
          AND created_at > NOW() - INTERVAL '24 hours'
        GROUP BY error_message
        ORDER BY error_count DESC
        LIMIT 3
      `);

      return result.rows.map(row => ({
        error: row.error_message || 'Unknown',
        count: row.error_count
      }));
    } catch (error) {
      return [];
    }
  }

  async report() {
    console.log(`[${this.name}] Starting report generation...`);

    const orders = await this.getOrderStats();
    const sync = await this.getSyncStatus();
    const errors = await this.getTopErrors();

    const report = {
      name: this.name,
      timestamp: new Date(),
      orders: {
        total: orders.totalOrders,
        completed: orders.completed,
        failed: orders.failed,
        pending: orders.pending,
        revenue: '$' + orders.totalRevenue.toFixed(2),
        successRate: parseFloat(orders.successRate)
      },
      productSync: {
        totalProducts: sync.totalProducts,
        syncedLastHour: sync.syncedLastHour,
        syncErrors: sync.syncErrors,
        lastSync: sync.lastSync ? sync.lastSync.toISOString() : 'never'
      },
      topErrors: errors,
      status: orders.successRate >= 95 && sync.syncErrors === 0 ? 'HEALTHY' : 'WARNING'
    };

    console.log(`[${this.name}] Report complete:`, {
      orders: report.orders.total,
      successRate: report.orders.successRate + '%',
      revenue: report.orders.revenue,
      syncErrors: report.productSync.syncErrors
    });

    return report;
  }
}

module.exports = DropshippingBotMonitor;
