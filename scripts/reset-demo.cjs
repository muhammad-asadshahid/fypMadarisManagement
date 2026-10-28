// Wipes every Firestore collection used by the app. Delete only — writes
// nothing back. Usage: node ./scripts/reset-demo.cjs
require("dotenv/config");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, writeBatch } = require("firebase/firestore");

const COLLECTIONS = [
  "users",
  "classes",
  "students",
  "teachers",
  "registrations",
  "attendance",
  "hifzRecords",
  "nazraRecords",
  "darsProgressRecords",
  "kitab",
  "subjects",
  "marksRecords",
  "promotions",
  "hostelRooms",
  "hostelAllocations",
  "mealPlan",
  "visitorRecords",
  "donors",
  "donations",
  "zakatDistributions",
  "salaryPayments",
  "feePayments",
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in .env`);
  return value;
}

async function main() {
  const app = initializeApp({
    apiKey: requireEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
    authDomain: requireEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: requireEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: requireEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
  });
  const db = getFirestore(app);

  console.log(`Project: ${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}`);
  let total = 0;

  for (const name of COLLECTIONS) {
    const snap = await getDocs(collection(db, name));
    if (snap.empty) {
      console.log(`  ${name}: empty`);
      continue;
    }
    let batch = writeBatch(db);
    let pending = 0;
    for (const d of snap.docs) {
      batch.delete(d.ref);
      pending += 1;
      if (pending === 450) {
        await batch.commit();
        batch = writeBatch(db);
        pending = 0;
      }
    }
    await batch.commit();
    total += snap.size;
    console.log(`  ${name}: ${snap.size} deleted`);
  }

  console.log(`Done. ${total} documents deleted.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FAILED:", err && err.message ? err.message : err);
    process.exit(1);
  });
