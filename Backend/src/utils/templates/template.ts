// src/emails/passwordResetTemplate.ts

/**
 * passwordResetTemplate
 * ------------------------------------------------------
 * Password reset email — styled to match the Premier Seals VMS
 * design system (same tokens as src/config/styleConfig.css):
 *   - Primary: #1e3a8a (deep enterprise blue)
 *   - Header/brand bg: #0f172a (matches app sidebar)
 *   - Font: Inter (falls back to system sans-serif for email clients
 *     that don't support @font-face, which is most of them)
 *
 * NOTE: Email HTML must stay simple/table-safe — many clients
 * (Outlook especially) don't fully support modern CSS. Keep this
 * inline-style + embedded <style> hybrid approach; don't switch
 * to Tailwind classes or CSS variables here, they won't render
 * correctly in email clients.
 * ------------------------------------------------------
 */
export const passwordResetTemplate = (
  url: string,
  brandColor: string = "#1e3a8a" // matches --color-primary
) => ({
  subject: "Reset Your Premier Seals VMS Password",
  text: `To reset your password, please click the following link: ${url}\n\nThis link expires in 30 minutes. If you didn't request this, you can safely ignore this email.`,
  html: `
        <html><head><style>
          body, html { margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #f8fafc; color: #0f172a; }
          .container { max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0px 4px 12px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0; }
          .header { background-color: #0f172a; padding: 28px 20px; text-align: center; }
          .header .logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 10px; background-color: ${brandColor}; color: #ffffff; font-size: 15px; font-weight: 700; line-height: 40px; margin-bottom: 10px; }
          .header .brand-name { display: block; font-size: 16px; font-weight: 600; color: #ffffff; }
          .header .brand-tag { display: block; font-size: 11px; color: #94a3b8; letter-spacing: 0.5px; margin-top: 2px; }
          .content { padding: 36px 32px; text-align: center; }
          .content h1 { font-size: 20px; font-weight: 600; color: #0f172a; margin: 0 0 12px; }
          .content p { font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px; }
          .button { display: inline-block; padding: 13px 28px; font-size: 14px; font-weight: 600; background-color: ${brandColor}; color: #ffffff !important; border-radius: 8px; text-decoration: none; }
          .expiry-note { font-size: 12px; color: #94a3b8; margin-top: 20px !important; margin-bottom: 0 !important; }
          .divider { border: none; border-top: 1px solid #e2e8f0; margin: 0; }
          .footer { font-size: 12px; color: #94a3b8; text-align: center; padding: 20px; background-color: #f8fafc; }
          .footer p { margin: 4px 0; }
        </style></head><body>
          <div class="container">
            <div class="header">
              <span class="logo-badge">PS</span>
              <span class="brand-name">Premier Seals</span>
              <span class="brand-tag">VENDOR MANAGEMENT SYSTEM</span>
            </div>
            <div class="content">
              <h1>Reset your password</h1>
              <p>We received a request to reset the password for your Premier Seals VMS account. Click the button below to choose a new password.</p>
              <a href="${url}" class="button">Reset Password</a>
              <p class="expiry-note">This link expires in 30 minutes. If you didn't request this, you can safely ignore this email — your password will remain unchanged.</p>
            </div>
            <hr class="divider" />
            <div class="footer">
              <p>Access to this system is invite-only. If you have questions, contact your system administrator.</p>
              <p>Premier Seals (India) Pvt. Ltd., Pune</p>
            </div>
          </div>
        </body></html>
      `,
});