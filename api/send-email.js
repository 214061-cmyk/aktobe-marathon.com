import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed, use POST' });
  }

  try {
    const body = req.body || {};
    const action = body.action || 'send'; // 'verify' or 'send'
    const config = body.config || body.serverConfig || {};
    const provider = config?.provider || 'demo';

    // ========================================================
    // ACTION: VERIFY CONNECTION ONLY (TEST SETTINGS BUTTON)
    // ========================================================
    if (action === 'verify' || action === 'test_connection') {
      if (provider === 'demo') {
        return res.status(200).json({
          success: true,
          provider: 'demo',
          message: 'Демо-режим активен (симуляция без реальной отправки писем).'
        });
      }

      if (provider === 'resend') {
        const apiKey = config?.resendApiKey || process.env.RESEND_API_KEY;
        if (!apiKey) {
          return res.status(200).json({
            success: false,
            error: 'Не указан Resend API Key. Введите ключ формата re_...'
          });
        }

        try {
          const checkResp = await fetch('https://api.resend.com/api-keys', {
            method: 'GET',
            headers: { Authorization: `Bearer ${apiKey}` }
          });
          if (checkResp.ok) {
            return res.status(200).json({
              success: true,
              provider: 'resend',
              message: '✅ Соединение с Resend API успешно установлено! Ключ валиден.'
            });
          } else {
            const errJson = await checkResp.json().catch(() => ({}));
            return res.status(200).json({
              success: false,
              error: `Ошибка проверки Resend API: ${errJson.message || checkResp.statusText}`
            });
          }
        } catch (e) {
          return res.status(200).json({
            success: false,
            error: `Не удалось связаться с сервером Resend: ${e.message}`
          });
        }
      }

      if (provider === 'smtp') {
        const host = (config?.smtpHost || process.env.SMTP_HOST || '').trim();
        const port = Number(config?.smtpPort || process.env.SMTP_PORT || 465);
        const user = (config?.smtpUser || process.env.SMTP_USER || '').trim();
        const pass = (config?.smtpPass || config?.smtpPassword || process.env.SMTP_PASS || '').trim();
        const secure = config?.smtpSecure ?? (port === 465);

        if (!host) {
          return res.status(200).json({ success: false, error: 'Укажите адрес SMTP Host (например, 212.154.181.99 или smtp.yandex.ru)' });
        }
        if (!user) {
          return res.status(200).json({ success: false, error: 'Укажите логин / email для авторизации на SMTP сервере' });
        }
        if (!pass) {
          return res.status(200).json({ success: false, error: 'Укажите пароль учетной записи SMTP' });
        }

        try {
          const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
            tls: { 
              rejectUnauthorized: false 
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000
          });

          await transporter.verify();

          return res.status(200).json({
            success: true,
            provider: 'smtp',
            message: `✅ Успешное подключение! SMTP-сервер ${host}:${port} ответил, авторизация пользователя "${user}" подтверждена.`
          });
        } catch (verifyErr) {
          return res.status(200).json({
            success: false,
            provider: 'smtp',
            error: `Ошибка подключения к SMTP (${host}:${port}): ${verifyErr.message || verifyErr}`
          });
        }
      }

      return res.status(200).json({ success: true, message: 'Проверка завершена.' });
    }

    // ========================================================
    // ACTION: SEND EMAIL(S)
    // ========================================================
    let recipients = body.recipients;
    if (!recipients && body.to) {
      recipients = [{ email: body.to, name: body.recipientName || 'Участник' }];
    }
    const subject = body.subject;
    const html = body.html;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(200).json({ success: false, error: 'Не указаны получатели письма' });
    }

    if (!subject || !html) {
      return res.status(200).json({ success: false, error: 'Тема письма и HTML-содержимое обязательны для заполнения' });
    }

    const fromName = config?.fromName || 'Aqtobe International Marathon';
    const fromEmail = config?.fromEmail || config?.smtpUser || 'noreply@aktobe-marathon.com';
    const fromHeader = `"${fromName}" <${fromEmail}>`;

    // 1. RESEND API PROVIDER
    if (provider === 'resend') {
      const apiKey = config?.resendApiKey || process.env.RESEND_API_KEY;
      if (!apiKey) {
        return res.status(200).json({ success: false, error: 'Resend API key не настроен' });
      }

      let sentCount = 0;
      const errors = [];

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

      if (sentCount === 0 && errors.length > 0) {
        return res.status(200).json({
          success: false,
          sentCount: 0,
          error: `Ошибка доставки Resend: ${errors[0]?.error || 'Не удалось отправить'}`,
          errors
        });
      }

      return res.status(200).json({
        success: errors.length === 0,
        provider: 'resend',
        sentCount,
        totalCount: recipients.length,
        errors: errors.slice(0, 5)
      });
    }

    // 2. SMTP PROVIDER
    if (provider === 'smtp') {
      const host = (config?.smtpHost || process.env.SMTP_HOST || '').trim();
      const port = Number(config?.smtpPort || process.env.SMTP_PORT || 465);
      const user = (config?.smtpUser || process.env.SMTP_USER || '').trim();
      const pass = (config?.smtpPass || config?.smtpPassword || process.env.SMTP_PASS || '').trim();
      const secure = config?.smtpSecure ?? (port === 465);

      if (!host || !user || !pass) {
        return res.status(200).json({ success: false, error: 'Не заполнены параметры SMTP (Хост, Логин или Пароль)' });
      }

      let transporter;
      try {
        transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 12000,
          greetingTimeout: 12000,
          socketTimeout: 18000
        });

        // Verify connection before sending
        await transporter.verify();
      } catch (connErr) {
        return res.status(200).json({
          success: false,
          sentCount: 0,
          error: `Ошибка соединения с SMTP (${host}:${port}): ${connErr.message || connErr}`
        });
      }

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

      if (sentCount === 0 && errors.length > 0) {
        return res.status(200).json({
          success: false,
          sentCount: 0,
          totalCount: recipients.length,
          error: `Ошибка отправки письма: ${errors[0]?.error || 'Сервер отклонил отправку'}`,
          errors
        });
      }

      return res.status(200).json({
        success: errors.length === 0,
        provider: 'smtp',
        sentCount,
        totalCount: recipients.length,
        errors: errors.slice(0, 5)
      });
    }

    // 3. DEMO / SIMULATION MODE
    return res.status(200).json({
      success: true,
      provider: 'demo',
      mode: 'simulation',
      sentCount: recipients.length,
      totalCount: recipients.length,
      message: `Демо-режим: Успешно сформированы письма для ${recipients.length} участников (симуляция).`
    });

  } catch (error) {
    console.error('Email sending handler error:', error);
    return res.status(200).json({ success: false, error: error.message || 'Внутренняя ошибка сервера отправки' });
  }
}
