export interface EmailVerificationToken {
  token: string;
  email: string;
  expiresAt: number;
  verified: boolean;
}

// Simple in-memory storage for demo (replace with database in production)
const verificationTokens: Map<string, EmailVerificationToken> = new Map();

export const generateVerificationToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const createVerificationToken = (email: string): string => {
  const token = generateVerificationToken();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  verificationTokens.set(token, {
    token,
    email,
    expiresAt,
    verified: false,
  });

  return token;
};

export const verifyToken = (token: string): boolean => {
  const record = verificationTokens.get(token);

  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    verificationTokens.delete(token);
    return false;
  }

  record.verified = true;
  return true;
};

export const getVerificationEmail = (email: string, token: string): string => {
  const verificationLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://wise2.net'}/verify?token=${token}`;

  return `
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #050505; color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 32px; margin: 0; color: #0094FF;">WISE²</h1>
            <p style="font-size: 14px; color: #888; margin: 10px 0 0 0;">Verify your email address</p>
          </div>

          <div style="background: #1a1a1a; padding: 30px; border-radius: 8px; border: 1px solid #333;">
            <p style="font-size: 16px; margin: 0 0 20px 0;">Welcome to WISE²!</p>
            <p style="font-size: 14px; color: #aaa; margin: 0 0 30px 0;">
              Thank you for signing up. Please verify your email address to get started.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="display: inline-block; padding: 12px 30px; background: #0094FF; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Verify Email
              </a>
            </div>

            <p style="font-size: 12px; color: #666; text-align: center; margin: 30px 0 0 0;">
              Or copy and paste this link in your browser:<br/>
              <span style="color: #0094FF; word-break: break-all;">${verificationLink}</span>
            </p>
          </div>

          <p style="font-size: 12px; color: #666; text-align: center; margin-top: 40px;">
            This link expires in 24 hours. If you didn't create this account, please ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;
};

export const getSuccessEmail = (email: string): string => {
  return `
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #050505; color: #ffffff;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 32px; margin: 0; color: #0094FF;">WISE²</h1>
            <p style="font-size: 14px; color: #888; margin: 10px 0 0 0;">Welcome aboard!</p>
          </div>

          <div style="background: #1a1a1a; padding: 30px; border-radius: 8px; border: 1px solid #333;">
            <div style="text-align: center; font-size: 48px; margin-bottom: 20px;">✨</div>
            <p style="font-size: 18px; margin: 0 0 20px 0; text-align: center; font-weight: 600;">Your account is ready!</p>
            <p style="font-size: 14px; color: #aaa; margin: 0 0 30px 0; text-align: center;">
              Your email has been verified and your WISE² account is fully activated. You're all set to start building.
            </p>

            <div style="text-align: center;">
              <a href="https://wise2.net" style="display: inline-block; padding: 12px 30px; background: #0094FF; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Go to Dashboard
              </a>
            </div>
          </div>

          <div style="margin-top: 40px; padding: 20px; background: #1a1a1a; border-radius: 8px; border: 1px solid #333;">
            <h3 style="font-size: 14px; margin: 0 0 15px 0; color: #0094FF;">Getting started:</h3>
            <ul style="font-size: 14px; color: #aaa; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 10px;">Complete your profile</li>
              <li style="margin-bottom: 10px;">Explore Sound Labs</li>
              <li>Connect your tools</li>
            </ul>
          </div>
        </div>
      </body>
    </html>
  `;
};
