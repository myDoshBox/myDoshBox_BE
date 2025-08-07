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

export const sendMediatorInvolvementMailToBuyer = async (
  buyer_email: string,
  product_name: string
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
    <title>Mediator Involved Successful</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${buyer_email},</p>
          <p>The dispute raised for the product, ${product_name} has been assigned to a mediator.</p>
    

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
      subject: "New Dispute",
      html: emailMessage, // Assign the HTML string directly to the html property
    });

    console.log("info mesage id: " + info?.messageId);
    console.log("info accepted: " + info?.accepted);
    console.log("info rejected: " + info?.rejected);
  } catch (error: unknown) {
    console.error("Error sending mail", error);
  }
};

export const sendMediatorInvolvementMailToSeller = async (
  vendor_email: string,
  product_name: string
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
    <title>Mediator Involved Successful</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${vendor_email},</p>
          <p>The dispute raised for the product, ${product_name} has been assigned to a mediator.</p>
    

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
      subject: "New Dispute",
      html: emailMessage, // Assign the HTML string directly to the html property
    });

    console.log("info mesage id: " + info?.messageId);
    console.log("info accepted: " + info?.accepted);
    console.log("info rejected: " + info?.rejected);
  } catch (error: unknown) {
    console.error("Error sending mail", error);
  }
};

export const sendBuyerResolutionMailToBuyer = async (
  buyer_email: string,
  product_name: string
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
    <title>Buyer Resolution Message</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${buyer_email},</p>
          <p>You have chosen to resolve the conflict raised by the seller for the product, ${product_name}. The seller has been notified of your choice and will either accept your resolution or involve a mediator</p>
    

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
      subject: "New Dispute",
      html: emailMessage, // Assign the HTML string directly to the html property
    });

    console.log("info mesage id: " + info?.messageId);
    console.log("info accepted: " + info?.accepted);
    console.log("info rejected: " + info?.rejected);
  } catch (error: unknown) {
    console.error("Error sending mail", error);
  }
};

export const sendBuyerResolutionMailToSeller = async (
  vendor_email: string,
  product_name: string
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
    <title>Buyer Resolution Message</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${vendor_email},</p>
          <p>The buyer has chosen to resolve the conflict you raised for the product, ${product_name}. The buyer awaits your choice to either accept the proposed resolution or involve a mediator</p>
    

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
      subject: "New Dispute",
      html: emailMessage, // Assign the HTML string directly to the html property
    });

    console.log("info mesage id: " + info?.messageId);
    console.log("info accepted: " + info?.accepted);
    console.log("info rejected: " + info?.rejected);
  } catch (error: unknown) {
    console.error("Error sending mail", error);
  }
};

export const sendSellerResolutionMailToBuyer = async (
  buyer_email: string,
  product_name: string
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
    <title>Seller Resolution Message</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${buyer_email},</p>
          <p>The seller has chosen to resolve the conflict you raised for the product, ${product_name}. The seller awaits your choice to either accept the proposed resolution or involve a mediator</p>
    

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
      subject: "New Dispute",
      html: emailMessage, // Assign the HTML string directly to the html property
    });

    console.log("info mesage id: " + info?.messageId);
    console.log("info accepted: " + info?.accepted);
    console.log("info rejected: " + info?.rejected);
  } catch (error: unknown) {
    console.error("Error sending mail", error);
  }
};

export const sendSellerResolutionMailToSeller = async (
  vendor_email: string,
  product_name: string
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
    <title>Seller Resolution Message</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${vendor_email},</p>
          <p>You have chosen to resolve the conflict raised by the buyer of the product, ${product_name}. The buyer has been notified of your choice and will either accept your resolution or involve a mediator</p>
    

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
      subject: "New Dispute",
      html: emailMessage, // Assign the HTML string directly to the html property
    });

    console.log("info mesage id: " + info?.messageId);
    console.log("info accepted: " + info?.accepted);
    console.log("info rejected: " + info?.rejected);
  } catch (error: unknown) {
    console.error("Error sending mail", error);
  }
};
