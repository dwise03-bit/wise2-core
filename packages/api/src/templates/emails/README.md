# Email Templates - WISE² Consulting Booking System

Professional HTML and plain text email templates for the consulting booking workflow. All templates follow WISE² brand guidelines with responsive design and accessibility best practices.

## Templates Overview

### 1. **booking-confirmation.html / booking-confirmation.txt**
Sent immediately after a booking is confirmed.

**Purpose:** Confirm booking details, provide meeting link, add to calendar options, and consultant information.

**Handlebars Variables:**
```handlebars
{{firstName}}              - Recipient's first name
{{bookingDate}}            - Formatted booking date (e.g., "July 23, 2026")
{{bookingTime}}            - Booking time (e.g., "2:00 PM")
{{duration}}               - Duration in minutes (e.g., "60")
{{bookingId}}              - Unique booking identifier
{{consultantName}}         - Consultant's full name
{{consultantInitials}}     - Consultant's initials (e.g., "JD")
{{consultantTitle}}        - Consultant's title/role
{{consultantEmail}}        - Consultant's email address
{{consultantBio}}          - Optional: Consultant's biography
{{meetingLink}}            - Video call link (e.g., Zoom, Google Meet)
{{calendarLinks.google}}   - Google Calendar add link
{{calendarLinks.outlook}}  - Outlook Calendar add link
{{calendarLinks.ical}}     - iCal format link
{{rescheduleLink}}         - Link to manage/reschedule booking
{{unsubscribeLink}}        - Email unsubscribe link
{{preferencesLink}}        - Email preferences link
{{privacyLink}}            - Privacy policy link
```

---

### 2. **reminder-24h.html / reminder-24h.txt**
Sent 24 hours before the scheduled consultation.

**Purpose:** Remind users of upcoming call, provide prep tips, confirm meeting details, and allow rescheduling.

**Handlebars Variables:**
```handlebars
{{firstName}}              - Recipient's first name
{{consultantName}}         - Consultant's full name
{{consultantInitials}}     - Consultant's initials
{{consultantTitle}}        - Consultant's title/role
{{consultantBio}}          - Optional: Consultant's biography
{{bookingDate}}            - Formatted booking date
{{bookingTime}}            - Booking time
{{duration}}               - Duration in minutes
{{meetingLink}}            - Video call link
{{rescheduleLink}}         - Link to manage/reschedule booking
{{unsubscribeLink}}        - Email unsubscribe link
{{preferencesLink}}        - Email preferences link
{{privacyLink}}            - Privacy policy link
```

---

### 3. **postcall-summary.html / postcall-summary.txt**
Sent within 24 hours after the consultation ends.

**Purpose:** Provide AI-generated summary, action items, consultant notes, recording link, and follow-up options.

**Handlebars Variables:**
```handlebars
{{firstName}}              - Recipient's first name
{{discussionSummary}}      - AI-generated summary of discussion
{{actionItems}}            - Array of action items with structure:
                           {
                             description: "Task description",
                             dueDate: "Date (optional)",
                             completed: false (optional)
                           }
{{consultantName}}         - Consultant's full name
{{consultantNotes}}        - Optional: Notes from consultant
{{recordingLink}}          - Link to call recording
{{recordingDuration}}      - Duration of recording (e.g., "45 minutes")
{{recordingDate}}          - Date recording was made
{{recordingExpiryDays}}    - Days until recording expires (e.g., "30")
{{feedbackLink}}           - Link to feedback form
{{followUpLink}}           - Link to schedule follow-up
{{resourcesLink}}          - Optional: Link to additional resources
{{unsubscribeLink}}        - Email unsubscribe link
{{preferencesLink}}        - Email preferences link
{{privacyLink}}            - Privacy policy link
```

---

### 4. **cancellation-confirmation.html / cancellation-confirmation.txt**
Sent when a booking is cancelled.

**Purpose:** Confirm cancellation, show refund details and timeline, offer rescheduling option, and provide FAQ.

