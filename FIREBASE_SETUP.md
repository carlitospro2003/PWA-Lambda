# Configuración de Firebase Cloud Messaging (Push Notifications)

## 1. Crear proyecto en Firebase Console

1. Ve a https://console.firebase.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Project Settings** (⚙️ > Configuración del proyecto)

## 2. Obtener credenciales de Firebase

### Configuración Web App:
1. En **Project Settings**, ve a la pestaña **General**
2. Baja hasta **Tus aplicaciones** y haz clic en **</> Web**
3. Registra tu aplicación con un nombre (ej: "Lambda PWA")
4. **Copia las credenciales** que aparecen:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "tu-proyecto.firebaseapp.com",
     projectId: "tu-proyecto-id",
     storageBucket: "tu-proyecto.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

### Obtener VAPID Key:
1. Ve a **Project Settings** > **Cloud Messaging**
2. En **Web Push certificates**, genera un nuevo par de claves
3. **Copia el Key pair** (empieza con "B...")

## 3. Configurar en tu proyecto Angular

### Actualizar environments:

**src/environments/environment.ts:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000/api',
  appName: 'Lambda Fitness',
  version: '1.0.0',
  firebase: {
    apiKey: 'PEGA_TU_API_KEY',
    authDomain: 'tu-proyecto.firebaseapp.com',
    projectId: 'tu-proyecto-id',
    storageBucket: 'tu-proyecto.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abc123',
    vapidKey: 'PEGA_TU_VAPID_KEY'
  }
};
```

**src/environments/environment.production.ts:**
```typescript
// Usa las mismas credenciales (o crea otro proyecto Firebase para producción)
```

### Actualizar Service Worker:

**public/firebase-messaging-sw.js:**
```javascript
firebase.initializeApp({
  apiKey: 'PEGA_TU_API_KEY',
  authDomain: 'tu-proyecto.firebaseapp.com',
  projectId: 'tu-proyecto-id',
  storageBucket: 'tu-proyecto.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123'
});
```

## 4. Usar en tu aplicación

### En cualquier componente (ej: app.ts o login.page.ts):

```typescript
import { FirebaseService } from './services/firebase.service';

export class MiComponente {
  constructor(private firebaseService: FirebaseService) {}

  async ngOnInit() {
    // Solicitar permiso y obtener token FCM
    const token = await this.firebaseService.requestPermission();
    
    if (token) {
      console.log('Token FCM:', token);
      // Enviar token a tu backend Laravel
      // await this.authService.saveFCMToken(token).toPromise();
    }

    // Escuchar mensajes en primer plano
    this.firebaseService.listenToMessages();
  }
}
```

## 5. Backend Laravel (opcional)

### Guardar token FCM del usuario:

1. Agrega columna `fcm_token` a tabla `users`:
   ```php
   Schema::table('users', function (Blueprint $table) {
       $table->string('fcm_token')->nullable();
   });
   ```

2. Endpoint para guardar token:
   ```php
   public function saveFCMToken(Request $request) {
       $user = auth()->user();
       $user->fcm_token = $request->fcm_token;
       $user->save();
       return response()->json(['success' => true]);
   }
   ```

3. Enviar notificación desde Laravel:
   ```php
   use Kreait\Firebase\Factory;
   use Kreait\Firebase\Messaging\CloudMessage;

   public function sendNotification($userId, $title, $body) {
       $user = User::find($userId);
       
       $factory = (new Factory)->withServiceAccount('path/to/serviceAccountKey.json');
       $messaging = $factory->createMessaging();

       $message = CloudMessage::withTarget('token', $user->fcm_token)
           ->withNotification([
               'title' => $title,
               'body' => $body,
           ]);

       $messaging->send($message);
   }
   ```

## 6. Probar notificaciones

### Desde Firebase Console:
1. Ve a **Cloud Messaging** en el menú lateral
2. Haz clic en **Send your first message**
3. Escribe título y texto
4. En **Target**, selecciona tu app web
5. Envía la notificación de prueba

### Desde Postman/REST:
```bash
POST https://fcm.googleapis.com/fcm/send
Headers:
  Authorization: key=TU_SERVER_KEY
  Content-Type: application/json

Body:
{
  "to": "TOKEN_FCM_DEL_USUARIO",
  "notification": {
    "title": "Prueba",
    "body": "Hola desde FCM",
    "icon": "/assets/icon/favicon.png"
  },
  "data": {
    "url": "/home"
  }
}
```

## 7. Archivos creados

✅ `src/app/services/firebase.service.ts` - Servicio principal de Firebase  
✅ `src/environments/environment.ts` - Config de desarrollo (EDITAR)  
✅ `src/environments/environment.production.ts` - Config de producción (EDITAR)  
✅ `public/firebase-messaging-sw.js` - Service Worker para notificaciones en background (EDITAR)  

## Notas importantes

- **HTTPS obligatorio**: FCM solo funciona en localhost o HTTPS
- **Service Worker**: Debe estar en `/firebase-messaging-sw.js` o configurar ruta en Firebase
- **Permisos**: El usuario DEBE aceptar las notificaciones
- **Token FCM**: Se regenera si el usuario borra caché/cookies
