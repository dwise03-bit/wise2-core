// Database (Supabase)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function saveFormSubmission(data: {
  projectId: string;
  fullName: string;
  email: string;
  companyName: string;
  projectType: string;
  projectDescription: string;
  primaryGoal?: string;
  preferredTimeline?: string;
  budgetRange?: string;
  preferredContactMethod?: string[];
  phone?: string;
  website?: string;
  additionalInfo?: string;
}) {
  if (!supabase) {
    console.warn('⚠ Supabase not configured — submission not saved to database');
    return { saved: false, reason: 'Supabase not configured' };
  }

  try {
    const { data: result, error } = await supabase
      .from('form_submissions')
      .insert([data]);

    if (error) {
      console.error('❌ Database error:', error);
      return { saved: false, error: error.message };
    }

    console.log('✅ Submission saved to database');
    return { saved: true, data: result };
  } catch (error) {
    console.error('❌ Failed to save submission:', error);
    return { saved: false, error: String(error) };
  }
}

// Email (Resend)
import { Resend } from 'resend';

const resendKey = process.env.RESEND_API_KEY;
export const resend = resendKey ? new Resend(resendKey) : null;

export async function sendConfirmationEmail(
  email: string,
  projectId: string,
  name: string
) {
  if (!resend) {
    console.warn('⚠ Resend not configured — confirmation email not sent');
    return { sent: false, reason: 'Resend not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'noreply@wise2.ai',
      to: email,
      subject: `Your Project ID: ${projectId}`,
      html: `
        <h2>Hello ${name}!</h2>
        <p>Thank you for submitting your project details.</p>
        <p><strong>Your Project ID:</strong> <code>${projectId}</code></p>
        <p>We'll review your information and send you a customized strategy within 24 hours.</p>
        <p>Best regards,<br/>Wise² Team</p>
      `,
    });

    console.log('✅ Confirmation email sent');
    return { sent: true, data: result };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { sent: false, error: String(error) };
  }
}

// Analytics (PostHog)
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
    });
  }
}

export function trackFormSubmission(data: {
  projectId: string;
  projectType: string;
  budgetRange?: string;
}) {
  if (typeof window === 'undefined') return;

  try {
    posthog?.capture('form_submitted', {
      projectId: data.projectId,
      projectType: data.projectType,
      budgetRange: data.budgetRange || 'not_specified',
    });
    console.log('✅ Analytics event tracked');
  } catch (error) {
    console.error('⚠ Failed to track event:', error);
  }
}

export function trackFormStep(step: number) {
  if (typeof window === 'undefined') return;

  try {
    posthog?.capture('form_step_completed', { step });
  } catch (error) {
    console.error('⚠ Failed to track step:', error);
  }
}
