import { generateMailTransporter } from "../../utilities/email.utils";

export const sendMediatorLoginDetailsMail = async (
  first_name: string,
  mediator_email: string,
  password: string
) => {
  try {
    const transport = generateMailTransporter();

    const supportEmail = "mydoshbox@gmail.com";
    const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Escrow Transaction Initiated Successfully</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${first_name},</p>
          <p>You have been successfully added as a mediator on the doshbox platform please find below your login details.</p>

          <p>${mediator_email}</p>
          <p>${password}</p>

          <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
          <p>Thank you for coming onboard as a mediator</p>
          <p>Best regards,<br>
          <p>Doshbox<br>
        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
    // console.log("here");
    const info = await transport.sendMail({
      to: mediator_email,
      from: process.env.VERIFICATION_EMAIL,
      subject: "Welcome Onboard Mediator",
      html: emailMessage, // Assign the HTML string directly to the html property
    });

    console.log("info mesage id: " + info?.messageId);
    console.log("info accepted: " + info?.accepted);
    console.log("info rejected: " + info?.rejected);
  } catch (error: unknown) {
    console.error("Error sending mail", error);
  }
};

// await sendMediatorLoginDetailsMail(email, password)
