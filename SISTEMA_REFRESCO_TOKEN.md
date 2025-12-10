# Sistema de Refresco Automático de Tokens JWT

## 🔐 Problema

El token JWT del backend tiene una **validez de 24 horas**. Después de ese tiempo, el usuario necesitaría volver a iniciar sesión manualmente, lo cual es una mala experiencia de usuario.

## ✅ Solución Implementada

Se implementó un **sistema automático de refresco de tokens** que:

1. ✅ **Verifica periódicamente** el estado del token
2. ✅ **Refresca automáticamente** antes de que expire
3. ✅ **Mantiene la sesión activa** sin intervención del usuario
4. ✅ **Cierra sesión automáticamente** si el token ya expiró

## 🔧 Configuración del Sistema

### Constantes Definidas

```typescript
// Tiempo de vida del token (backend)
private readonly TOKEN_LIFETIME = 24 * 60 * 60 * 1000; // 24 horas

// Refrescar 2 horas antes de que expire
private readonly REFRESH_BEFORE_EXPIRY = 2 * 60 * 60 * 1000; // 2 horas

// Verificar cada 30 minutos
private readonly REFRESH_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutos
```

### Endpoints Utilizados

```typescript
// Backend
POST http://127.0.0.1:8000/api/refreshToken

// Headers requeridos
Authorization: Bearer {token_actual}

// Respuesta exitosa
{
  "success": true,
  "message": "Token renovado con éxito",
  "token": "nuevo_token_jwt..."
}
```

## 🔄 Flujo del Sistema

### 1. Inicialización al Login

```
Usuario inicia sesión
  ↓
Backend retorna token JWT (válido 24h)
  ↓
AuthService guarda token en localStorage
  ↓
Se registra timestamp: tokenRefreshedAt
  ↓
Se inicia programador automático
  ↓
Verificación cada 30 minutos
```

### 2. Verificación Periódica

```typescript
startTokenRefreshScheduler() {
  // Verificar inmediatamente
  this.checkAndRefreshToken();
  
  // Configurar intervalo cada 30 minutos
  setInterval(() => {
    this.checkAndRefreshToken();
  }, 30 * 60 * 1000);
}
```

### 3. Lógica de Decisión

```typescript
checkAndRefreshToken() {
  // 1. Verificar si usuario está autenticado
  if (!this.isAuthenticated()) return;
  
  // 2. Obtener timestamp del último refresco
  const lastRefreshTime = localStorage.getItem('tokenRefreshedAt');
  
  // 3. Calcular tiempo transcurrido
  const timeSinceLastRefresh = Date.now() - lastRefreshTime;
  
  // 4. Calcular tiempo hasta expiración
  const timeUntilExpiry = 24h - timeSinceLastRefresh;
  
  // 5. Si quedan menos de 2 horas, refrescar
  if (timeUntilExpiry <= 2h) {
    this.refreshToken();
  }
}
```

### 4. Refresco del Token

```typescript
refreshToken() {
  // Llamar al backend
  POST /api/refreshToken
  
  // Si exitoso:
  - Actualizar token en localStorage
  - Actualizar tokenRefreshedAt = ahora
  - Mantener usuario actual
  
  // Si falla (401 o 500):
  - Token ya expiró o es inválido
  - Cerrar sesión automáticamente
}
```

## 📊 Ejemplo de Timeline

```
Hora 00:00 - Login exitoso
           ↓ Token válido por 24h
           ↓ tokenRefreshedAt = 00:00

Hora 00:30 - Verificación automática
           ✅ Token válido (23.5h restantes)
           ⏭️  No necesita refresco

Hora 01:00 - Verificación automática
           ✅ Token válido (23h restantes)
           ⏭️  No necesita refresco

...cada 30 minutos...

Hora 22:00 - Verificación automática
           ⚠️  Token válido (2h restantes)
           ⏭️  No necesita refresco aún

Hora 22:30 - Verificación automática
           ⚠️  Token válido (1.5h restantes)
           🔄 ¡REFRESCAR AHORA!
           ↓
           POST /api/refreshToken
           ↓
           ✅ Nuevo token recibido
           ↓
           tokenRefreshedAt = 22:30
           ↓
           Token válido por otras 24h

Hora 23:00 - Verificación automática
           ✅ Token recién refrescado (23.5h restantes)
           ⏭️  No necesita refresco

...y así sucesivamente...
```

