// ═══════════════════════════════════════════════════════════════
// CONTRAQ — Email Service (SendGrid)
// Handles password reset, team invite, and trial expiry emails
// ═══════════════════════════════════════════════════════════════

const sgMail = require('@sendgrid/mail');

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@contraq.co.uk';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Contraq';
const APP_URL = process.env.APP_URL || 'http://localhost:8080';

let _configured = false;

function init() {
  if (SENDGRID_KEY) {
    sgMail.setApiKey(SENDGRID_KEY);
    _configured = true;
    console.log('[Email] SendGrid configured');
  } else {
    console.warn('[Email] SENDGRID_API_KEY not set — emails will be logged to console only');
  }
}

function isConfigured() { return _configured; }

async function send(to, subject, html, text) {
  const msg = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, '')
  };

  if (!_configured) {
    console.log('[Email] (not sent — no SendGrid key)', JSON.stringify({ to, subject }, null, 2));
    return { sent: false, reason: 'not_configured' };
  }

  try {
    await sgMail.send(msg);
    console.log(`[Email] Sent "${subject}" to ${to}`);
    return { sent: true };
  } catch (err) {
    console.error('[Email] Send failed:', err.message);
    return { sent: false, reason: err.message };
  }
}

// ─── Email Templates ────────────────────────────────────────

function passwordResetEmail(toEmail, resetToken) {
  const resetUrl = `${APP_URL}/?reset=${resetToken}`;
  const subject = 'Reset your Contraq password';
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:500px;margin:0 auto;padding:2rem;">
      <div style="background:#0a0b0d;border-radius:12px;padding:2rem;color:#fff;">
        <div style="font-size:1.1rem;font-weight:700;margin-bottom:1rem;">CONTR<span style="color:#f97316">AQ</span></div>
        <h2 style="font-size:1.2rem;margin-bottom:.5rem;">Password Reset</h2>
        <p style="color:#9ca3af;font-size:.9rem;line-height:1.6;">
          We received a request to reset your password. Click the button below to set a new one.
        </p>
        <a href="${resetUrl}" style="display:inline-block;margin:1rem 0;padding:.75rem 1.5rem;background:#f97316;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:.9rem;">
          Reset Password
        </a>
        <p style="color:#6b7280;font-size:.75rem;line-height:1.5;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;
  return send(toEmail, subject, html);
}

function teamInviteEmail(toEmail, inviterName, orgName, tempPassword) {
  const loginUrl = `${APP_URL}`;
  const subject = `You've been invited to ${orgName} on Contraq`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:500px;margin:0 auto;padding:2rem;">
      <div style="background:#0a0b0d;border-radius:12px;padding:2rem;color:#fff;">
        <div style="font-size:1.1rem;font-weight:700;margin-bottom:1rem;">CONTR<span style="color:#f97316">AQ</span></div>
        <h2 style="font-size:1.2rem;margin-bottom:.5rem;">You're invited</h2>
        <p style="color:#9ca3af;font-size:.9rem;line-height:1.6;">
          <strong style="color:#fff;">${inviterName}</strong> has invited you to join
          <strong style="color:#fff;">${orgName}</strong> on Contraq.
        </p>
        <div style="background:#1a1b1e;border:1px solid #2a2f36;border-radius:8px;padding:1rem;margin:1rem 0;">
          <div style="font-size:.75rem;color:#6b7280;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.25rem;">Your login</div>
          <div style="font-family:monospace;font-size:.85rem;color:#f97316;margin-bottom:.5rem;">${toEmail}</div>
          <div style="font-size:.75rem;color:#6b7280;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.25rem;">Temporary password</div>
          <div style="font-family:monospace;font-size:.85rem;color:#a3e635;">${tempPassword}</div>
        </div>
        <a href="${loginUrl}" style="display:inline-block;margin:.5rem 0;padding:.75rem 1.5rem;background:#f97316;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:.9rem;">
          Sign In to Contraq
        </a>
        <p style="color:#6b7280;font-size:.75rem;line-height:1.5;">
          Please change your password after your first login.
        </p>
      </div>
    </div>
  `;
  return send(toEmail, subject, html);
}

function trialExpiryWarning(toEmail, userName, daysLeft, orgName) {
  const upgradeUrl = `${APP_URL}`;
  const subject = daysLeft === 1
    ? `Your Contraq trial ends tomorrow`
    : `${daysLeft} days left on your Contraq trial`;
  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:500px;margin:0 auto;padding:2rem;">
      <div style="background:#0a0b0d;border-radius:12px;padding:2rem;color:#fff;">
        <div style="font-size:1.1rem;font-weight:700;margin-bottom:1rem;">CONTR<span style="color:#f97316">AQ</span></div>
        <h2 style="font-size:1.2rem;margin-bottom:.5rem;">
          ${daysLeft <= 1 ? 'Your trial ends tomorrow' : daysLeft + ' days left on your free trial'}
        </h2>
        <p style="color:#9ca3af;font-size:.9rem;line-height:1.6;">
          Hi ${userName}, your 7-day Contraq trial for <strong style="color:#fff;">${orgName}</strong> is ending soon.
          Upgrade now to keep access to AI-powered take-offs, project management, and everything you've built.
        </p>
        <a href="${upgradeUrl}" style="display:inline-block;margin:1rem 0;padding:.75rem 1.5rem;background:#f97316;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:.9rem;">
          Choose a Plan
        </a>
        <p style="color:#6b7280;font-size:.75rem;line-height:1.5;">
          Your data will be preserved — you just won't be able to access it until you upgrade.
        </p>
      </div>
    </div>
  `;
  return send(toEmail, subject, html);
}

module.exports = {
  init,
  isConfigured,
  send,
  passwordResetEmail,
  teamInviteEmail,
  trialExpiryWarning
};
