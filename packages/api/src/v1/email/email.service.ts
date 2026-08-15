import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  /**
   * Send welcome email after successful payment
   */
  async sendWelcomeEmail(data: {
    email: string;
    name: string;
    workspaceName: string;
    workspaceUrl: string;
    trialEndsAt: Date;
  }) {
    const template = `
    <h1>Welcome to WISE², ${data.name}!</h1>
    <p>Your workspace <strong>${data.workspaceName}</strong> is ready to go.</p>

    <h2>Get Started</h2>
    <p>
      <a href="https://wise2.io/${data.workspaceUrl}/dashboard">Go to Your Dashboard</a>
    </p>

    <h2>Your Trial</h2>
    <p>You have a 14-day free trial ending ${data.trialEndsAt.toLocaleDateString()}.</p>
    <p>No credit card charged during trial.</p>

    <h2>Next Steps</h2>
    <ol>
      <li>Invite team members</li>
      <li>Set up integrations</li>
      <li>Create your first project</li>
    </ol>

    <p>Questions? Reply to this email or visit our <a href="https://help.wise2.io">help center</a>.</p>
    `;

    return await this._send({
      to: data.email,
      subject: `Welcome to WISE², ${data.name}!`,
      template,
    });
  }

  /**
   * Send onboarding tip emails (Day 1, 3, 7)
   */
  async sendOnboardingTip(data: {
    email: string;
    name: string;
    workspaceUrl: string;
    day: number;
  }) {
    const tips = {
      1: {
        title: 'Getting Started with WISE²',
        tip: 'Start by inviting your team members to collaborate in real-time.',
      },
      3: {
        title: 'Setting Up Integrations',
        tip: 'Connect Stripe, Discord, or GitHub to automate your workflow.',
      },
      7: {
        title: 'Advanced Features You Should Know About',
        tip: 'Use role-based access control to manage permissions and keep your workspace secure.',
      },
    };

    const content = tips[data.day as keyof typeof tips] || tips[1];

    const template = `
    <h2>${content.title}</h2>
    <p>Hi ${data.name},</p>
    <p>${content.tip}</p>
    <p>
      <a href="https://wise2.io/${data.workspaceUrl}/dashboard">Open Your Dashboard</a>
    </p>
    `;

    return await this._send({
      to: data.email,
      subject: `Tip #${data.day}: ${content.title}`,
      template,
    });
  }

  /**
   * Send team member invite
   */
  async sendInviteEmail(data: {
    invitedEmail: string;
    inviterName: string;
    workspaceName: string;
    inviteLink: string;
    expiresAt: Date;
  }) {
    const template = `
    <h2>${data.inviterName} invited you to join ${data.workspaceName}</h2>
    <p>Join their WISE² workspace to collaborate on projects.</p>

    <p>
      <a href="${data.inviteLink}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
        Accept Invite
      </a>
    </p>

    <p style="color: #999; font-size: 12px;">
      This invite expires on ${data.expiresAt.toLocaleDateString()}
    </p>
    `;

    return await this._send({
      to: data.invitedEmail,
      subject: `${data.inviterName} invited you to join ${data.workspaceName}`,
      template,
    });
  }

  /**
   * Send monthly invoice
   */
  async sendInvoice(data: {
    email: string;
    invoiceId: string;
    amount: number;
    plan: string;
    invoicePdfUrl: string;
    dueDate: Date;
  }) {
    const template = `
    <h2>Invoice #${data.invoiceId}</h2>
    <p>Your monthly bill for ${data.plan} is ready.</p>

    <h3>Amount Due: $${(data.amount / 100).toFixed(2)}</h3>
    <p>Due: ${data.dueDate.toLocaleDateString()}</p>

    <p>
      <a href="${data.invoicePdfUrl}">Download Invoice (PDF)</a>
    </p>
    `;

    return await this._send({
      to: data.email,
      subject: `Invoice #${data.invoiceId} - WISE²`,
      template,
    });
  }

  /**
   * Send upgrade confirmation
   */
  async sendUpgradeConfirmation(data: {
    email: string;
    name: string;
    oldPlan: string;
    newPlan: string;
    newPrice: number;
  }) {
    const template = `
    <h2>Plan Upgraded! 🎉</h2>
    <p>Hi ${data.name},</p>
    <p>Your plan has been upgraded from <strong>${data.oldPlan}</strong> to <strong>${data.newPlan}</strong>.</p>

    <h3>New Price: $${data.newPrice}/month</h3>
    <p>Your billing date will be adjusted based on your upgrade timing.</p>

    <p>You now have access to:</p>
    <ul>
      <li>More workspaces</li>
      <li>Unlimited team members</li>
      <li>Advanced analytics</li>
      <li>Priority support</li>
    </ul>
    `;

    return await this._send({
      to: data.email,
      subject: `Your Plan Has Been Upgraded to ${data.newPlan}`,
      template,
    });
  }

  /**
   * Send payment failed warning
   */
  async sendPaymentFailedWarning(data: {
    email: string;
    name: string;
    retryDate: Date;
    attempt: number;
  }) {
    const urgency = {
      1: 'We were unable to charge your payment method.',
      2: 'Payment still pending. Please update your payment method soon.',
      3: 'Final warning: Your access will be suspended if payment fails again.',
    };

    const template = `
    <h2>Payment Failed ⚠️</h2>
    <p>Hi ${data.name},</p>
    <p>${urgency[data.attempt as keyof typeof urgency]}</p>

    <p>We will retry on ${data.retryDate.toLocaleDateString()}.</p>

    <p>
      <a href="https://wise2.io/dashboard/subscription">Update Payment Method</a>
    </p>
    `;

    return await this._send({
      to: data.email,
      subject: data.attempt === 3 ? '⚠️ Final Notice: Update Your Payment Method' : 'Payment Failed - Action Required',
      template,
    });
  }

  /**
   * Send cancellation confirmation
   */
  async sendCancellationConfirmation(data: {
    email: string;
    name: string;
    workspaceName: string;
    cancelDate: Date;
  }) {
    const template = `
    <h2>Your Subscription Has Been Canceled</h2>
    <p>Hi ${data.name},</p>
    <p>We're sorry to see you go. Your access to <strong>${data.workspaceName}</strong> will end on ${data.cancelDate.toLocaleDateString()}.</p>

    <p>Until then, you'll have full access to all features.</p>

    <p>
      <a href="https://wise2.io/dashboard/subscription">Reactivate Subscription</a>
    </p>

    <p>We'd love to hear your feedback. What could we have done better?</p>
    `;

    return await this._send({
      to: data.email,
      subject: 'Your WISE² Subscription Has Been Canceled',
      template,
    });
  }

  /**
   * Send win-back campaign (30+ days after cancellation)
   */
  async sendWinBackOffer(data: {
    email: string;
    name: string;
    plan: string;
  }) {
    const template = `
    <h2>We Miss You!</h2>
    <p>Hi ${data.name},</p>
    <p>Come back to WISE² and get <strong>30% off</strong> your first month.</p>

    <p>Use code: <strong>COMEBACK30</strong></p>

    <p>
      <a href="https://wise2.io/pricing?code=COMEBACK30">Reactivate ${data.plan}</a>
    </p>

    <p>This offer expires in 7 days.</p>
    `;

    return await this._send({
      to: data.email,
      subject: `Come Back to WISE²! Get 30% Off`,
      template,
    });
  }

  /**
   * Send usage alert (approaching quota)
   */
  async sendUsageAlert(data: {
    email: string;
    name: string;
    metric: string;
    used: number;
    limit: number;
    percentage: number;
  }) {
    const template = `
    <h2>You're Approaching Your Limit</h2>
    <p>Hi ${data.name},</p>
    <p>You've used ${data.percentage}% of your ${data.metric} limit (${data.used}/${data.limit}).</p>

    <p>Consider upgrading to get:</p>
    <ul>
      <li>More ${data.metric.toLowerCase()}</li>
      <li>Advanced analytics</li>
      <li>Priority support</li>
    </ul>

    <p>
      <a href="https://wise2.io/dashboard/subscription">Upgrade Now</a>
    </p>
    `;

    return await this._send({
      to: data.email,
      subject: `Alert: You're Using ${data.percentage}% of Your ${data.metric} Limit`,
      template,
    });
  }

  /**
   * Send post-call summary email
   */
  async sendPostCallSummary(data: {
    email: string;
    name: string;
    summary: string;
    actionItemsCount: number;
    followUpDate: Date;
    recordingLink: string | null;
    dashboardLink: string;
    template: string;
  }) {
    return await this._send({
      to: data.email,
      subject: `Post-Call Summary - ${new Date().toLocaleDateString()}`,
      template: data.template,
    });
  }

  /**
   * Send booking confirmation email to client
   */
  async sendBookingConfirmation(data: {
    email: string;
    name: string;
    consultantName: string;
    serviceName: string;
    startTime: Date;
    duration: number;
    amount: number;
    meetingLink: string;
  }) {
    const formattedTime = data.startTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });

    const template = `
    <h2>Booking Confirmed! 🎉</h2>
    <p>Hi ${data.name},</p>
    <p>Your consulting session with <strong>${data.consultantName}</strong> has been confirmed.</p>

    <h3>Session Details</h3>
    <ul>
      <li><strong>Service:</strong> ${data.serviceName}</li>
      <li><strong>Date & Time:</strong> ${formattedTime}</li>
      <li><strong>Duration:</strong> ${data.duration} hour(s)</li>
      <li><strong>Amount Paid:</strong> $${(data.amount / 100).toFixed(2)}</li>
    </ul>

    <h3>Join Your Session</h3>
    <p>
      <a href="${data.meetingLink}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
        Join Meeting
      </a>
    </p>

    <h3>Before Your Session</h3>
    <ul>
      <li>Join 5 minutes early</li>
      <li>Test your microphone and camera</li>
      <li>Have any relevant documents ready</li>
    </ul>

    <p>Questions? Reply to this email or contact support.</p>
    `;

    return await this._send({
      to: data.email,
      subject: `Booking Confirmed - ${data.serviceName} with ${data.consultantName}`,
      template,
    });
  }

  /**
   * Send booking notification email to consultant
   */
  async sendConsultantBookingNotification(data: {
    email: string;
    name: string;
    clientName: string;
    clientEmail: string;
    serviceName: string;
    startTime: Date;
    duration: number;
    amount: number;
  }) {
    const formattedTime = data.startTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });

    const template = `
    <h2>New Booking Scheduled</h2>
    <p>Hi ${data.name},</p>
    <p>You have a new consulting session booked with <strong>${data.clientName}</strong>.</p>

    <h3>Session Details</h3>
    <ul>
      <li><strong>Service:</strong> ${data.serviceName}</li>
      <li><strong>Date & Time:</strong> ${formattedTime}</li>
      <li><strong>Duration:</strong> ${data.duration} hour(s)</li>
      <li><strong>Client Email:</strong> ${data.clientEmail}</li>
      <li><strong>Amount:</strong> $${(data.amount / 100).toFixed(2)}</li>
    </ul>

    <h3>Actions</h3>
    <p>
      <a href="https://wise2.io/consultant/bookings">View in Dashboard</a>
    </p>

    <p>Make sure you're available for this session. If you need to cancel or reschedule, please notify the client immediately.</p>
    `;

    return await this._send({
      to: data.email,
      subject: `New Booking: ${data.serviceName} with ${data.clientName}`,
      template,
    });
  }

  /**
   * Send payment retry email for failed booking payments
   */
  async sendPaymentRetryEmail(data: {
    email: string;
    name: string;
    serviceName: string;
    consultantName: string;
    startTime: Date;
    retryLink: string;
    failureReason: string;
  }) {
    const formattedTime = data.startTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const template = `
    <h2>Payment Failed - Please Retry</h2>
    <p>Hi ${data.name},</p>
    <p>Your payment for the consulting session with <strong>${data.consultantName}</strong> was declined.</p>

    <h3>Session Details</h3>
    <ul>
      <li><strong>Service:</strong> ${data.serviceName}</li>
      <li><strong>Scheduled Date & Time:</strong> ${formattedTime}</li>
      <li><strong>Failure Reason:</strong> ${data.failureReason}</li>
    </ul>

    <h3>Retry Payment</h3>
    <p>
      <a href="${data.retryLink}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
        Retry Payment
      </a>
    </p>

    <p>If you continue to experience issues, please contact your bank or use a different payment method.</p>
    <p>Questions? Reply to this email or contact support.</p>
    `;

    return await this._send({
      to: data.email,
      subject: `Payment Failed - Please Retry for ${data.serviceName}`,
      template,
    });
  }

  /**
   * Send refund confirmation email
   */
  async sendRefundConfirmation(data: {
    email: string;
    name: string;
    bookingId: string;
    serviceName: string;
    consultantName: string;
    refundAmount: number;
    refundDate: Date;
  }) {
    const template = `
    <h2>Refund Processed</h2>
    <p>Hi ${data.name},</p>
    <p>Your refund has been processed successfully.</p>

    <h3>Refund Details</h3>
    <ul>
      <li><strong>Booking ID:</strong> ${data.bookingId}</li>
      <li><strong>Service:</strong> ${data.serviceName}</li>
      <li><strong>Consultant:</strong> ${data.consultantName}</li>
      <li><strong>Refund Amount:</strong> $${data.refundAmount.toFixed(2)}</li>
      <li><strong>Date Processed:</strong> ${data.refundDate.toLocaleDateString()}</li>
    </ul>

    <h3>What's Next?</h3>
    <p>The refund should appear in your account within 3-5 business days, depending on your bank.</p>

    <p>If you'd like to reschedule, you can book another session with the same consultant or explore other available options.</p>

    <p>
      <a href="https://wise2.io/bookings">View Bookings</a>
    </p>

    <p>We appreciate your understanding. If you have feedback, we'd love to hear from you.</p>
    `;

    return await this._send({
      to: data.email,
      subject: `Refund Confirmed - $${data.refundAmount.toFixed(2)}`,
      template,
    });
  }

  /**
   * Generic send method for custom templates
   */
  async send(email: { to: string; subject: string; template: string }) {
    return this._send(email);
  }

  /**
   * Internal method to send email via provider
   */
  protected async _send(email: {
    to: string;
    subject: string;
    template: string;
  }) {
    // TODO: Integrate with SendGrid/Mailgun/AWS SES
    // For now, just log
    console.log('📧 Email sent:', {
      to: email.to,
      subject: email.subject,
      timestamp: new Date(),
    });

    return { success: true, messageId: 'msg_' + Date.now() };
  }
}
