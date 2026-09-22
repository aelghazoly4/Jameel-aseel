const clientPromise = require("../lib/mongodb");

const DB_NAME = process.env.MONGODB_DB || "rsvp_db";
const COLLECTION = "responses";

module.exports = async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION);

    // ---------- إرسال رسالة تهنئة جديدة (من صفحة الدعوة) ----------
    if (req.method === "POST") {
      const body = req.body || {};
      const name = typeof body.name === "string" ? body.name.trim() : "";
      const message = typeof body.message === "string" ? body.message.trim() : "";

      if (!name) {
        return res.status(400).json({ error: "الاسم مطلوب" });
      }
      if (name.length > 100) {
        return res.status(400).json({ error: "الاسم طويل جدًا" });
      }
      if (message.length > 500) {
        return res.status(400).json({ error: "الرسالة طويلة جدًا" });
      }

      await collection.insertOne({
        name,
        message,
        createdAt: new Date(),
      });

      return res.status(200).json({ success: true });
    }

    // ---------- عرض كل الرسائل (لصفحة الـ admin dashboard فقط) ----------
    if (req.method === "GET") {
      const password = req.headers["x-admin-password"];

      if (!process.env.ADMIN_PASSWORD) {
        return res.status(500).json({ error: "ADMIN_PASSWORD مش متظبط في السيرفر" });
      }
      if (!password || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: "كلمة السر غير صحيحة" });
      }

      const items = await collection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json({ items });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("RSVP API error:", err);
    return res.status(500).json({ error: "حدث خطأ في السيرفر، حاول تاني" });
  }
};
