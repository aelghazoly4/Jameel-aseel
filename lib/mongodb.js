const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "MONGODB_URI مش موجود في environment variables. ضيفه في إعدادات Vercel (Settings > Environment Variables)."
  );
}

// في بيئة serverless (زي Vercel) الاتصال بيتعمل cache عشان ما يتفتحش اتصال جديد مع كل request
let cachedClientPromise = global._mongoClientPromise;

if (!cachedClientPromise) {
  const client = new MongoClient(uri);
  cachedClientPromise = client.connect();
  global._mongoClientPromise = cachedClientPromise;
}

module.exports = cachedClientPromise;
