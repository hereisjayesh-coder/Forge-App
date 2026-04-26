importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// 1. Initialize Firebase inside the Service Worker
const firebaseConfig = {
   // WARNING: You must replace these placeholders with your actual Firebase config values
   // from your Vite .env file or Firebase Console (Project Settings -> General -> Web App)
   apiKey: "REPLACE_WITH_YOUR_FIREBASE_API_KEY",
   authDomain: "REPLACE_WITH_YOUR_FIREBASE_AUTH_DOMAIN",
   projectId: "REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID",
   storageBucket: "REPLACE_WITH_YOUR_FIREBASE_STORAGE_BUCKET",
   messagingSenderId: "REPLACE_WITH_YOUR_FIREBASE_MESSAGING_SENDER_ID",
   appId: "REPLACE_WITH_YOUR_FIREBASE_APP_ID"
};

firebase.initializeApp(firebaseConfig);

// 2. Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// 3. Handle Background Messages
// When the app is completely closed, FCM hits this callback
messaging.onBackgroundMessage((payload) => {
   console.log('[firebase-messaging-sw.js] Received background message ', payload);

   // Customize the notification here
   const notificationTitle = payload.notification.title || 'FORGE Update';
   const notificationOptions = {
      body: payload.notification.body,
      icon: '/vite.svg', // Replace with your actual 192x192 logo
      badge: '/vite.svg',
      vibrate: [200, 100, 200, 100, 200], // Haptic vibration pattern for phones
      data: {
         click_action: "/" // When clicked, it opens the app
      }
   };

   self.registration.showNotification(notificationTitle, notificationOptions);
});
