// src/utils/templates/template.ts

/**
 * Email Templates for DSA Tracker
 * ------------------------------------------------------
 * Professional email templates styled to match the DSA Tracker
 * design system:
 *   - Primary: #ff6b35 (vibrant orange)
 *   - Secondary: #f77f00 (warm orange)
 *   - Background: Dark gradient theme
 *   - Font: Inter, Arial, sans-serif
 *
 * NOTE: Email HTML must stay simple/table-safe — many clients
 * (Outlook especially) don't fully support modern CSS. Keep this
 * inline-style + embedded <style> hybrid approach.
 * ------------------------------------------------------
 */

/**
 * Password Reset Email Template
 */
export const passwordResetTemplate = (url: string) => ({
  subject: "🔐 Reset Your DSA Tracker Password",
  text: `To reset your password, please click the following link: ${url}\n\nThis link expires in 30 minutes. If you didn't request this, you can safely ignore this email.`,
  html: `
    <html>
      <head>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            font-family: 'Inter', Arial, sans-serif;
            background-color: #1a1a1a;
            color: #ffffff;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 0;
            background-color: #2a2a2a;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.3);
            border: 2px solid #ff6b35;
          }
          .header {
            background: linear-gradient(135deg, #ff6b35 0%, #f77f00 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .header .logo-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            border-radius: 14px;
            background-color: rgba(255, 255, 255, 0.2);
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 16px;
            border: 3px solid rgba(255, 255, 255, 0.3);
          }
          .header .brand-name {
            display: block;
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 4px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          .header .brand-tag {
            display: block;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.9);
            letter-spacing: 2px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .content {
            padding: 40px 32px;
            text-align: center;
          }
          .content h1 {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 16px;
          }
          .content p {
            font-size: 15px;
            color: #b0b0b0;
            line-height: 1.7;
            margin: 0 0 28px;
          }
          .button {
            display: inline-block;
            padding: 16px 40px;
            font-size: 15px;
            font-weight: 600;
            background: linear-gradient(135deg, #ff6b35 0%, #f77f00 100%);
            color: #ffffff !important;
            border-radius: 10px;
            text-decoration: none;
            box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255, 107, 53, 0.5);
          }
          .security-box {
            background-color: rgba(255, 107, 53, 0.1);
            border-left: 4px solid #ff6b35;
            padding: 20px;
            margin: 28px 0;
            border-radius: 8px;
            text-align: left;
          }
          .security-box p {
            margin: 8px 0;
            font-size: 14px;
            color: #d0d0d0;
          }
          .security-box strong {
            color: #ff6b35;
          }
          .expiry-note {
            font-size: 13px;
            color: #888;
            margin-top: 24px !important;
            margin-bottom: 0 !important;
          }
          .divider {
            border: none;
            border-top: 1px solid #3a3a3a;
            margin: 0;
          }
          .footer {
            font-size: 12px;
            color: #888;
            text-align: center;
            padding: 24px;
            background-color: #1f1f1f;
          }
          .footer p {
            margin: 6px 0;
          }
          .footer a {
            color: #ff6b35;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo-badge">💻</span>
            <span class="brand-name">DSA Tracker</span>
            <span class="brand-tag">Master DSA</span>
          </div>
          <div class="content">
            <h1>🔐 Reset Your Password</h1>
            <p>We received a request to reset the password for your DSA Tracker account. Click the button below to choose a new password and get back to coding!</p>
            <a href="${url}" class="button">Reset Password</a>

            <div class="security-box">
              <p><strong>⚡ Quick Info:</strong></p>
              <p>• This link expires in <strong>30 minutes</strong></p>
              <p>• If you didn't request this, you can safely ignore this email</p>
              <p>• Your password will remain unchanged if you don't click the link</p>
            </div>

            <p class="expiry-note">Stay secure and keep crushing those DSA problems! 💪</p>
          </div>
          <hr class="divider" />
          <div class="footer">
            <p>This email was sent from <strong>DSA Tracker</strong></p>
            <p>Your personal companion for mastering Data Structures & Algorithms</p>
            <p style="margin-top: 12px;">Need help? We're here for you! 🚀</p>
          </div>
        </div>
      </body>
    </html>
  `,
});

/**
 * Study Plan Reminder Email Template
 */
