# 📱 Sistema de Versionado PWA - Lambda Fitness

## 🎯 Cómo Funciona (NUEVO)

El sistema de versionado ahora funciona **completamente en el frontend** usando el **Service Worker de Angular**. **No depende del backend**.

### ✨ Lo Que Cambió

- ❌ **ANTES**: Comparaba versión local vs versión del servidor (dependía del backend)
- ✅ **AHORA**: El Service Worker detecta automáticamente cuando cambian los archivos de la app

### 🔄 Flujo Automático

1. **Service Worker registrado**: Al cargar la app, Angular registra automáticamente el Service Worker (`ngsw-worker.js`)

2. **Detección automática**: El Service Worker compara:
   - Los archivos actuales en caché (JS, CSS, HTML, version.json)
   - Los archivos nuevos del servidor
   - Si detecta cambios en cualquier archivo, marca que hay una nueva versión disponible

3. **Alerta al usuario**: Cuando se detecta una nueva versión, automáticamente se muestra una alerta:
   ```
   🚀 Nueva Versión Disponible
   Hay una nueva versión de Lambda Fitness disponible.
   Para obtener las últimas funciones y mejoras, actualiza ahora.
   
   [Más Tarde] [Actualizar Ahora]
   ```

4. **Actualización**: Si el usuario acepta:
   - Se activa la nueva versión del Service Worker
   - La app se recarga automáticamente
   - El usuario ve la versión actualizada

---

## 📋 Archivos Importantes

### Flujo Completo

### 1. `version.service.ts` 
**Ubicación**: `src/app/services/version.service.ts`

Servicio que gestiona la detección y notificación de actualizaciones:

```typescript
constructor() {
  this.initializeVersionDetection(); // Se auto-inicializa
}

private initializeVersionDetection() {
  // Escucha eventos del Service Worker
  this.swUpdate.versionUpdates
    .pipe(filter(evt => evt.type === 'VERSION_READY'))
    .subscribe(event => {
      this.showUpdateAlert(); // Muestra alerta automáticamente
    });
}
```

**Características**:
- ✅ Auto-inicialización en el constructor
- ✅ Detección automática de nuevas versiones
- ✅ Alerta visual al usuario
- ✅ Activación y recarga automática

### 2. `ngsw-config.json`
**Ubicación**: `ngsw-config.json`

Configuración del Service Worker que define qué archivos cachear:

```json
{
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/version.json",  // ← Archivo de versión incluido
          "/*.css",
          "/*.js"
        ]
      }
    }
  ]
}
```

### 3. `version.json`
**Ubicación**: `src/version.json`

Archivo con la versión actual:

```json
{
  "version": "1.2.3"
}
```

**Importante**: Al cambiar esta versión, el Service Worker detectará automáticamente que hay una nueva versión.

### 4. `app.config.ts`
**Ubicación**: `src/app/app.config.ts`

Configuración del Service Worker:

```typescript
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),  // Solo en producción
  registrationStrategy: 'registerImmediately'  // Registro inmediato
})
```

---

## 🚀 Cómo Desplegar una Nueva Versión

### Paso 1: Actualizar la Versión

Edita **3 archivos** con el mismo número de versión:

1. **`src/version.json`**:
```json
{
  "version": "1.2.4"  // ← Nueva versión
}
```

2. **`src/environments/environment.ts`**:
```typescript
export const environment = {
  version: '1.2.4',  // ← Nueva versión
  // ...
};
```

3. **`src/environments/environment.production.ts`**:
```typescript
export const environment = {
  version: '1.2.4',  // ← Nueva versión
  // ...
};
```

### Paso 2: Compilar y Desplegar

```bash
# 1. Compilar en modo producción
npm run build

# 2. El Service Worker generará automáticamente:
#    - dist/lambda/ngsw.json (manifiesto con hash de archivos)
#    - dist/lambda/ngsw-worker.js (worker actualizado)

# 3. Subir archivos al servidor
scp -r dist/lambda/* usuario@servidor:/var/www/html/
```

