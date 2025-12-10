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

// Función para verificar si hay sesión activa
async function hasActiveSession() {
  try {
    // Intentar acceder a todos los clientes (pestañas/ventanas) de la PWA
    const allClients = await clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    // Si hay clientes abiertos, verificar localStorage en cada uno
    for (const client of allClients) {
      try {
        // Enviar mensaje al cliente para verificar sesión
        const response = await new Promise((resolve) => {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data);
          };
          client.postMessage({ type: 'CHECK_SESSION' }, [messageChannel.port2]);
          
          // Timeout de 1 segundo
          setTimeout(() => resolve({ hasSession: false }), 1000);
        });
        
        if (response.hasSession) {
          return true;
        }
      } catch (error) {
        console.log('[SW] Error al verificar sesión en cliente:', error);
      }
    }
    
    return false;
  } catch (error) {
    console.error('[SW] Error al verificar sesión activa:', error);
    return false;
  }
}

// Manejar notificaciones en segundo plano
messaging.onBackgroundMessage(async (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // ✅ VERIFICAR SI HAY SESIÓN ACTIVA ANTES DE MOSTRAR LA NOTIFICACIÓN
  const hasSession = await hasActiveSession();
  
  if (!hasSession) {
    console.log('[SW] ❌ No hay sesión activa. Notificación bloqueada.');
    return; // No mostrar la notificación
  }
  
  console.log('[SW] ✅ Sesión activa detectada. Mostrando notificación.');
  
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