export const studyPlanReminderTemplate = (data: {
  userName: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  problemsCount: number;
  problems?: Array<{ title: string; difficulty: string }>;
}) => {
  const timeInfo = data.startTime && data.endTime
    ? `${data.startTime} - ${data.endTime}`
    : data.startTime
    ? `Starting at ${data.startTime}`
    : "Today";

  const descriptionHtml = data.description
    ? `<p style="color: #b0b0b0; font-size: 14px; margin: 12px 0; font-style: italic;">${data.description}</p>`
    : "";

  const problemsList = data.problems && data.problems.length > 0
    ? `
      <div style="margin: 20px 0;">
        <p style="color: #ffffff; font-weight: 600; margin-bottom: 12px;">📝 Problems to solve:</p>
        ${data.problems.map((p, idx) => `
          <div style="background-color: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid ${
            p.difficulty === 'Easy' ? '#22c55e' : p.difficulty === 'Medium' ? '#eab308' : '#ef4444'
          };">
            <span style="color: #ffffff; font-size: 14px;">${idx + 1}. ${p.title}</span>
            <span style="color: ${
              p.difficulty === 'Easy' ? '#22c55e' : p.difficulty === 'Medium' ? '#eab308' : '#ef4444'
            }; font-size: 12px; margin-left: 8px; font-weight: 600;">${p.difficulty}</span>
          </div>
        `).join('')}
      </div>
    `
    : "";

  return {
    subject: `⏰ Study Reminder: ${data.title} - Let's Code!`,
    text: `Hi ${data.userName},\n\nThis is a reminder for your study session: ${data.title}\nDate: ${data.date}\nTime: ${timeInfo}\nProblems: ${data.problemsCount}\n\nGood luck with your studies!`,
    html: `
      <html>
        <head>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              font-family: 'Inter', Arial, sans-serif;
              background-color: #1a1a1a;
              color: #ffffff;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              padding: 0;
              background-color: #2a2a2a;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.3);
              border: 2px solid #ff6b35;
            }
            .header {
              background: linear-gradient(135deg, #ff6b35 0%, #f77f00 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .header h2 {
              color: #ffffff;
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            .content {
              padding: 40px 32px;
            }
            .greeting {
              font-size: 16px;
              color: #ffffff;
              margin-bottom: 16px;
            }
            .greeting strong {
              color: #ff6b35;
              font-weight: 600;
            }
            .intro-text {
              font-size: 15px;
              color: #b0b0b0;
              margin-bottom: 28px;
            }
            .session-card {
              background: linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(247, 127, 0, 0.1) 100%);
              padding: 24px;
              border-radius: 12px;
              border-left: 4px solid #ff6b35;
              margin: 24px 0;
            }
            .session-card h3 {
              color: #ff6b35;
              margin: 0 0 12px 0;
              font-size: 22px;
              font-weight: 700;
            }
            .session-info {
              margin: 12px 0;
              font-size: 15px;
            }
            .session-info strong {
              color: #ffffff;
              font-weight: 600;
            }
            .session-info span {
              color: #d0d0d0;
            }
            .motivation-box {
              background-color: rgba(255, 193, 7, 0.15);
              border-left: 4px solid #ffc107;
              padding: 20px;
              border-radius: 8px;
              margin: 24px 0;
            }
            .motivation-box p {
              margin: 0;
              color: #ffd54f;
              font-size: 15px;
              font-weight: 600;
            }
            .cta-section {
              text-align: center;
              margin: 32px 0;
            }
            .button {
              display: inline-block;
              padding: 16px 40px;
              font-size: 15px;
              font-weight: 600;
              background: linear-gradient(135deg, #ff6b35 0%, #f77f00 100%);
              color: #ffffff !important;
              border-radius: 10px;
              text-decoration: none;
              box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
              margin: 8px;
            }
            .divider {
              border: none;
              border-top: 1px solid #3a3a3a;
              margin: 32px 0;
            }
            .footer {
              font-size: 12px;
              color: #888;
              text-align: center;
              padding: 24px;
              background-color: #1f1f1f;
            }
            .footer p {
              margin: 6px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔔 Study Session Reminder</h2>
            </div>

            <div class="content">
              <p class="greeting">Hi <strong>${data.userName}</strong>,</p>
              <p class="intro-text">This is a friendly reminder for your upcoming study session. Time to dive into some amazing DSA problems! 🚀</p>

              <div class="session-card">
                <h3>${data.title}</h3>
                ${descriptionHtml}
                <div class="session-info">
                  <strong>📅 Date:</strong> <span>${data.date}</span>
                </div>
                <div class="session-info">
                  <strong>⏰ Time:</strong> <span>${timeInfo}</span>
                </div>
                <div class="session-info">
                  <strong>📊 Problems:</strong> <span>${data.problemsCount} problem${data.problemsCount > 1 ? 's' : ''} to solve</span>
                </div>
                ${problemsList}
              </div>

              <div class="motivation-box">
                <p>💪 <strong>Get ready to code!</strong> Make sure you have everything you need for a productive study session. You've got this!</p>
              </div>

              <div class="cta-section">
                <p style="color: #b0b0b0; margin-bottom: 16px;">Jump into your dashboard to get started:</p>
                <a href="${process.env.APP_ORIGIN || 'http://localhost:5173'}/calendar" class="button">View Study Plan</a>
              </div>

              <hr class="divider" />

              <p style="color: #d0d0d0; text-align: center; font-size: 15px; margin: 0;">
                Good luck with your studies! Remember, consistency is key to mastering DSA. 🎯
              </p>
            </div>

            <div class="footer">
              <p>This is an automated reminder from <strong>DSA Tracker</strong></p>
              <p>You're doing great - keep up the momentum! 🚀</p>
              <p style="margin-top: 12px; color: #666;">Master Data Structures & Algorithms, one problem at a time</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
};