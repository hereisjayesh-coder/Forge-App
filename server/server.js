const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const cron = require('node-cron');
const fs = require('fs');

// 1. Initialize Firebase Admin
// WARNING: In production, do NOT hardcode credentials.
// You must set this via process.env.FIREBASE_SERVICE_ACCOUNT or similar.
// For local testing, placing serviceAccountKey.json in the /server dir works.
let serviceAccount;
try {
   serviceAccount = require('./serviceAccountKey.json');
   admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
   });
   console.log('Firebase Admin Initialized Successfully.');
} catch (err) {
   console.warn('⚠️ WARNING: serviceAccountKey.json not found! Firebase Admin is NOT initialized.');
   console.warn('Push Notifications will not work until you add your service account key.');
}

const app = express();
app.use(cors());
app.use(express.json());

const db = admin.firestore && admin.firestore();

// ===== HEALTH CHECK ROUTE =====
app.get('/health', (req, res) => {
   res.json({ status: 'active', message: 'FORGE Notification Server is running.' });
});

// ===== MANUAL TRIGGER ROUTE (For Testing) =====
app.post('/api/trigger-test-push', async (req, res) => {
   try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ error: 'FCM Token is required.' });

      const message = {
         notification: {
            title: 'FORGE System Test',
            body: 'Your push notifications are wired up perfectly!'
         },
         token: token,
      };

      const response = await admin.messaging().send(message);
      res.json({ success: true, messageId: response });
   } catch (error) {
      console.error('Error sending test push:', error);
      res.status(500).json({ error: error.message });
   }
});

// ===== THE 8:00 PM CRON JOB =====
// This CRON expression means: "At minute 0 past hour 20 (8:00 PM) every day."
cron.schedule('0 20 * * *', async () => {
   console.log('⏰ Running 8:00 PM Notification Cron Job...');
   if (!db) {
      console.error('Database uninitialized. Cannot run cron.');
      return;
   }

   try {
      // 1. Get all users who have dailyReminders enabled and an FCM token
      const usersSnap = await db.collection('users').get();

      const tokensToNotify = [];

      for (const doc of usersSnap.docs) {
         const userData = doc.data();

         // If they have reminders ON, and we have their device token
         if (userData.settings?.dailyReminders && userData.fcmToken) {

            // Check if they already logged a habit today
            // Note: because of Data Sharding (Phase 6), user.lastHabitLog is on the main doc
            const lastLogTime = userData.lastHabitLog?.timestamp || 0;
            const hoursSinceLastLog = (Date.now() - lastLogTime) / (1000 * 60 * 60);

            // If it's been more than 12 hours since their last log, remind them
            if (hoursSinceLastLog > 12) {
               tokensToNotify.push(userData.fcmToken);
            }
         }
      }

      if (tokensToNotify.length === 0) {
         console.log('No users need reminding today. Everyone is forged!');
         return;
      }

      // 2. Dispatch the Multicast Message to all collected tokens
      const message = {
         notification: {
            title: 'FORGE: The fire is fading! 🔥',
            body: "You haven't logged your habits for tonight. Keep your streak alive!"
         },
         tokens: tokensToNotify,
      };

      const batchResponse = await admin.messaging().sendMulticast(message);
      console.log(`${batchResponse.successCount} messages were sent successfully.`);
      if (batchResponse.failureCount > 0) {
         console.warn(`${batchResponse.failureCount} messages failed to send.`);
      }

   } catch (error) {
      console.error('Error in daily cron job:', error);
   }
}, {
   scheduled: true,
   timezone: "America/New_York" // You can change this to match your target timezone
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   console.log(`🚀 FORGE Notification Server listening on port ${PORT}`);
});