### Paso 3: Verificación Automática

Los usuarios que ya tienen la app instalada verán **automáticamente** la alerta de actualización cuando:

- Abran la app
- Naveguen entre páginas
- Después de 1 minuto de estar activos

---

## 🧪 Pruebas en Desarrollo

### Probar el Sistema de Versionado

**Método 1: Simulación con Chrome DevTools**

1. Abre la app en Chrome
2. Presiona `F12` → **Application** → **Service Workers**
3. Activa "Update on reload"
4. Haz cambios en el código
5. Recarga la página
6. Verás la alerta de actualización

**Método 2: Build de Producción Local**

```bash
# Compilar en modo producción
npm run build

# Servir con http-server
npx http-server dist/lambda -p 8080

# Abrir en navegador
http://localhost:8080
```

---

## 🔍 Logs y Debug

El Service Worker genera logs en consola:

```
[VERSION] Sistema de detección de actualizaciones iniciado
[VERSION] Verificando actualizaciones...
[VERSION] Nueva versión detectada
[VERSION] Versión actual: {hash: "..."}
[VERSION] Nueva versión: {hash: "..."}
[VERSION] Usuario acepta actualización
[VERSION] Activando actualización...
[VERSION] Actualización activada, recargando app...
```

Para ver los logs del Service Worker:

1. Chrome DevTools → **Application** → **Service Workers**
2. Click en "Console"

---

## 🎨 Convención de Versiones (Semántica)

```
MAJOR.MINOR.PATCH
  1  .  2  .  3
```

- **MAJOR** (1.x.x): Cambios grandes, incompatibles
- **MINOR** (x.1.x): Nuevas funcionalidades compatibles
- **PATCH** (x.x.1): Correcciones de bugs

### Ejemplos:

- `1.0.0` → Versión inicial
- `1.0.1` → Fix de bug pequeño
- `1.1.0` → Nueva funcionalidad (notificaciones)
- `1.2.0` → Nueva funcionalidad (2FA)
- `2.0.0` → Cambio grande (rediseño completo)

---

## ⚙️ Configuración Avanzada

### Cambiar Estrategia de Registro

En `app.config.ts`:

```typescript
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),
  
  // Opciones:
  // 'registerImmediately' - Registra inmediatamente (recomendado)
  // 'registerWhenStable:30000' - Registra después de 30s
  // 'registerWithDelay:5000' - Registra con delay de 5s
  registrationStrategy: 'registerImmediately'
})
```

### Agregar Más Archivos al Caché

En `ngsw-config.json`:

```json
{
  "assetGroups": [
    {
      "name": "app",
      "resources": {
        "files": [
          "/version.json",
          "/manifest.webmanifest",  // ← Agregar más archivos
          "/assets/**/*.png",
          "/*.css",
          "/*.js"
        ]
      }
    }
  ]
}
```

---

## 🔍 Troubleshooting

### El modal no aparece

**Posible causa 1:** Estás en modo desarrollo
**Solución**: El Service Worker solo funciona en producción. Compila con `npm run build`.

**Posible causa 2:** No hay cambios reales
**Solución**: Cambia la versión en `version.json` o cualquier archivo JS/CSS.

**Posible causa 3:** Service Worker no registrado
**Solución**: Abre DevTools → Application → Service Workers y verifica que esté activo.

### La actualización no se aplica

**Solución**: 
1. Limpia el caché del navegador
2. Desregistra el Service Worker manualmente:
```javascript
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => reg.unregister()));
```
3. Recarga la página

### Quiero forzar actualización sin esperar

**Solución**: En consola del navegador:
```javascript
navigator.serviceWorker.getRegistration()
  .then(reg => reg.update());
```

---

## ❓ Preguntas Frecuentes

**Q: ¿Por qué no veo la alerta de actualización?**

A: Verifica que:
- Estés en modo producción (`npm run build`)
- El Service Worker esté registrado (Chrome DevTools → Application → Service Workers)
- Hayas cambiado la versión en `version.json`
- No estés en modo incógnito

