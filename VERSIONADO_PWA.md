# 🚀 Guía de Versionado PWA - Lambda Fitness

## 📋 ¿Qué es esto?

Sistema de versionado automático para la PWA que muestra un modal al usuario cuando hay una nueva versión disponible.

## 🎯 Características

✅ Detecta automáticamente cuando hay una nueva versión  
✅ Muestra modal con opciones "Actualizar" o "Más Tarde"  
✅ No molesta si el usuario ya rechazó la actualización  
✅ Se actualiza sin necesidad de desinstalar la PWA  
✅ Funciona con Angular Service Worker  

---

## 📂 Archivos del Sistema

### Frontend (Angular)

1. **`src/version.json`** - Versión local de la PWA
```json
{
  "version": "1.0.0"
}
```

2. **`src/app/services/version.service.ts`** - Servicio que maneja el versionado
   - Compara versiones local vs servidor
   - Muestra modal de actualización
   - Actualiza el Service Worker

3. **`src/environments/environment.ts`** - Configuración de endpoints
   - Endpoint `VERSION_CHECK: '/version'`

### Backend (Laravel)

**`routes/api.php`** - Endpoint que devuelve la versión actual
```php
Route::get('/version', function () {
    return response()->json([
        'version' => '1.0.0'
    ]);
});
```

---

## 🔄 ¿Cómo Funciona?

### Flujo Completo

1. **Al iniciar la app o hacer login:**
   - El frontend consulta: `GET /api/version`
   - Compara con la versión local en `version.json`

2. **Si hay diferencia:**
   - Verifica si el usuario ya rechazó esta versión (localStorage)
   - Si no la ha rechazado, muestra el modal

3. **Usuario elige "Actualizar":**
   - Limpia el localStorage
   - Activa el nuevo Service Worker
   - Recarga la página
   - ✅ App actualizada

4. **Usuario elige "Más Tarde":**
   - Guarda en localStorage que rechazó esta versión
   - La app sigue funcionando normal
   - La próxima vez que entre, vuelve a mostrar el modal

---

## 📝 ¿Cómo Actualizar la Versión?

### Opción 1: Solo Frontend (cambios en Angular)

1. Editar `src/version.json`:
```json
{
  "version": "1.0.1"  ← Cambiar aquí
}
```

2. Editar `routes/api.php` en Laravel:
```php
Route::get('/version', function () {
    return response()->json([
        'version' => '1.0.1'  ← Cambiar aquí
    ]);
});
```

3. Hacer deploy de ambos lados

### Opción 2: Solo Backend (cambios en Laravel)

Mismo proceso: cambiar versión en ambos lados

### Opción 3: Cambios en Ambos

Mismo proceso: cambiar versión en ambos lados

---

## 🎨 Convención de Versiones (Semántica)

```
MAJOR.MINOR.PATCH
  1  .  0  .  0
```

- **MAJOR** (1.x.x): Cambios grandes, incompatibles
- **MINOR** (x.1.x): Nuevas funcionalidades compatibles
- **PATCH** (x.x.1): Correcciones de bugs

### Ejemplos:

- `1.0.0` → Versión inicial
- `1.0.1` → Fix de bug pequeño
- `1.1.0` → Nueva funcionalidad (notificaciones)
- `2.0.0` → Cambio grande (rediseño completo)

---

## 🧪 Probar el Sistema

### 1. Simular una actualización:

```typescript
// En el navegador (consola de DevTools)
localStorage.removeItem('updateDismissed');
window.location.reload();
```

### 2. Ver logs:

- Abre DevTools → Console
- Busca logs con `[VERSION]`

### 3. Probar "Más Tarde":

1. Cambiar versión en Laravel: `1.0.1`
2. Recargar app
3. Aparece modal
4. Click "Más Tarde"
5. Cerrar y abrir app
6. Aparece de nuevo (porque no actualizó)

### 4. Probar "Actualizar":

1. Click "Actualizar"
2. App se recarga
3. Ya no aparece el modal

---

## 🔍 Troubleshooting

### El modal no aparece

**Posible causa:** Versiones iguales

**Solución:**
```bash
# Verificar versión local
cat src/version.json

# Verificar versión servidor
curl https://api.safekids.site/api/version

# Deben ser diferentes para que aparezca
```

### El modal aparece siempre

**Posible causa:** localStorage se está borrando

**Solución:**
```javascript
// Verificar en DevTools → Application → Local Storage
localStorage.getItem('updateDismissed')
// Debe tener un valor cuando rechaces
```

### La app no se actualiza

**Posible causa:** Service Worker no está registrado

**Solución:**
```bash
# Verificar en angular.json que esté configurado
# Debe tener "serviceWorker": true en producción
```

---

## 🚀 Checklist de Deploy

Cada vez que subas cambios:

- [ ] Incrementar versión en `src/version.json`
- [ ] Incrementar versión en `routes/api.php`
- [ ] Hacer `git commit` y `git push`
- [ ] Build de producción: `npm run build`
- [ ] Deploy del backend Laravel
- [ ] Deploy del frontend Angular
- [ ] Probar que el modal aparezca
- [ ] Verificar que la actualización funcione

---

## 📱 Comportamiento en Diferentes Escenarios

| Escenario | Comportamiento |
|-----------|----------------|
| Usuario entra por primera vez | No muestra modal (misma versión) |
| Hay nueva versión | Muestra modal automáticamente |
| Usuario dice "Más Tarde" | Guarda en localStorage, vuelve a mostrar en próximo inicio |
| Usuario dice "Actualizar" | Recarga app con nueva versión |
| Usuario no está autenticado | No verifica versión (solo al hacer login) |

---

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