## 🎯 Ventajas del Sistema

### Para el Usuario
- ✅ **Sesión continua** sin interrupciones
- ✅ **No necesita volver a iniciar sesión** cada 24 horas
- ✅ **Experiencia fluida** mientras usa la app
- ✅ **Seguridad mantenida** con tokens actualizados

### Para el Sistema
- ✅ **Tokens siempre frescos** (menos de 22 horas de antigüedad)
- ✅ **Seguridad mejorada** con rotación de tokens
- ✅ **Menor riesgo** de tokens comprometidos antiguos
- ✅ **Cierre de sesión automático** si algo falla

## 📝 Logs del Sistema

### Inicialización

```
[AUTH] 🔁 Iniciando programador de refresco automático de token
[AUTH] ⏰ Verificación cada 30 minutos
[AUTH] 🕐 Token válido por 24 horas, se refrescará 2 horas antes de expirar
```

### Verificación Normal

```
[AUTH] ⏱️ Tiempo desde último refresco: 180 minutos
[AUTH] ⏳ Tiempo hasta expiración: ~21.00 horas
[AUTH] ✅ Token válido, no necesita refresco aún
```

### Refresco Necesario

```
[AUTH] ⏱️ Tiempo desde último refresco: 1320 minutos
[AUTH] ⏳ Tiempo hasta expiración: ~2.00 horas
[AUTH] ⚠️ Token cerca de expirar, iniciando refresco...
[AUTH] 🔄 Refrescando token de autenticación...
[AUTH] ✅ Token refrescado exitosamente
[AUTH] 💾 Token actualizado en localStorage
[AUTH] ✅ Token refrescado automáticamente
```

### Error de Refresco (Token Expirado)

```
[AUTH] ❌ Error al refrescar token automáticamente: 401
[AUTH] 🚪 Token inválido o expirado, cerrando sesión...
[AUTH] 🛑 Programador de refresco de token detenido
[AUTH] Auth data cleared
```

## 🔒 Almacenamiento en localStorage

```javascript
// Al hacer login o refrescar token
localStorage.setItem('authToken', 'eyJ0eXAiOiJKV1QiLCJh...');
localStorage.setItem('currentUser', '{"USR_ID":1,"USR_Name":"Juan",...}');
localStorage.setItem('tokenRefreshedAt', '1702234567890');

// Al cerrar sesión
localStorage.removeItem('authToken');
localStorage.removeItem('currentUser');
localStorage.removeItem('tokenRefreshedAt');
```

## 🛑 Detención del Sistema

El programador se detiene automáticamente cuando:

1. **Usuario cierra sesión manualmente**
   ```typescript
   logout() → clearAuthData() → stopTokenRefreshScheduler()
   ```

2. **Token expira o es inválido**
   ```typescript
   refreshToken() → Error 401 → logoutLocal() → stopTokenRefreshScheduler()
   ```

3. **Usuario borra el localStorage**
   - No hay datos → `isAuthenticated() = false`
   - Verificación salta → No hace nada

## ⚙️ Métodos Públicos

### refreshToken()

Refresca manualmente el token (también se puede llamar desde componentes si es necesario):

```typescript
// Uso manual (opcional)
this.authService.refreshToken().subscribe({
  next: (response) => {
    console.log('Token refrescado manualmente');
  },
  error: (error) => {
    console.error('Error al refrescar token');
  }
});
```

## 🧪 Casos de Uso

