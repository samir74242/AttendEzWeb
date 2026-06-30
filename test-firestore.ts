import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log("Using projectId:", firebaseConfig.projectId);
console.log("Using databaseId:", firebaseConfig.firestoreDatabaseId);

const firebaseAdminApp = admin.initializeApp({
  projectId: firebaseConfig.projectId,
});

const db = getFirestore(firebaseAdminApp, firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    console.log("Attempting write to 'test_connection' collection...");
    const ref = db.collection('test_connection').doc('ping');
    await ref.set({
      timestamp: new Date().toISOString(),
      message: "Hello from test script on named database with projectId moonlit-monolith-j5jvd"
    });
    console.log("Success! Write succeeded!");
    
    console.log("Attempting read...");
    const doc = await ref.get();
    console.log("Read success! Data:", doc.data());

    await ref.delete();
    console.log("Deleted. Test complete!");
  } catch (err) {
    console.error("Test failed with error:", err);
  }
}

test();
