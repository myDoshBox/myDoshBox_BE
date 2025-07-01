import { generateMailTransporter } from "../../../utilities/email.utils";

export const sendDisputeMailToBuyer = async (
  buyer_email: string,
  product_name: string,
  dispute_description: string
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
    <title>Dispute Raised by Seller</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${buyer_email},</p>
          <p>The seller of the goods, ${product_name} has raised a dispute against your transaction</p>

          <p>${dispute_description}</p>

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
      to: buyer_email,
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

export const sendDisputeMailToSeller = async (
  vendor_email: string,
  product_name: string,
  dispute_description: string
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
    <title>Dispute Raised by Seller</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${vendor_email},</p>
          <p>The buyer of the goods, ${product_name} has raised a dispute against your product</p>

          <p>${dispute_description}</p>

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
      to: vendor_email,
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

export const sendTransactionCancellationMailToBuyer = async (
  vendor_email: string,
  product_name: string,
  dispute_description: string
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
    <title>Dispute Raised by Seller</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${vendor_email},</p>
          <p>The buyer of the goods, ${product_name} has raised a dispute against your product</p>

          <p>${dispute_description}</p>

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
      to: vendor_email,
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
