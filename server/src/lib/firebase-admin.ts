import admin, { cert, initializeApp } from "firebase-admin";

let initialized = false;

export function initFirebaseAdmin() {
  if (initialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId) throw new Error("Missing FIREBASE_PROJECT_ID");
  if (!clientEmail) throw new Error("Missing FIREBASE_CLIENT_EMAIL");
  if (!privateKey) throw new Error("Missing FIREBASE_PRIVATE_KEY");

  // Support escaped newlines (common in env vars)
  const normalizedPrivateKey = privateKey.replace(/\\n/g, "\n");

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: normalizedPrivateKey,
    }),
  });

  initialized = true;
}

export function getFirebaseAdmin() {
  initFirebaseAdmin();
  return admin;
}
