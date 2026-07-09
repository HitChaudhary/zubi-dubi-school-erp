import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

const isConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);

let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true', // true for port 465, false for 587/25 (STARTTLS)
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
} else {
  console.warn(
    '[mailer] SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS are not fully set in .env — emails will be logged to the console instead of sent.'
  );
}

/**
 * Sends an email if SMTP is configured, otherwise logs it. Never throws —
 * a notification failure should never break the request/approval flow itself.
 */
async function sendMail({ to, subject, html }) {
  if (!isConfigured) {
    console.log(`[mailer] (not configured) would send to ${to}: "${subject}"`);
    return;
  }
  try {
    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('[mailer] Failed to send email:', err.message);
  }
}

const wrapper = (title, bodyHtml) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5eeff;border-radius:12px;">
    <h2 style="color:#3525cd;margin:0 0 16px 0;">${title}</h2>
    ${bodyHtml}
    <p style="color:#999;font-size:12px;margin-top:24px;">— Zubi Dubi</p>
  </div>
`;

export async function notifySuperAdminsOfNewRequest(superAdminEmails, request) {
  if (!superAdminEmails?.length) return;
  const html = wrapper(
    'New School Registration Request',
    `<p><strong>${request.schoolName}</strong> has requested to join Zubi Dubi.</p>
     <p>Admin: ${request.adminName} (${request.adminEmail})</p>
     <p>Log in to your Super Admin dashboard to approve or reject this request.</p>`
  );
  await Promise.all(
    superAdminEmails.map((to) => sendMail({ to, subject: `New school request: ${request.schoolName}`, html }))
  );
}

export async function notifyApplicantApproved(request) {
  const html = wrapper(
    'Your school has been approved! 🎉',
    `<p>Hi ${request.adminName},</p>
     <p><strong>${request.schoolName}</strong> has been approved on Zubi Dubi. You can now log in as School Admin using the email and password you registered with.</p>`
  );
  await sendMail({ to: request.adminEmail, subject: 'Your school has been approved', html });
}

export async function notifyApplicantRejected(request) {
  const html = wrapper(
    'Update on your school registration',
    `<p>Hi ${request.adminName},</p>
     <p>Unfortunately your request to register <strong>${request.schoolName}</strong> was not approved.</p>
     ${request.rejectionReason ? `<p><strong>Reason:</strong> ${request.rejectionReason}</p>` : ''}
     <p>You're welcome to submit a new request with updated details.</p>`
  );
  await sendMail({ to: request.adminEmail, subject: 'Your school registration was not approved', html });
}
