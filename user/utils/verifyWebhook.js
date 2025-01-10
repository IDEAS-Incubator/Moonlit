import crypto from "crypto";
import fetch from "node-fetch";

/**
 * Verifies the PayPal webhook event.
 * @param {Buffer} rawBody - Raw request body.
 * @param {Object} headers - Request headers.
 * @param {String} webhookId - Your PayPal Webhook ID.
 * @returns {Boolean} - Whether the webhook is valid or not.
 */
export async function verifyWebhookEvent(rawBody, headers, webhookId) {
  const {
    "paypal-transmission-id": transmissionId,
    "paypal-transmission-time": transmissionTime,
    "paypal-cert-url": certUrl,
    "paypal-auth-algo": authAlgo,
    "paypal-transmission-sig": signature,
  } = headers;

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !signature) {
    console.error("Missing required PayPal headers");
    return false;
  }

  try {
    // Fetch PayPal's public certificate
    const response = await fetch(certUrl);
    const cert = await response.text();

    // Construct the expected signature payload
    const expectedSignaturePayload = `${transmissionId}|${transmissionTime}|${webhookId}|`;
    const expectedSignature = crypto
      .createVerify(authAlgo)
      .update(expectedSignaturePayload + rawBody)
      .verify(cert, signature, "base64");

    return expectedSignature;
  } catch (error) {
    console.error("Webhook verification error:", error);
    return false;
  }
}