### Caso 1: Usuario Activo Todo el Día

```
08:00 - Login
08:30 - Verificación ✅ (23.5h restantes)
09:00 - Verificación ✅ (23h restantes)
...
06:00 (día siguiente) - Verificación ⚠️ (2h restantes)
                      - Refresco automático 🔄
06:00 - Token renovado ✅ (24h nuevas)
...
Usuario puede seguir usando la app sin interrupciones
```

### Caso 2: Usuario Inactivo (Cierra la App)

```
10:00 - Login y cierra la app
...
(App cerrada, pero localStorage persiste)
...
10:00 (día siguiente) - Usuario abre la app
                      - AuthService se inicializa
                      - Detecta token expirado (24h+)
                      - Intenta refrescar automáticamente
                      
Resultado A: Refresco exitoso → Usuario sigue autenticado
Resultado B: Token ya expiró → Cierre de sesión automático
```

### Caso 3: Usuario con Sesiones Largas

```
Día 1 - 08:00: Login
Día 1 - 06:00 (22h después): Refresco automático
Día 2 - 04:00 (22h después): Refresco automático
Día 3 - 02:00 (22h después): Refresco automático
...

Usuario puede mantener sesión indefinidamente
siempre que use la app periódicamente
```

## 🔐 Seguridad

### Ventajas de Seguridad

1. **Tokens rotan regularmente** (cada ~22 horas)
2. **Ventana de expiración corta** (2 horas de margen)
3. **Detección automática de tokens inválidos**
4. **Cierre de sesión automático en caso de error**

### Consideraciones

- ✅ El token viejo se invalida al refrescar (backend)
- ✅ Si alguien roba el token, solo es válido por poco tiempo
- ✅ El sistema detecta y maneja errores automáticamente

## 📈 Métricas del Sistema

```typescript
// Frecuencia de verificación
30 minutos × 48 = 1 verificación cada 30 min durante 24h

// Número de refrescos por día (usuario activo)
~1 refresco cada 22-24 horas

// Overhead de red
1 petición pequeña (~500 bytes) cada ~22h

// Impacto en rendimiento
Mínimo: setTimeout no bloquea UI
```

## 🎛️ Configuración Personalizada

Para ajustar el comportamiento, modificar las constantes:

```typescript
// Refrescar más frecuentemente (1 hora antes)
private readonly REFRESH_BEFORE_EXPIRY = 1 * 60 * 60 * 1000;

// Verificar más seguido (cada 15 minutos)
private readonly REFRESH_CHECK_INTERVAL = 15 * 60 * 1000;
```

## 🐛 Troubleshooting

### El token se sigue expirando

**Verificar:**
1. ¿El backend retorna el nuevo token correctamente?
2. ¿El localStorage está habilitado en el navegador?
3. ¿El usuario tiene conexión a internet al momento del refresco?

**Solución:**
- Revisar logs en consola
- Verificar que `tokenRefreshedAt` se actualiza
- Comprobar respuesta del backend en DevTools

### El programador no se ejecuta

**Verificar:**
1. ¿El usuario está autenticado?
2. ¿Se llamó a `startTokenRefreshScheduler()`?
3. ¿Hay errores en consola?

**Solución:**
- Verificar que `isAuthenticated()` retorna `true`
- Revisar que el intervalo no fue detenido prematuramente

---

## 📝 Resumen

Este sistema garantiza que los usuarios puedan mantener sus sesiones activas indefinidamente mientras usen la aplicación, mejorando significativamente la experiencia de usuario sin comprometer la seguridad.

**Características principales:**
- ✅ Refresco automático de tokens
- ✅ Sin intervención del usuario
- ✅ Manejo inteligente de errores
- ✅ Logs detallados para debugging
- ✅ Seguridad mejorada con rotación de tokens

---

**Versión**: 1.2.9  
**Fecha**: Diciembre 10, 2025  
**Autor**: Lambda Fitness Team
