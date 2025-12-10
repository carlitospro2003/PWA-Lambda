# Fix: Notificaciones Sin Sesión Activa

## 🐛 Problema Identificado

El Service Worker de Firebase (`firebase-messaging-sw.js`) seguía ejecutándose en segundo plano incluso después de cerrar sesión, lo que provocaba que el usuario recibiera notificaciones push sin tener una sesión activa.

## ✅ Solución Implementada

Se implementaron **3 capas de protección** para evitar notificaciones cuando no hay sesión activa:

### 1. **Backend: Limpieza del Token FCM**

```php
// En el método logout del backend
$user->update(['USR_FCM' => ' ']); // Limpia el token FCM
```

- Al cerrar sesión, el backend establece el token FCM del usuario como `' '` (espacio vacío)
- Esto previene que el backend envíe notificaciones a dispositivos sin sesión

### 2. **Service Worker: Verificación de Sesión Activa**

**Archivo**: `public/firebase-messaging-sw.js`

**Cambios realizados**:

```javascript
// Nueva función para verificar sesión activa
async function hasActiveSession() {
  // Verifica si hay clientes (pestañas/ventanas) abiertas
  const allClients = await clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });

  // Envía mensaje a cada cliente para verificar si tiene sesión
  for (const client of allClients) {
    const response = await new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => resolve(event.data);
      client.postMessage({ type: 'CHECK_SESSION' }, [messageChannel.port2]);
      setTimeout(() => resolve({ hasSession: false }), 1000);
    });
    
    if (response.hasSession) return true;
  }
  
  return false;
}

// Modificado el handler de mensajes en segundo plano
messaging.onBackgroundMessage(async (payload) => {
  // ✅ VERIFICAR SESIÓN ANTES DE MOSTRAR NOTIFICACIÓN
  const hasSession = await hasActiveSession();
  
  if (!hasSession) {
    console.log('[SW] ❌ No hay sesión activa. Notificación bloqueada.');
    return; // ⛔ NO MOSTRAR LA NOTIFICACIÓN
  }
  
  // ✅ Si hay sesión, mostrar la notificación
  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

### 3. **Frontend: Listener de Verificación de Sesión**

**Archivo**: `src/app/app.ts`

**Nuevo método agregado**:

```typescript
private setupServiceWorkerSessionCheck() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CHECK_SESSION') {
        // ✅ Verificar si hay sesión activa
        const hasSession = this.authService.isAuthenticated();
        
        console.log('[APP] Service Worker preguntó por sesión. Estado:', 
          hasSession ? '✅ ACTIVA' : '❌ NO ACTIVA');
        
        // Responder al Service Worker
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ hasSession: hasSession });
        }
      }
    });
  }
}
```

### 4. **FirebaseService: Desregistrar Service Worker al Cerrar Sesión**

**Archivo**: `src/app/services/firebase.service.ts`

**Nuevo método**:

```typescript
async clearFCMToken(): Promise<void> {
  // Detener el listener
  this.stopListening();
  
  // Desregistrar el Service Worker de Firebase
  await this.unregisterFirebaseServiceWorker();
}

private async unregisterFirebaseServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      if (registration.active?.scriptURL.includes('firebase-messaging-sw')) {
        await registration.unregister();
        console.log('[FIREBASE] ✅ Service Worker desregistrado');
      }
    }
  }
}
```

## 🔄 Flujo Completo al Cerrar Sesión

```
1. Usuario hace clic en "Cerrar Sesión"
   ↓
2. Frontend → Backend: POST /api/logout
   ↓
3. Backend limpia token FCM: USR_FCM = ' '
   ↓
4. Backend invalida el JWT
   ↓
5. Frontend desregistra el Service Worker
   ↓
6. Frontend limpia localStorage (token, usuario)
   ↓
7. Frontend navega a /login
```

## 🔔 Flujo de Notificación con Verificación

```
1. Backend envía notificación push
   ↓
2. Service Worker recibe la notificación
   ↓
3. Service Worker pregunta al cliente: "¿Hay sesión activa?"
   ↓
4. Cliente (app.ts) verifica: authService.isAuthenticated()
   ↓
5a. SI HAY SESIÓN → Mostrar notificación ✅
5b. NO HAY SESIÓN → Bloquear notificación ⛔
```

## 🧪 Cómo Probar

1. **Iniciar sesión en la aplicación**
   - Debes recibir notificaciones normalmente ✅

2. **Cerrar sesión**
   - El Service Worker debe desregistrarse
   - Verifica en DevTools → Application → Service Workers

3. **Intentar enviar una notificación desde el backend**
   - NO debe aparecer ninguna notificación ⛔
   - En la consola verás: `[SW] ❌ No hay sesión activa. Notificación bloqueada.`

4. **Iniciar sesión nuevamente**
   - El Service Worker se registra de nuevo
   - Las notificaciones vuelven a funcionar ✅

## 📝 Archivos Modificados

1. ✅ `public/firebase-messaging-sw.js` - Verificación de sesión antes de mostrar notificaciones
2. ✅ `src/app/app.ts` - Listener para responder a verificaciones del SW
3. ✅ `src/app/services/firebase.service.ts` - Desregistro de Service Worker
4. ✅ `src/app/services/auth.service.ts` - Mejoras en el método clearAuthData()

## 🎯 Resultado

**ANTES**: ❌ Usuario recibía notificaciones sin sesión activa

**DESPUÉS**: ✅ Usuario NO recibe notificaciones cuando:
- Ha cerrado sesión
- No tiene token FCM en el backend
- El Service Worker verifica que no hay sesión activa

## 🚀 Versión

**v1.2.7** - Fix notificaciones sin sesión activa

---

**Fecha**: Diciembre 10, 2025  
**Autor**: Lambda Fitness Team
