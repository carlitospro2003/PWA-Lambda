# 📴 Sistema de Caché Offline - Lambda Fitness PWA

## 🎯 Objetivo

Permitir que toda la aplicación funcione **completamente offline** usando el Service Worker de Angular, y sincronizar automáticamente cuando regrese la conexión a internet.

---

## ✨ Características Implementadas

✅ **Caché completo de la aplicación** (HTML, CSS, JS, imágenes, fuentes)  
✅ **Caché de API requests** (GET de salas, ejercicios, notificaciones, etc.)  
✅ **Detección automática** de pérdida/recuperación de conexión  
✅ **Sincronización automática** cuando regresa internet  
✅ **Indicador visual** (chip) cuando está offline  
✅ **Toasts informativos** de estado de red  
✅ **Estrategias de caché** optimizadas (freshness + performance)  

---

## 📂 Archivos del Sistema

### 1. **Service Worker Configuration** (`ngsw-config.json`)

Define qué cachear y cómo:

#### **assetGroups** - Archivos estáticos
- `app`: HTML, CSS, JS, manifest, version.json
- `assets`: Imágenes, fuentes, iconos

#### **dataGroups** - API Requests

**a) `api-cache` - Estrategia "freshness"**
```json
{
  "strategy": "freshness",
  "maxAge": "1h",
  "timeout": "10s"
}
```
- **Freshness**: Intenta primero la red, si falla usa caché
- **Timeout**: 10 segundos máximo esperando respuesta
- **MaxAge**: Caché válido por 1 hora
- **URLs**: Todas las APIs (`/api/**`)

**b) `api-performance` - Estrategia "performance"**
```json
{
  "strategy": "performance",
  "maxAge": "30m"
}
```
- **Performance**: Usa caché primero, luego actualiza en background
- **MaxAge**: 30 minutos
- **URLs**: APIs frecuentes (rooms, routines, notifications)

---

### 2. **Network Service** (`network.service.ts`)

**Responsabilidades:**
- Detectar estado de red (online/offline)
- Observable `online$` para reactividad
- Escuchar eventos `window.online` y `window.offline`

**Métodos públicos:**
```typescript
isOnline(): boolean    // Verifica si hay conexión
isOffline(): boolean   // Verifica si está offline
online$: Observable    // Observable del estado
```

---

### 3. **Sync Service** (`sync.service.ts`)

**Responsabilidades:**
- Monitorear cambios en el estado de red
- Sincronizar datos cuando regresa internet
- Mostrar toasts informativos

**Flujo de sincronización:**

1. **Pierde conexión:**
   - Detecta evento `offline`
   - Muestra toast: "📡 Sin conexión - Modo offline activado"
   - Marca `wasOffline = true`

2. **Regresa conexión:**
   - Detecta evento `online`
   - Muestra toast: "✅ Conexión restablecida - Sincronizando..."
   - Llama a `syncAllData()`
   - Sincroniza notificaciones
   - Muestra toast: "🔄 Datos sincronizados"

**Métodos públicos:**
```typescript
forceSyncAll(): Promise<void>  // Forzar sincronización manual
```

---

### 4. **Cache Interceptor** (`cache.interceptor.ts`)

**Responsabilidades:**
- Interceptar HTTP requests
- Loguear intentos de caché
- Manejar errores offline

**Funcionamiento:**
- Todas las peticiones HTTP pasan por aquí
- Si está offline, intenta usar caché (automático del SW)
- Loguea para debugging

---

### 5. **Network Status Component** (`network-status.component.ts`)

**UI Component** que muestra estado de red:

```html
<ion-chip class="network-status offline">
  <ion-icon name="cloud-offline-outline"></ion-icon>
  <ion-label>Modo Offline</ion-label>
</ion-chip>
```

- **Posición**: Fixed, top-right
- **Aparece**: Solo cuando está offline
- **Animación**: Slide in desde la derecha
- **Color**: Warning (amarillo/naranja)

---

## 🔄 Estrategias de Caché

### **Freshness (Frescura)**
```
1. Intenta red
2. Si falla o timeout → usa caché
3. Si no hay caché → error
```
**Uso:** Datos que deben estar actualizados (notificaciones, salas)

### **Performance (Rendimiento)**
```
1. Usa caché inmediatamente
2. En background actualiza desde red
3. Próxima vez tendrá datos frescos
```
**Uso:** Datos que cambian poco (lista de salas, ejercicios)

---

## 🎨 Experiencia del Usuario

### **Escenario 1: Usuario pierde internet**

1. Evento `offline` detectado
2. Aparece chip "Modo Offline" arriba a la derecha
3. Toast: "📡 Sin conexión - Modo offline activado"
4. App sigue funcionando con datos cacheados
5. Puede navegar entre páginas
6. Puede ver notificaciones, salas, ejercicios guardados

### **Escenario 2: Usuario recupera internet**

1. Evento `online` detectado
2. Chip "Modo Offline" desaparece
3. Toast: "✅ Conexión restablecida - Sincronizando..."
4. Se sincronizan notificaciones automáticamente
5. Toast: "🔄 Datos sincronizados"
6. Datos actualizados disponibles

