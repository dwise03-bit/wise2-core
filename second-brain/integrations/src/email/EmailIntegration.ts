import nodemailer from 'nodemailer';
import pino from 'pino';

const logger = pino();

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailIntegration {
  private transporter: any = null;
  private connected = false;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    if (config.host && config.user && config.pass) {
      this.initialize();
    } else {
      logger.warn('Email configuration incomplete');
    }
  }

  private async initialize(): Promise<void> {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.port === 465,
        auth: {
          user: this.config.user,
          pass: this.config.pass,
        },
      });

      // Verify connection
      await this.transporter.verify();
      this.connected = true;
      logger.info(`Connected to email service: ${this.config.host}`);
    } catch (error) {
      logger.error(`Failed to connect to email: ${error}`);
      this.connected = false;
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<any> {
    if (!this.transporter || !this.connected) {
      logger.warn('Email service not connected');
      return null;
    }

    try {
      const mailOptions = {
        from: this.config.user,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Sent email to ${options.to}`);
      return info;
    } catch (error) {
      logger.error(`Failed to send email: ${error}`);
      return null;
    }
  }

  /**
   * Send email with template
   */
  async sendTemplatedEmail(
    to: string,
    subject: string,
    template: string,
    data: Record<string, any>,
  ): Promise<any> {
    let html = template;

    // Simple template replacement
    for (const [key, value] of Object.entries(data)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send notification email for vault changes
   */
  async notifyVaultChange(
    recipientEmail: string,
    documentTitle: string,
    changeType: 'created' | 'updated' | 'deleted',
    author: string,
  ): Promise<any> {
    const subject = `WISE² Vault: Document ${changeType}`;
    const html = `
      <h2>Document ${changeType}</h2>
      <p><strong>${documentTitle}</strong> was ${changeType} by <strong>${author}</strong></p>
      <p><a href="https://wise2.net/vault">View in Vault</a></p>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject,
      html,
    });
  }

  /**
   * Send search results via email
   */
  async sendSearchResults(
    recipientEmail: string,
    query: string,
    results: any[],
  ): Promise<any> {
    const subject = `WISE² Search Results: "${query}"`;

    let html = `
      <h2>Search Results for "${query}"</h2>
      <p>Found ${results.length} documents:</p>
      <ul>
    `;

    results.forEach((result) => {
      html += `
        <li>
          <strong>${result.title}</strong> (${result.folder})
          <p>${result.content.substring(0, 200)}...</p>
        </li>
      `;
    });

    html += '</ul>';

    return this.sendEmail({
      to: recipientEmail,
      subject,
      html,
    });
  }

  /**
   * Send alert email
   */
  async sendAlert(
    recipientEmail: string,
    title: string,
    message: string,
    severity: 'info' | 'warning' | 'error' = 'info',
  ): Promise<any> {
    const severityColors = {
      info: '#00D9FF',
      warning: '#ffcc00',
      error: '#ff3333',
    };

    const html = `
      <div style="border-left: 4px solid ${severityColors[severity]}; padding: 20px;">
        <h2>${title}</h2>
        <p>${message}</p>
      </div>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: `[${severity.toUpperCase()}] ${title}`,
      html,
    });
  }

  isConnected(): boolean {
    return this.connected;
  }
}