**Handlebars Variables:**
```handlebars
{{firstName}}              - Recipient's first name
{{bookingDate}}            - Formatted booking date
{{bookingTime}}            - Booking time
{{bookingId}}              - Unique booking identifier
{{consultantName}}         - Consultant's full name
{{cancellationDate}}       - Date cancellation was processed
{{showRefund}}             - Boolean: whether to show refund section
{{bookingAmount}}          - Original booking price (e.g., "$150.00")
{{cancellationFee}}        - Optional: Cancellation fee amount
{{refundAmount}}           - Final refund amount (e.g., "$135.00")
{{refundMethod}}           - Payment method used (e.g., "Visa ending in 4242")
{{refundTimeline}}         - Explanation of refund timing
{{rebookLink}}             - Link to book new consultation
{{cancellationWindowDays}} - Window for cancellation policy (e.g., "7")
{{unsubscribeLink}}        - Email unsubscribe link
{{preferencesLink}}        - Email preferences link
{{privacyLink}}            - Privacy policy link
```

---

## Integration Guide

### Using Handlebars in Node.js/Express

```typescript
import handlebars from 'handlebars';
import fs from 'fs';

// Load and compile template
const templateFile = fs.readFileSync(
  'packages/api/src/templates/emails/booking-confirmation.html',
  'utf-8'
);
const template = handlebars.compile(templateFile);

// Render with data
const html = template({
  firstName: 'John',
  bookingDate: 'July 23, 2026',
  bookingTime: '2:00 PM',
  // ... other variables
});
```

### Sending Email with HTML & Text Fallback

```typescript
// Example using Nodemailer
const transporter = nodemailer.createTransport({
  service: 'smtp',
  // ... config
});

const htmlTemplate = handlebars.compile(htmlFile);
const textTemplate = handlebars.compile(textFile);

const data = { /* your template variables */ };

await transporter.sendMail({
  to: 'user@example.com',
  subject: 'Booking Confirmation - WISE²',
  html: htmlTemplate(data),
  text: textTemplate(data),
  from: 'noreply@wise2.io'
});
```

---

## Design System

### Brand Colors
- **Primary Blue:** `#0055FF` - Main actions, headers, accents
- **Dark Background:** `#050505` - Email body background
- **Surface:** `#151515` - Card/section backgrounds
- **Success Green:** `#20C558` - Confirmations, success badges
- **Warning Yellow:** `#FFB808` - Reminders, warnings
- **Danger Red:** `#FF0040` - Alerts, cancellations
- **Muted Gray:** `#8d9ba5` - Secondary text

### Typography
- **Font Family:** System fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI', etc.`)
- **Display Size:** 28px, bold, uppercase, letter-spacing 1px
- **Section Titles:** 16px, bold, blue underline
- **Body Text:** 14px, line-height 1.8

### Responsive Design
- All templates are mobile-friendly (tested at 600px width)
- Flex layouts adapt on smaller screens
- Buttons stack vertically on mobile
- Single-column layout throughout

---

## Accessibility & Best Practices

✅ **What's Implemented:**
- HTML and plain text alternatives for all emails
- Semantic HTML structure with proper heading hierarchy
- High contrast colors (WCAG AA compliant)
- Descriptive link text (avoid "click here")
- Proper use of `<strong>` and `<em>` tags
- Unsubscribe links on every email
- Responsive layout works on all devices
- Alt text considerations in inline styles

⚠️ **Email Client Compatibility:**
- Tested layouts work in most modern email clients
- Fallback colors for clients with limited CSS support
- Graceful degradation for older clients
- No external font dependencies (system fonts only)

---

## Configuration

### Environment Variables
Add to your `.env` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@wise2.io
SMTP_PASS=your-app-password

# Email Settings
EMAIL_FROM=noreply@wise2.io
EMAIL_SUPPORT=support@wise2.io

