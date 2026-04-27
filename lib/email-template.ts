/**
 * Shared HTML email template with BP Slib signature and logo.
 *
 * The logo is referenced via absolute URL on the live site so email
 * clients can display it without needing an attachment.
 */

const SITE_URL = (process.env.APP_BASE_URL || "https://bpslib.dk").replace(/\/+$/, "");
const LOGO_URL = `${SITE_URL}/images/brand/logo-cropped.png`;

const COMPANY = {
  name: "BP Slib",
  tagline: "Din lokale håndværker",
  phone: "+45 2691 3737",
  email: "info@bpslib.dk",
  website: "https://bpslib.dk",
  cvr: "45700453",
};

/**
 * Wraps a plain-text message body in a branded HTML email with signature.
 * Line breaks in the message are converted to <br> tags.
 */
export const wrapInEmailTemplate = (opts: {
  greeting: string;
  body: string;
}) => {
  // Body is expected to be HTML — only convert bare newlines to <br>, don't escape tags
  const bodyHtml = opts.body.replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BP Slib</title>
</head>
<body style="margin:0; padding:0; background-color:#f7f7f5; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e8e5e0;">
          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 16px; font-size:15px; line-height:1.6; color:#1a1a1a;">
                ${opts.greeting}
              </p>
              <p style="margin:0; font-size:15px; line-height:1.6; color:#1a1a1a;">
                ${bodyHtml}
              </p>
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding:0 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid #e8e5e0; padding-top:20px; width:100%;">
                <tr>
                  <td style="padding-top:20px; vertical-align:top; width:70px;">
                    <img
                      src="${LOGO_URL}"
                      alt="BP Slib"
                      width="56"
                      height="56"
                      style="display:block; border-radius:8px;"
                    />
                  </td>
                  <td style="padding-top:20px; vertical-align:top;">
                    <p style="margin:0 0 2px; font-size:14px; font-weight:600; color:#1a1a1a;">
                      ${COMPANY.name}
                    </p>
                    <p style="margin:0 0 8px; font-size:12px; color:#888;">
                      ${COMPANY.tagline}
                    </p>
                    <p style="margin:0; font-size:13px; line-height:1.5; color:#555;">
                      Tlf: <a href="tel:${COMPANY.phone.replace(/\s/g, "")}" style="color:#555; text-decoration:none;">${COMPANY.phone}</a><br>
                      Email: <a href="mailto:${COMPANY.email}" style="color:#555; text-decoration:none;">${COMPANY.email}</a><br>
                      Web: <a href="${COMPANY.website}" style="color:#c2410c; text-decoration:none;">${COMPANY.website.replace("https://", "")}</a><br>
                      CVR: ${COMPANY.cvr}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <p style="margin:16px 0 0; font-size:11px; color:#aaa; text-align:center;">
          &copy; ${new Date().getFullYear()} ${COMPANY.name} &middot; ${COMPANY.tagline}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
