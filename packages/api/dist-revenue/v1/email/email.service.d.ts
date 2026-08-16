export declare class EmailService {
    /**
     * Send welcome email after successful payment
     */
    sendWelcomeEmail(data: {
        email: string;
        name: string;
        workspaceName: string;
        workspaceUrl: string;
        trialEndsAt: Date;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Send onboarding tip emails (Day 1, 3, 7)
     */
    sendOnboardingTip(data: {
        email: string;
        name: string;
        workspaceUrl: string;
        day: number;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Send team member invite
     */
    sendInviteEmail(data: {
        invitedEmail: string;
        inviterName: string;
        workspaceName: string;
        inviteLink: string;
        expiresAt: Date;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Send monthly invoice
     */
    sendInvoice(data: {
        email: string;
        invoiceId: string;
        amount: number;
        plan: string;
        invoicePdfUrl: string;
        dueDate: Date;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Send upgrade confirmation
     */
    sendUpgradeConfirmation(data: {
        email: string;
        name: string;
        oldPlan: string;
        newPlan: string;
        newPrice: number;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Send payment failed warning
     */
    sendPaymentFailedWarning(data: {
        email: string;
        name: string;
        retryDate: Date;
        attempt: number;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Send cancellation confirmation
     */
    sendCancellationConfirmation(data: {
        email: string;
        name: string;
        workspaceName: string;
        cancelDate: Date;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Send win-back campaign (30+ days after cancellation)
     */
    sendWinBackOffer(data: {
        email: string;
        name: string;
        plan: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Send usage alert (approaching quota)
     */
    sendUsageAlert(data: {
        email: string;
        name: string;
        metric: string;
        used: number;
        limit: number;
        percentage: number;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Send post-call summary email
     */
    sendPostCallSummary(data: {
        email: string;
        name: string;
        summary: string;
        actionItemsCount: number;
        followUpDate: Date;
        recordingLink: string | null;
        dashboardLink: string;
        template: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Send booking confirmation email to client
     */
    sendBookingConfirmation(data: {
        email: string;
        name: string;
        consultantName: string;
        serviceName: string;
        startTime: Date;
        duration: number;
        amount: number;
        meetingLink: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Send booking notification email to consultant
     */
    sendConsultantBookingNotification(data: {
        email: string;
        name: string;
        clientName: string;
        clientEmail: string;
        serviceName: string;
        startTime: Date;
        duration: number;
        amount: number;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Send payment retry email for failed booking payments
     */
    sendPaymentRetryEmail(data: {
        email: string;
        name: string;
        serviceName: string;
        consultantName: string;
        startTime: Date;
        retryLink: string;
        failureReason: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Send refund confirmation email
     */
    sendRefundConfirmation(data: {
        email: string;
        name: string;
        bookingId: string;
        serviceName: string;
        consultantName: string;
        refundAmount: number;
        refundDate: Date;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Generic send method for custom templates
     */
    send(email: {
        to: string;
        subject: string;
        template: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
    /**
     * Internal method to send email via provider
     */
    protected _send(email: {
        to: string;
        subject: string;
        template: string;
    }): Promise<{
        success: boolean;
        messageId: string;
    }>;
}
//# sourceMappingURL=email.service.d.ts.map