# Callback URLs
WEBSITE_URL=https://wise2.io
UNSUBSCRIBE_URL=https://wise2.io/email/unsubscribe
PREFERENCES_URL=https://wise2.io/email/preferences
```

### Handlebars Setup

```typescript
// templates/config.ts
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.join(__dirname, '../templates/emails');

const templates = {
  bookingConfirmation: {
    html: fs.readFileSync(
      path.join(TEMPLATES_DIR, 'booking-confirmation.html'),
      'utf-8'
    ),
    text: fs.readFileSync(
      path.join(TEMPLATES_DIR, 'booking-confirmation.txt'),
      'utf-8'
    )
  },
  reminder24h: {
    html: fs.readFileSync(
      path.join(TEMPLATES_DIR, 'reminder-24h.html'),
      'utf-8'
    ),
    text: fs.readFileSync(
      path.join(TEMPLATES_DIR, 'reminder-24h.txt'),
      'utf-8'
    )
  },
  postcallSummary: {
    html: fs.readFileSync(
      path.join(TEMPLATES_DIR, 'postcall-summary.html'),
      'utf-8'
    ),
    text: fs.readFileSync(
      path.join(TEMPLATES_DIR, 'postcall-summary.txt'),
      'utf-8'
    )
  },
  cancellation: {
    html: fs.readFileSync(
      path.join(TEMPLATES_DIR, 'cancellation-confirmation.html'),
      'utf-8'
    ),
    text: fs.readFileSync(
      path.join(TEMPLATES_DIR, 'cancellation-confirmation.txt'),
      'utf-8'
    )
  }
};

export const compileTemplate = (key: keyof typeof templates, data: any) => {
  const template = templates[key];
  return {
    html: handlebars.compile(template.html)(data),
    text: handlebars.compile(template.text)(data)
  };
};
```

---

## Sending Emails

### Email Service Module

```typescript
// services/email.service.ts
import nodemailer from 'nodemailer';
import { compileTemplate } from '../templates/config';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendBookingConfirmation(email: string, data: any) {
  const { html, text } = compileTemplate('bookingConfirmation', data);

  return transporter.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Booking Confirmation - WISE²',
    html,
    text
  });
}

export async function sendReminder24h(email: string, data: any) {
  const { html, text } = compileTemplate('reminder24h', data);

  return transporter.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: `Reminder: Your Consultation Tomorrow - WISE²`,
    html,
    text
  });
}

export async function sendPostcallSummary(email: string, data: any) {
  const { html, text } = compileTemplate('postcallSummary', data);

  return transporter.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Post-Call Summary - WISE²',
    html,
    text
  });
}

export async function sendCancellation(email: string, data: any) {
  const { html, text } = compileTemplate('cancellation', data);

  return transporter.sendMail({
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Cancellation Confirmed - WISE²',
    html,
    text
  });
}
```

---

## Testing

### Test Emails Before Deployment

```bash
# Using Mailtrap or similar service
export SMTP_USER=test@mailtrap.io
export SMTP_PASS=your-test-password
npm run send:test-emails
```

### Preview in Browser
Open HTML files directly in a browser for quick visual checks. For email-specific testing:
- Use [Litmus](https://litmus.com) for multi-client preview
- Use [Email on Acid](https://www.emailonacid.com/) for rendering tests
- Test on real email clients (Gmail, Outlook, Apple Mail, etc.)

---

## Maintenance

### Updating Templates
1. Edit HTML/text files as needed
2. Maintain consistency with WISE² brand guidelines
3. Test responsive design at 600px width
4. Verify all Handlebars variables are documented
5. Send test emails to multiple clients

### Adding New Templates
1. Create `new-template.html` and `new-template.txt`
2. Follow the same structure and variable naming conventions
3. Update this README with template details
4. Add configuration to `templates/config.ts`
5. Create email service function for sending

---

## Support

For questions or issues with email templates:
- Email: support@wise2.io
- Documentation: See WISE² Brand Guidelines
- Brand Colors: Use hex codes provided in Design System section

---

**Version:** 1.0  
**Last Updated:** 2026-07-23  
**Maintained By:** WISE² Development Team
