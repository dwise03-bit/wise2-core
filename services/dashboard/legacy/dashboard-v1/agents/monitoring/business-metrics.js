// Business Metrics Agent
// Monitors: revenue (MRR/ARR), churn rate, adoption rates, LTV
const { query } = require('./db-utils');

class BusinessMetrics {
  constructor() {
    this.name = 'Business Metrics';
  }

  async getRevenueMetrics() {
    try {
      const result = await query(`
        WITH monthly_revenue AS (
          SELECT
            DATE_TRUNC('month', created_at)::DATE as month,
            SUM(amount) as revenue
          FROM payments
          WHERE created_at > NOW() - INTERVAL '2 months'
          GROUP BY DATE_TRUNC('month', created_at)
        )
        SELECT
          (SELECT COALESCE(revenue, 0) FROM monthly_revenue WHERE month = DATE_TRUNC('month', NOW())::DATE) as mrr,
          (SELECT COALESCE(revenue, 0) FROM monthly_revenue WHERE month = DATE_TRUNC('month', NOW() - INTERVAL '1 month')::DATE) as mrr_prev,
          COALESCE(SUM(revenue), 0) * 12 as arr
        FROM monthly_revenue
      `);

      const row = result.rows[0];
      const mrr = parseFloat(row.mrr) || 0;
      const mrrPrev = parseFloat(row.mrr_prev) || 0;
      const mrrChange = mrrPrev > 0 ? (((mrr - mrrPrev) / mrrPrev) * 100).toFixed(2) : 0;

      return {
        mrr,
        mrrPrev,
        arr: parseFloat(row.arr) || 0,
        mrrChange
      };
    } catch (error) {
      console.error(`[${this.name}] Revenue metrics fetch failed:`, error.message);
      return { mrr: 0, mrrPrev: 0, arr: 0, mrrChange: 0 };
    }
  }

  async getChurnMetrics() {
    try {
      const result = await query(`
        WITH cohorts AS (
          SELECT
            DATE_TRUNC('month', created_at)::DATE as signup_month,
            COUNT(*) as cohort_size,
            COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_users
          FROM users
          WHERE created_at > NOW() - INTERVAL '3 months'
          GROUP BY DATE_TRUNC('month', created_at)
        )
        SELECT
          ROUND(100.0 * (cohort_size - active_users)::FLOAT / NULLIF(cohort_size, 0)::NUMERIC, 2) as churn_rate
        FROM cohorts
        WHERE signup_month = DATE_TRUNC('month', NOW())::DATE
      `);

      const row = result.rows[0];
      return parseFloat(row.churn_rate) || 0;
    } catch (error) {
      console.error(`[${this.name}] Churn metrics fetch failed:`, error.message);
      return 0;
    }
  }

  async getAdoptionRates() {
    try {
      const result = await query(`
        SELECT
          (SELECT COUNT(DISTINCT user_id) FROM conversations) as chat_users,
          (SELECT COUNT(DISTINCT user_id) FROM course_enrollments) as course_users,
          (SELECT COUNT(DISTINCT user_id) FROM bookings) as booking_users,
          (SELECT COUNT(DISTINCT user_id) FROM orders) as shop_users,
          (SELECT COUNT(*) FROM users) as total_users
      `);

      const row = result.rows[0];
      const totalUsers = row.total_users || 1;

      return {
        chatAdoption: Math.round((row.chat_users / totalUsers) * 100),
        courseAdoption: Math.round((row.course_users / totalUsers) * 100),
        bookingAdoption: Math.round((row.booking_users / totalUsers) * 100),
        shopAdoption: Math.round((row.shop_users / totalUsers) * 100)
      };
    } catch (error) {
      console.error(`[${this.name}] Adoption rates fetch failed:`, error.message);
      return { chatAdoption: 0, courseAdoption: 0, bookingAdoption: 0, shopAdoption: 0 };
    }
  }

  async getLTV() {
    try {
      const result = await query(`
        SELECT
          ROUND(AVG(total_paid)::NUMERIC, 2) as avg_customer_value
        FROM (
          SELECT
            user_id,
            SUM(amount) as total_paid
          FROM payments
          WHERE created_at > NOW() - INTERVAL '12 months'
          GROUP BY user_id
        ) as customer_revenue
      `);

      const row = result.rows[0];
      return parseFloat(row.avg_customer_value) || 0;
    } catch (error) {
      console.error(`[${this.name}] LTV calculation failed:`, error.message);
      return 0;
    }
  }

  async report() {
    console.log(`[${this.name}] Starting report generation...`);

    const revenue = await this.getRevenueMetrics();
    const churn = await this.getChurnMetrics();
    const adoption = await this.getAdoptionRates();
    const ltv = await this.getLTV();

    const report = {
      name: this.name,
      timestamp: new Date(),
      revenue,
      churnRate: churn,
      adoption,
      ltv,
      status: revenue.mrr > 0 && churn < 5 ? 'HEALTHY' : 'WARNING'
    };

    console.log(`[${this.name}] Report complete:`, {
      mrr: '$' + Math.round(report.revenue.mrr),
      churn: report.churnRate + '%',
      chatAdoption: report.adoption.chatAdoption + '%'
    });

    return report;
  }
}

module.exports = BusinessMetrics;
