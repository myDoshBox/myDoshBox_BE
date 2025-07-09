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
    <title>Mediator Login Details</title>
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

export const sendMediatorInvolvementMailToMediator = async (
  mediator_email: string,
  mediator_first_name: string
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
    <title>Mediator Involvement Alert</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <p>Dear ${mediator_first_name},</p>
          <p>A new dispute has been assigned to you. Please review the details.</p>
    

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

export const sendResolutionMailToBuyer = async (
  buyer_email: string,
  product_name: string,
  resolution_description_result: string,
  dispute_fault_result: string
) => {
  try {
    const transport = generateMailTransporter();
    const supportEmail = "mydoshbox@gmail.com";

    let actionMessage = "";
    if (dispute_fault_result === "buyer") {
      actionMessage =
        "As the party at fault, you are required to keep the goods, and the payment will be released to the seller";
    } else if (dispute_fault_result === "seller") {
      actionMessage =
        "As the seller is at fault, please return the goods to receive a full refund.";
    }
    const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mediator Dispute Decision for ${product_name}</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding: 20px 0;">
              <p>Dear ${buyer_email},</p>
              <p>The dispute for the product <strong>${product_name}</strong> has been resolved by a mediator.</p>
              <p><strong>Mediator's Decision:</strong> Fault has been assigned to the ${dispute_fault_result}.</p>
              <p><strong>Resolution Details:</strong> ${resolution_description_result}</p>
              <p><strong>Action Required:</strong> ${actionMessage}</p>
    

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

export const sendResolutionMailToSeller = async (
  vendor_email: string,
  product_name: string,
  resolution_description_result: string,
  dispute_fault_result: string
) => {
  try {
    const transport = generateMailTransporter();
    const supportEmail = "mydoshbox@gmail.com";

    let actionMessage = "";
    if (dispute_fault_result === "buyer") {
      actionMessage =
        "As the buyer is at fault, the payment will be released to you.";
    } else if (dispute_fault_result === "seller") {
      actionMessage =
        "As you are at fault, the goods will be returned to you, and the payment will be refunded to the buyer.";
    }

    const emailMessage = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mediator Dispute Decision for ${product_name}</title>
  </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center" style="padding: 20px;">
              <p>Dear ${vendor_email},</p>
              <p>The dispute for the product <strong>${product_name}</strong> has been resolved by a mediator.</p>
              <p><strong>Mediator's Decision:</strong> Fault has been assigned to the ${dispute_fault_result}.</p>
              <p><strong>Resolution Details:</strong> ${resolution_description_result}</p>
              <p><strong>Action Required:</strong> ${actionMessage}</p>
              <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:${supportEmail}" style="text-decoration: none; color: #007bff;">${supportEmail}</a>.</p>
              <p>Best regards,<br>Doshbox Team</p>
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

// await sendMediatorLoginDetailsMail(email, password)