**Q: ¿Cómo forzar una actualización manualmente?**

A: En consola del navegador:
```javascript
await navigator.serviceWorker.getRegistration().then(reg => reg.update());
```

**Q: ¿Cada cuánto verifica actualizaciones?**

A: El Service Worker verifica automáticamente cada:
- Al abrir la app
- Al navegar entre páginas
- Cada 1 minuto en background (configurado por Angular)

**Q: ¿Funciona en modo desarrollo?**

A: No, el Service Worker está deshabilitado en modo desarrollo (`isDevMode()` retorna `true`). Solo funciona después de `npm run build`.

**Q: ¿Necesito cambiar algo en el backend?**

A: No, el sistema ahora es 100% frontend. No necesitas configurar nada en Laravel.

**Q: ¿Qué pasa si el usuario cierra la alerta sin elegir nada?**

A: Volverá a aparecer la próxima vez que abra la app o navegue.

---

## ✅ Ventajas del Nuevo Sistema

1. ✅ **Sin Backend**: No depende del servidor Laravel
2. ✅ **Automático**: Detecta cambios en cualquier archivo
3. ✅ **Estándar PWA**: Usa el sistema oficial de Angular
4. ✅ **Hash-based**: Compara hash de archivos, no versiones manuales
5. ✅ **Confiable**: Funciona incluso si cambian archivos CSS/JS sin actualizar version.json
6. ✅ **User-friendly**: Alerta clara y simple para el usuario
7. ✅ **Sin configuración backend**: No necesitas mantener endpoint `/version`

---

## 📚 Referencias

- [Angular Service Worker](https://angular.io/guide/service-worker-intro)
- [SwUpdate API](https://angular.io/api/service-worker/SwUpdate)
- [NGSW Config](https://angular.io/guide/service-worker-config)
- [PWA Update Strategies](https://web.dev/service-worker-lifecycle/)

---

## 📝 Notas Importantes

1. **Solo Producción**: El Service Worker NO funciona en desarrollo (`ng serve`)
2. **Build Requerido**: Siempre compilar con `npm run build` para probar
3. **HTTPS Requerido**: En producción, la PWA requiere HTTPS (excepto localhost)
4. **Cache Persistente**: El Service Worker cachea agresivamente, limpia el caché si ves problemas
5. **Versión Sincronizada**: Mantén la versión sincronizada en version.json y environments

---

**Versión del sistema**: 2.0 (Frontend-only)  
**Última actualización**: Diciembre 2025  
**Autor**: Lambda Fitness Team


## 💡 Tips

1. **Siempre cambia ambas versiones** (frontend + backend)
2. **Usa versiones semánticas** (1.0.0, 1.0.1, etc.)
3. **Prueba en desarrollo** antes de subir a producción
4. **Comunica cambios** a los usuarios en el modal si quieres

---

## 🔧 Personalización

### Cambiar el mensaje del modal

En `src/app/services/version.service.ts`:

```typescript
message: `Hay una nueva versión (${newVersion}) de Lambda Fitness. ¿Deseas actualizar ahora?`
```

### Cambiar cuándo se verifica

Actualmente se verifica:
- Al iniciar la app (si está autenticado)
- Al hacer login

Puedes agregar más lugares llamando:
```typescript
this.versionService.checkForUpdates();
```

---

## 📊 Estadísticas

Puedes trackear cuántos usuarios actualizan vs cuántos posponen:

```typescript
// En version.service.ts, agregar analytics
handler: () => {
  // Analytics: usuario actualizó
  console.log('Usuario actualizó a versión:', newVersion);
}
```

---

## ✅ Sistema Completo

Ahora tienes:
- ✅ Versionado automático
- ✅ Modal de actualización
- ✅ Opción "Más Tarde"
- ✅ Actualización sin desinstalar
- ✅ Compatible con PWA
- ✅ Fácil de mantener

**¡Ya no necesitas desinstalar y reinstalar la PWA nunca más!** 🎉
