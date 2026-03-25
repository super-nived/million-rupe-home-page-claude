const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const crypto = require("crypto");
const Razorpay = require("razorpay");

admin.initializeApp();
const db = admin.firestore();

// Secrets stored in Firebase — never exposed to client
const razorpayKeyId = defineSecret("RAZORPAY_KEY_ID");
const razorpayKeySecret = defineSecret("RAZORPAY_KEY_SECRET");

// CORS helper
function cors(req, res) {
  const origin = req.headers.origin || "*";
  res.set("Access-Control-Allow-Origin", origin);
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
}

// ─── CREATE ORDER ───────────────────────────────────────
// Called before opening Razorpay Checkout
// Creates a Razorpay order with the correct amount
exports.createOrder = onRequest(
  { secrets: [razorpayKeyId, razorpayKeySecret], region: "asia-south1" },
  async (req, res) => {
    if (cors(req, res)) return;

    try {
      const { pixels, label, owner, bx, by, bw, bh, color, url } = req.body;

      // Validate
      if (!pixels || pixels < 1 || pixels > 1000000) {
        return res.status(400).json({ error: "Invalid pixel count" });
      }
      if (!label || !owner || bx === undefined || by === undefined || !bw || !bh) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (bx < 0 || by < 0 || bx + bw > 1000 || by + bh > 1000) {
        return res.status(400).json({ error: "Position out of bounds" });
      }

      // Check for overlap with existing ads
      const adsSnap = await db.collection("ads").get();
      for (const doc of adsSnap.docs) {
        const ad = doc.data();
        if (
          bx < ad.bx + ad.bw &&
          bx + bw > ad.bx &&
          by < ad.by + ad.bh &&
          by + bh > ad.by
        ) {
          return res.status(409).json({ error: `Overlaps with "${ad.label}"` });
        }
      }

      // Amount: ₹1 per pixel, Razorpay expects paise (1 INR = 100 paise)
      const amountPaise = pixels * 100;

      const razorpay = new Razorpay({
        key_id: razorpayKeyId.value(),
        key_secret: razorpayKeySecret.value(),
      });

      const order = await razorpay.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: `px_${Date.now()}`,
        notes: {
          label,
          owner,
          bx: String(bx),
          by: String(by),
          bw: String(bw),
          bh: String(bh),
          color: color || "#f59e0b",
          url: url || "#",
          pixels: String(pixels),
        },
      });

      // Store pending order in Firestore
      await db.collection("orders").doc(order.id).set({
        orderId: order.id,
        amount: amountPaise,
        pixels,
        adData: { label, owner, bx, by, bw, bh, color: color || "#f59e0b", url: url || "#" },
        status: "created",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({
        orderId: order.id,
        amount: amountPaise,
        currency: "INR",
        keyId: razorpayKeyId.value(),
      });
    } catch (err) {
      console.error("createOrder error:", err);
      return res.status(500).json({ error: err.message || "Failed to create order" });
    }
  }
);

// ─── VERIFY PAYMENT ─────────────────────────────────────
// Called after Razorpay Checkout success callback
// Verifies signature, creates the ad in Firestore
exports.verifyPayment = onRequest(
  { secrets: [razorpayKeyId, razorpayKeySecret], region: "asia-south1" },
  async (req, res) => {
    if (cors(req, res)) return;

    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: "Missing payment details" });
      }

      // Verify signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", razorpayKeySecret.value())
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        // Update order status
        await db.collection("orders").doc(razorpay_order_id).update({
          status: "signature_failed",
          paymentId: razorpay_payment_id,
        });
        return res.status(400).json({ error: "Payment verification failed" });
      }

      // Get order from Firestore
      const orderDoc = await db.collection("orders").doc(razorpay_order_id).get();
      if (!orderDoc.exists) {
        return res.status(404).json({ error: "Order not found" });
      }

      const order = orderDoc.data();
      if (order.status === "paid") {
        // Already processed — return the existing ad
        return res.json({
          success: true,
          adId: order.adId,
          message: "Payment already processed",
        });
      }

      // Double-check overlap before creating ad
      const adsSnap = await db.collection("ads").get();
      const { bx, by, bw, bh } = order.adData;
      for (const doc of adsSnap.docs) {
        const ad = doc.data();
        if (
          bx < ad.bx + ad.bw &&
          bx + bw > ad.bx &&
          by < ad.by + ad.bh &&
          by + bh > ad.by
        ) {
          // Refund scenario — mark order and notify
          await db.collection("orders").doc(razorpay_order_id).update({
            status: "overlap_conflict",
            paymentId: razorpay_payment_id,
            conflict: `Overlaps with ${ad.label}`,
          });
          return res.status(409).json({
            error: "Area was taken while you were paying. Contact support for refund.",
            refundNeeded: true,
          });
        }
      }

      // Create the ad
      const adRef = await db.collection("ads").add({
        ...order.adData,
        imageUrl: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });

      // Update order status
      await db.collection("orders").doc(razorpay_order_id).update({
        status: "paid",
        paymentId: razorpay_payment_id,
        adId: adRef.id,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({
        success: true,
        adId: adRef.id,
        ad: {
          id: adRef.id,
          ...order.adData,
          imageUrl: null,
        },
      });
    } catch (err) {
      console.error("verifyPayment error:", err);
      return res.status(500).json({ error: err.message || "Verification failed" });
    }
  }
);
