import "dotenv/config";
import express from "express";
import crypto from "crypto";
import crc32 from "buffer-crc32";
import fs from "fs/promises";
import fetch from "node-fetch";

// Environment Variables
const { LISTEN_PORT = 8888, LISTEN_PATH = "/", CACHE_DIR = ".", WEBHOOK_ID = "22P08273E2857910V" } = process.env;

// Utility function to download and cache files
async function downloadAndCache(url, cacheKey) {
  try {
    if (!cacheKey) {
      cacheKey = url.replace(/\W+/g, "-");
    }
    const filePath = `${CACHE_DIR}/${cacheKey}`;

    // Check if cached file exists
    const cachedData = await fs.readFile(filePath, "utf-8").catch(() => null);
    if (cachedData) {
      console.log(`Cache hit for ${filePath}`);
      return cachedData;
    }

    // Download the file if not cached
    console.log(`Downloading ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    const data = await response.text();
    await fs.writeFile(filePath, data);

    console.log(`Cached file at ${filePath}`);
    return data;
  } catch (err) {
    console.error(`Error in downloadAndCache: ${err.message}`);
    throw err;
  }
}

// Express app setup
const app = express();
app.use(express.raw({ type: "application/json" }));

app.post(LISTEN_PATH, async (request, response) => {
  try {
    const headers = request.headers;

    // Validate headers
    if (!headers["paypal-transmission-id"] || !headers["paypal-transmission-time"] || !headers["paypal-cert-url"] || !headers["paypal-transmission-sig"]) {
      console.error("Missing required PayPal headers");
      return response.status(400).send("Missing required headers");
    }

    const rawEvent = request.body;
    if (!rawEvent) {
      console.error("Missing request body");
      return response.status(400).send("Missing request body");
    }

    // Parse JSON safely
    let data;
    try {
      data = JSON.parse(rawEvent);
    } catch (err) {
      console.error("Invalid JSON payload:", rawEvent);
      return response.status(400).send("Invalid JSON payload");
    }

    console.log("Headers:", headers);
    console.log("Parsed JSON:", JSON.stringify(data, null, 2));

    // Verify signature
    const isSignatureValid = await verifySignature(rawEvent, headers);
    if (isSignatureValid) {
      console.log("Signature is valid.");
      console.log("Received event:", JSON.stringify(data, null, 2));
    } else {
      console.error(`Signature is not valid for ${data?.id} ${headers?.["correlation-id"]}`);
    }

    // Send 200 response to acknowledge receipt
    response.sendStatus(200);
  } catch (err) {
    console.error("Error processing webhook:", err);
    response.sendStatus(500); // Internal Server Error
  }
});

// Signature verification function
async function verifySignature(event, headers) {
  try {
    const transmissionId = headers["paypal-transmission-id"];
    const timeStamp = headers["paypal-transmission-time"];
    const crc = parseInt("0x" + crc32(event).toString("hex"));

    const message = `${transmissionId}|${timeStamp}|${WEBHOOK_ID}|${crc}`;
    console.log(`Original signed message: ${message}`);

    const certPem = await downloadAndCache(headers["paypal-cert-url"]);
    console.log("Certificate PEM (first 100 chars):", certPem.substring(0, 100));

    const signatureBuffer = Buffer.from(headers["paypal-transmission-sig"], "base64");
    console.log("Signature Buffer:", signatureBuffer.toString("hex"));

    const verifier = crypto.createVerify("SHA256");
    verifier.update(message);

    const isVerified = verifier.verify(certPem, signatureBuffer);
    console.log(`Signature verification result: ${isVerified}`);
    return isVerified;
  } catch (err) {
    console.error("Error verifying signature:", err);
    return false;
  }
}

// Start the server
app.listen(LISTEN_PORT, () => {
  console.log(`Node server listening at http://localhost:${LISTEN_PORT}/`);
});