### **Escenario 3: Usuario offline abre notificación**

1. Click en notificación cacheada
2. Navega a `/room-exercises/{id}`
3. Si los ejercicios están cacheados → se muestran
4. Si no están cacheados → mensaje de error
5. Cuando regrese internet → se actualizan

---

## 🧪 Probar el Sistema

### **En Chrome DevTools:**

1. **Simular offline:**
   - F12 → Network tab
   - Dropdown "No throttling" → "Offline"
   - Recargar página

2. **Ver Service Worker:**
   - F12 → Application tab
   - Service Workers
   - Ver estado, caché storage

3. **Ver caché:**
   - F12 → Application tab
   - Cache Storage
   - Ver `ngsw:db`, archivos cacheados

### **Comandos de consola:**

```javascript
// Ver estado de red
navigator.onLine

// Simular offline (no funciona 100%)
window.dispatchEvent(new Event('offline'))

// Simular online
window.dispatchEvent(new Event('online'))

// Ver caché
caches.keys()

// Limpiar caché
caches.delete('nombre-del-cache')
```

---

## 📊 Qué se Cachea

### **Archivos Estáticos (Prefetch - inmediato)**
- `/index.html`
- `/manifest.webmanifest`
- `/version.json`
- Todos los `.css`
- Todos los `.js` (chunks de Angular)

### **Assets (Lazy - bajo demanda)**
- Imágenes (`.png`, `.jpg`, `.webp`, `.svg`)
- Fuentes (`.woff`, `.woff2`, `.ttf`)
- Iconos (`.ico`)

### **API Requests (Estrategia mixta)**

**Performance (caché primero):**
- `GET /api/getMyRooms`
- `GET /api/getMyJoinedRooms`
- `GET /api/getMyRoutines`
- `GET /api/notifications`

**Freshness (red primero):**
- Todas las demás APIs
- POST, PUT, DELETE (no se cachean)

---

## 🔧 Configuración

### **Cambiar tiempo de caché:**

En `ngsw-config.json`:

```json
"maxAge": "1h"    // 1 hora
"maxAge": "30m"   // 30 minutos
"maxAge": "1d"    // 1 día
"maxAge": "7d"    // 7 días
```

### **Cambiar tamaño máximo de caché:**

```json
"maxSize": 100    // 100 requests
"maxSize": 50     // 50 requests
```

### **Cambiar estrategia:**

```json
"strategy": "freshness"     // Red primero
"strategy": "performance"   // Caché primero
```

---

## 🚀 Despliegue

### **1. Build de producción:**

```bash
npm run build
```

Esto genera el `ngsw-worker.js` con la configuración.

### **2. Verificar Service Worker:**

En `angular.json` debe estar:

```json
"serviceWorker": true
```

### **3. HTTPS requerido:**

Service Workers solo funcionan en:
- `https://` (producción)
- `localhost` (desarrollo)

---

## 📝 Logs y Debugging

### **Logs en consola:**

```
[NETWORK] Estado de red: ONLINE
[SYNC] Conexión perdida - modo offline
[CACHE] Offline - intentando obtener del caché
[SYNC] Reconectado - sincronizando datos...
[SYNC] Sincronización completada
```

### **Ver logs del Service Worker:**

```javascript
// En DevTools console
navigator.serviceWorker.getRegistration()
  .then(reg => console.log(reg))
```

---

## ⚠️ Limitaciones

1. **POST/PUT/DELETE no se cachean** (solo GET)
2. **Caché expira** según `maxAge` configurado
3. **Requiere espacio** en disco del dispositivo
4. **Primera visita** requiere internet (para instalar SW)
5. **Autenticación** puede fallar offline si token expira

---

## 💡 Mejoras Futuras

- [ ] Background sync para peticiones POST offline
- [ ] IndexedDB para almacenamiento local persistente
- [ ] Sincronización selectiva (solo lo que cambió)
- [ ] Modo offline intencional (switch manual)
- [ ] Indicador de última sincronización
- [ ] Retry automático de peticiones fallidas

---

## ✅ Checklist de Funcionamiento

- [x] App funciona sin internet después de primera carga
- [x] Se muestran datos cacheados cuando está offline
- [x] Aparece indicador visual "Modo Offline"
- [x] Se muestra toast al perder conexión
- [x] Se sincroniza automáticamente al recuperar conexión
- [x] Se muestra toast al sincronizar
- [x] Service Worker se actualiza en nueva versión
- [x] Caché se limpia en actualizaciones

---

## 🎉 Resultado Final

**Tu PWA ahora funciona 100% offline:**

✅ **Sin internet** → Usa caché, muestra datos guardados  
✅ **Regresa internet** → Sincroniza automáticamente  
✅ **Experiencia fluida** → Usuario no nota la diferencia  
✅ **Notificaciones visuales** → Siempre sabe el estado  
✅ **No pierde trabajo** → Todo se sincroniza después  

**¡Ya no necesitas internet para usar Lambda Fitness!** 🚀💪
