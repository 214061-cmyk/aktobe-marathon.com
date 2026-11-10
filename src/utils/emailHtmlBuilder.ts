import { EmailTemplate } from '../types/marathon';

/**
 * Builds a clean, responsive HTML email matching Aktobe Marathon branding
 */
export function buildEmailHtml(template: EmailTemplate, recipientName: string = '{NAME}'): string {
  const currentYear = new Date().getFullYear();
  const bannerImageHtml = template.bannerImageUrl
    ? `
      <tr>
        <td style="padding: 0; text-align: center; background-color: #0b0d14;">
          <img 
            src="${template.bannerImageUrl}" 
            alt="${template.title}" 
            style="width: 100%; max-width: 600px; height: auto; display: block; border-top-left-radius: 16px; border-top-right-radius: 16px; border: 0;"
          />
        </td>
      </tr>
    `
    : '';

  const highlightHtml = (template.highlightBoxTitle || template.highlightBoxText)
    ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; background: linear-gradient(135deg, #181b29, #0f111a); border-radius: 16px; border: 1px solid rgba(234, 179, 8, 0.3);">
        <tr>
          <td style="padding: 20px 24px;">
            ${template.highlightBoxTitle ? `<h4 style="margin: 0 0 8px 0; color: #facc15; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">${template.highlightBoxTitle}</h4>` : ''}
            ${template.highlightBoxText ? `<p style="margin: 0; color: #e2e8f0; font-size: 14px; line-height: 1.6;">${template.highlightBoxText}</p>` : ''}
          </td>
        </tr>
      </table>
    `
    : '';

  const greeting = (template.greetingText || 'Здравствуйте, {NAME}!')
    .replace(/\{NAME\}/g, recipientName);

  const mainBody = (template.mainBodyText || '')
    .replace(/\{NAME\}/g, recipientName)
    .split('\n')
    .filter(p => p.trim().length > 0)
    .map(p => `<p style="margin: 0 0 16px 0; color: #cbd5e1; font-size: 15px; line-height: 1.7;">${p.trim()}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #050608; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; }
    @media only screen and (max-width: 620px) {
      .container-table { width: 100% !important; border-radius: 0 !important; }
      .content-padding { padding: 24px 18px !important; }
      .header-title { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #050608; color: #f8fafc;">
  
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #050608;">
    <tr>
      <td align="center" style="padding: 0 10px;">
        
        <!-- MAIN CONTAINER -->
        <table role="presentation" class="container-table" width="600" cellpadding="0" cellspacing="0" style="width: 600px; max-width: 600px; background-color: #0e1017; border-radius: 24px; border: 1px solid #1f2433; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- BRAND TOP BAR -->
          <tr>
            <td style="padding: 20px 28px; background-color: #090a0f; border-bottom: 1px solid #1a1e2d; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; font-size: 16px; font-weight: 900; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase;">
                      AQTOBE <span style="color: #dc2626;">MARATHON</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; font-weight: 700; color: #a3e635; text-transform: uppercase; letter-spacing: 1px; background: rgba(163, 230, 53, 0.1); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(163, 230, 53, 0.3);">
                      Официальная рассылка
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BANNER IMAGE -->
          ${bannerImageHtml}

          <!-- BODY CONTENT -->
          <tr>
            <td class="content-padding" style="padding: 36px 32px 28px 32px; background-color: #0e1017;">
              
              <!-- Badge -->
              ${template.badgeText ? `
                <div style="margin-bottom: 14px;">
                  <span style="display: inline-block; font-size: 11px; font-weight: 800; color: #facc15; text-transform: uppercase; letter-spacing: 1.5px; background: rgba(250, 204, 21, 0.12); padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(250, 204, 21, 0.3);">
                    ${template.badgeText}
                  </span>
                </div>
              ` : ''}

              <!-- Title -->
              <h1 class="header-title" style="margin: 0 0 20px 0; color: #ffffff; font-size: 28px; font-weight: 900; line-height: 1.25; letter-spacing: 0.5px; text-transform: uppercase;">
                ${template.title}
              </h1>

              <!-- Greeting -->
              <h3 style="margin: 0 0 16px 0; color: #f1f5f9; font-size: 18px; font-weight: 700;">
                ${greeting}
              </h3>

              <!-- Main Text -->
              <div style="margin-bottom: 24px;">
                ${mainBody}
              </div>

              <!-- Highlight Box -->
              ${highlightHtml}

              <!-- CTA BUTTON -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="${template.ctaButtonUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #dc2626, #e11d48); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.2px; padding: 16px 36px; border-radius: 14px; box-shadow: 0 10px 25px rgba(220, 38, 38, 0.4);">
                      ${template.ctaButtonText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              ${template.footerNote ? `
                <p style="margin: 16px 0 0 0; text-align: center; color: #64748b; font-size: 12px; font-style: italic;">
                  ${template.footerNote}
                </p>
              ` : ''}

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 32px; background-color: #06070a; border-top: 1px solid #1a1e2d; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px; font-weight: 600;">
                Оргкомитет Aqtobe International Marathon
              </p>
              <p style="margin: 0 0 12px 0; color: #64748b; font-size: 11px; line-height: 1.5;">
                г. Актобе, Казахстан • Официальный сайт: <a href="https://aktobe-marathoncom.vercel.app/" style="color: #cbd5e1; text-decoration: underline;">aktobe-marathon.com</a>
              </p>
              <p style="margin: 0; color: #475569; font-size: 10px; line-height: 1.4;">
                Вы получили это письмо, так как ранее регистрировались на забегах Aqtobe Marathon Series.<br/>
                &copy; ${currentYear} Aqtobe Marathon. Все права защищены.
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>`;
}
