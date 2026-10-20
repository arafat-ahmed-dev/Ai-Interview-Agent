import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const initFirebaseAdmin = () => {
  const apps = getApps();
  if (!apps.length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID?.replace(/^["']|["']$/g, "").trim(),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.replace(/^["']|["']$/g, "").trim(),
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ?.replace(/^["']|["']$/g, "")
          .trim()
          .replace(/\\n/g, "\n"),
      }),
    });
  }
  return {
    auth: getAuth(),
    db: getFirestore(),
  };
};

export const { auth, db } = initFirebaseAdmin();
