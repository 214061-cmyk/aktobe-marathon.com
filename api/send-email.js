import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }

  try {
    const body = req.body || {};
    let recipients = body.recipients;
    if (!recipients && body.to) {
      recipients = [{ email: body.to, name: body.recipientName || 'Участник' }];
    }
    const subject = body.subject;
    const html = body.html;
    const config = body.config || body.serverConfig || {};

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients provided' });
    }

    if (!subject || !html) {
      return res.status(400).json({ error: 'Subject and HTML content are required' });
    }

    const provider = config?.provider || 'demo';
    const fromName = config?.fromName || 'Aqtobe International Marathon';
    const fromEmail = config?.fromEmail || 'noreply@aktobe-marathon.com';
    const fromHeader = `"${fromName}" <${fromEmail}>`;

    // 1. RESEND API PROVIDER
    if (provider === 'resend') {
      const apiKey = config?.resendApiKey || process.env.RESEND_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: 'Resend API key is not configured' });
      }

      let sentCount = 0;
      const errors = [];

      // Send to recipients (batches of 10)
      for (const rec of recipients) {
        const personalizedHtml = html.replace(/\{NAME\}/g, rec.name || 'Атлет');
        const personalizedSubject = subject.replace(/\{NAME\}/g, rec.name || 'Атлет');

        try {
          const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              from: fromHeader,
              to: [rec.email],
              subject: personalizedSubject,
              html: personalizedHtml
            })
          });

          if (!resp.ok) {
            const errData = await resp.json().catch(() => ({}));
            errors.push({ email: rec.email, error: errData.message || resp.statusText });
          } else {
            sentCount++;
          }
        } catch (e) {
          errors.push({ email: rec.email, error: e.message });
        }
      }

      return res.status(200).json({
        success: true,
        provider: 'resend',
        sentCount,
        totalCount: recipients.length,
        errors: errors.length > 0 ? errors.slice(0, 5) : []
      });
    }

    // 2. SMTP PROVIDER (Yandex, Mail.ru, Gmail, Custom Corporate Mail)
    if (provider === 'smtp') {
      const host = config?.smtpHost || process.env.SMTP_HOST;
      const port = Number(config?.smtpPort || process.env.SMTP_PORT || 465);
      const user = config?.smtpUser || process.env.SMTP_USER;
      const pass = config?.smtpPass || process.env.SMTP_PASS;
      const secure = config?.smtpSecure ?? (port === 465);

      if (!host || !user || !pass) {
        return res.status(400).json({ error: 'SMTP host, user and password are required' });
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });

      // Verify connection
      await transporter.verify();

      let sentCount = 0;
      const errors = [];

      for (const rec of recipients) {
        const personalizedHtml = html.replace(/\{NAME\}/g, rec.name || 'Атлет');
        const personalizedSubject = subject.replace(/\{NAME\}/g, rec.name || 'Атлет');

        try {
          await transporter.sendMail({
            from: fromHeader,
            to: rec.email,
            subject: personalizedSubject,
            html: personalizedHtml
          });
          sentCount++;
        } catch (err) {
          errors.push({ email: rec.email, error: err.message });
        }
      }

      return res.status(200).json({
        success: true,
        provider: 'smtp',
        sentCount,
        totalCount: recipients.length,
        errors: errors.length > 0 ? errors.slice(0, 5) : []
      });
    }

    // 3. DEMO / SIMULATION MODE (Default when keys not set yet)
    return res.status(200).json({
      success: true,
      provider: 'demo',
      mode: 'simulation',
      sentCount: recipients.length,
      totalCount: recipients.length,
      message: `Демо-режим: Успешно сформированы письма для ${recipients.length} участников. Для реальной отправки введите Resend API ключ или данные SMTP.`
    });

  } catch (error) {
    console.error('Email sending handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
