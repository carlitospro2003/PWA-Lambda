// This file is needed for Firebase Cloud Messaging
// It runs as a service worker in the background

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Inicializar Firebase en el Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyDPQ3HcafZsG9MJgwTYDM-oV-uCOBCIlnM",
  authDomain: "lambda-6054d.firebaseapp.com",
  projectId: "lambda-6054d",
  storageBucket: "lambda-6054d.firebasestorage.app",
  messagingSenderId: "204320046510",
  appId: "1:204320046510:web:6dce5bbc96f091d8991c3f"
});

const messaging = firebase.messaging();

// Manejar notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Nueva notificación';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/assets/icon/favicon.png',
    badge: '/assets/icon/favicon.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clicks en las notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();

  // Abrir la aplicación o navegar a una URL específica
  event.waitUntil(
    clients.openWindow('/')
  );
});
