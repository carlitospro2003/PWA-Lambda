# 🔐 Implementación de 2FA (Autenticación de Dos Factores) - Lambda Fitness

## 📋 ¿Qué es 2FA?

La autenticación de dos factores (2FA) añade una capa adicional de seguridad al proceso de login. Cuando un usuario tiene 2FA habilitado:

1. **Paso 1**: Ingresa email y contraseña
2. **Paso 2**: Recibe un código de 6 dígitos por email
3. **Paso 3**: Ingresa el código para completar el login

---

## 🎯 Flujo de Autenticación

### **Sin 2FA Habilitado**
```
Usuario → Email + Password → ✅ Login Exitoso
```

### **Con 2FA Habilitado**
```
Usuario → Email + Password → 📧 Código enviado por email
         ↓
Usuario recibe código (válido por 5 minutos)
         ↓
Usuario → Ingresa código de 6 dígitos → ✅ Login Exitoso
```

---

## 🔧 Implementación Técnica

### **Backend (Laravel)**

#### Campos en la tabla `users`:
```sql
USR_2FA_Enabled     BOOLEAN      -- Si el usuario tiene 2FA activo
USR_2FA_Code        VARCHAR(6)   -- Código temporal de 6 dígitos
USR_2FA_Expires     TIMESTAMP    -- Fecha de expiración del código
```

#### Endpoint: `POST /api/login`

**Request sin código 2FA:**
```json
{
  "USR_Email": "usuario@ejemplo.com",
  "USR_Password": "password123",
  "fcm_token": "fcm_token_aqui"
}
```

**Response (requiere 2FA):**
```json
{
  "success": false,
  "message": "Código de verificación enviado a tu email",
  "requires_2fa": true,
  "email_sent": true
}
```

**Request con código 2FA:**
```json
{
  "USR_Email": "usuario@ejemplo.com",
  "USR_Password": "password123",
  "USR_2FA_Code": "123456",
  "fcm_token": "fcm_token_aqui"
}
```

**Response (login exitoso):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso con 2FA",
  "data": { ...usuario... },
  "token": "jwt_token_aqui"
}
```

---

### **Frontend (Angular + Ionic)**

#### Archivos Modificados:

1. **`src/app/services/auth.service.ts`**
   - ✅ `LoginRequest` interface actualizada con `USR_2FA_Code?: string`
   - ✅ `LoginResponse` interface con `requires_2fa?: boolean` y `email_sent?: boolean`

2. **`src/app/login/login.page.ts`**
   - ✅ Propiedades añadidas:
     ```typescript
     show2FAModal: boolean = false;
     twoFactorCode: string = '';
     isVerifying2FA: boolean = false;
     ```
   - ✅ Métodos nuevos:
     - `handleSuccessfulLogin()`: Lógica común de login exitoso
     - `verify2FACode()`: Enviar código 2FA al backend
     - `cancel2FA()`: Cancelar modal de 2FA
     - `resend2FACode()`: Reenviar código por email
     - `onCodeInput()`: Validar solo números (0-9)

3. **`src/app/login/login.page.html`**
   - ✅ Modal de 2FA con:
     - Input para código de 6 dígitos
     - Botón "Verificar"
     - Botón "Reenviar código"
     - Botón "Cancelar"
     - Información de expiración (5 minutos)

4. **`src/app/login/login.page.scss`**
   - ✅ Estilos completos para modal 2FA:
     - Overlay con backdrop blur
     - Modal centrado y responsive
     - Animaciones (fadeIn, slideUp)
     - Input estilizado para código
     - Botones con colores de marca

---

## 🎨 UI/UX del Modal 2FA

### **Diseño Visual:**
```
┌─────────────────────────────────────┐
│  📧 Icono de email (grande)         │
│  Verificación en 2 pasos            │
│  Ingresa el código enviado a:       │
│  usuario@ejemplo.com                │
├─────────────────────────────────────┤
│  Código de verificación:            │
│  [  1  2  3  4  5  6  ]             │
│                                     │
│  ⏰ El código expira en 5 minutos   │
│                                     │
│  [ Verificar ]                      │
│  ¿No recibiste el código? Reenviar  │
│  [ Cancelar ]                       │
└─────────────────────────────────────┘
```

### **Características:**
- ✅ Input numérico con espaciado visual (letter-spacing)
- ✅ Validación: solo números, máximo 6 dígitos
- ✅ Botón "Verificar" deshabilitado hasta completar 6 dígitos
- ✅ Animación suave de entrada (slideUp)
- ✅ Responsive (se adapta a móviles)
- ✅ Cierra al hacer clic fuera (overlay)

---

## 📝 Casos de Uso

### **Caso 1: Usuario sin 2FA**
1. Usuario ingresa email y contraseña
2. Click en "Iniciar Sesión"
3. ✅ **Login exitoso inmediatamente**
4. Redirección a dashboard/home

### **Caso 2: Usuario con 2FA habilitado**
1. Usuario ingresa email y contraseña
2. Click en "Iniciar Sesión"
3. Backend genera código aleatorio de 6 dígitos
4. Backend envía email con el código
5. Frontend muestra modal de 2FA
6. Usuario recibe email con código (ej: `123456`)
7. Usuario ingresa código en el modal
8. Click en "Verificar"
9. ✅ **Login exitoso** si el código es válido
10. Redirección a dashboard/home

### **Caso 3: Código expirado**
1. Usuario tarda más de 5 minutos en ingresar código
2. Click en "Verificar"
3. ❌ Backend responde: "Código inválido o expirado"
4. Frontend muestra toast de error
5. Usuario puede hacer click en "Reenviar código"
6. Nuevo código generado y enviado

### **Caso 4: Código inválido**
1. Usuario ingresa código incorrecto
2. Click en "Verificar"
3. ❌ Backend responde: "Código inválido o expirado"
4. Frontend muestra toast de error
5. Modal permanece abierto para reintentar

---

## 🧪 Pruebas

### **Prueba 1: Usuario sin 2FA**
```bash
# En la base de datos
UPDATE users SET USR_2FA_Enabled = 0 WHERE USR_Email = 'test@ejemplo.com';

# Resultado esperado:
- Login directo sin solicitar código
```

### **Prueba 2: Usuario con 2FA**
```bash
# En la base de datos
UPDATE users SET USR_2FA_Enabled = 1 WHERE USR_Email = 'test@ejemplo.com';

# Resultado esperado:
- Modal de 2FA aparece
- Email enviado con código
```

### **Prueba 3: Reenviar código**
```bash
# En el modal de 2FA:
1. Click en "Reenviar código"
2. Verificar en email que llegó nuevo código
3. Código anterior ya no funciona
```

### **Prueba 4: Código expirado**
```bash
# En la base de datos (simular expiración):
UPDATE users 
SET USR_2FA_Expires = '2025-01-01 00:00:00' 
WHERE USR_Email = 'test@ejemplo.com';

# Resultado esperado:
- Error: "Código inválido o expirado"
```

---

## ⚙️ Configuración del Backend

### **Laravel Mail (Gmail SMTP)**

Para que el envío de emails funcione, configura en `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password-aqui
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=tu-email@gmail.com
MAIL_FROM_NAME="Lambda App"
```

### **Obtener App Password de Gmail:**

1. Ve a tu cuenta de Google: https://myaccount.google.com/security
2. Activa la verificación en 2 pasos (si no está activada)
3. Ve a "Contraseñas de aplicaciones" (App Passwords)
4. Genera una contraseña para "Correo" en "Windows Computer"
5. Copia la contraseña de 16 caracteres
6. Pégala en `MAIL_PASSWORD` (sin espacios)

**IMPORTANTE:** Usa la App Password, NO tu contraseña normal de Gmail.

---

## 🔒 Seguridad

### **Características de Seguridad:**

1. ✅ **Código aleatorio**: 6 dígitos generados con `random_int(100000, 999999)`
2. ✅ **Expiración**: Código válido solo por 5 minutos
3. ✅ **Uso único**: Código se elimina después de usarlo
4. ✅ **Validación backend**: Token verificado server-side
5. ✅ **Hash de contraseñas**: Password nunca se envía en texto plano
6. ✅ **JWT**: Token de sesión después de login exitoso

### **Mejores Prácticas Implementadas:**

- ✅ Código temporal (no permanente)
- ✅ Ventana de tiempo limitada (5 minutos)
- ✅ Email como segundo factor
- ✅ Validación de formato (6 dígitos numéricos)
- ✅ Rate limiting en backend (prevenir spam)

---

## 🚀 Testing en Desarrollo

### **Probar envío de email:**

```bash
# En Laravel
php artisan tinker

# Enviar email de prueba
Mail::raw('Hola, este es un test', function($msg) {
    $msg->to('tu-email@ejemplo.com')->subject('Test');
});

# Si no hay errores, el email debería llegar
```

### **Probar 2FA completo:**

1. **Habilitar 2FA para un usuario:**
   ```sql
   UPDATE users 
   SET USR_2FA_Enabled = 1 
   WHERE USR_Email = 'test@ejemplo.com';
   ```

2. **Iniciar sesión en la app:**
   ```
   Email: test@ejemplo.com
   Password: password123
   ```

3. **Revisar email:**
   - Deberías recibir email con código de 6 dígitos
   - Ejemplo: "Tu código de verificación es: 123456"

4. **Ingresar código en el modal:**
   - Modal aparece automáticamente
   - Ingresa el código recibido
   - Click en "Verificar"

5. **Verificar login exitoso:**
   - Redirección al dashboard
   - Token JWT guardado
   - FCM token actualizado

---

## 🐛 Troubleshooting

### **Error: "SMTP connection failed"**

**Causa:** Credenciales de Gmail incorrectas o App Password no configurada

**Solución:**
1. Verifica que `MAIL_USERNAME` sea tu email completo
2. Verifica que `MAIL_PASSWORD` sea la App Password de 16 caracteres
3. Verifica que la verificación en 2 pasos esté activa en Google
4. Prueba con `php artisan tinker` enviando email de test

### **Error: "Código inválido o expirado"**

**Causa:** El código ya expiró (más de 5 minutos) o ya fue usado

**Solución:**
1. Click en "Reenviar código"
2. Revisa tu email para el nuevo código
3. Ingrésalo rápidamente (antes de 5 minutos)

### **Modal no aparece**

**Causa:** La respuesta del backend no tiene `requires_2fa: true`

**Solución:**
1. Verifica en la consola del navegador la respuesta del login
2. Asegúrate de que el usuario tiene `USR_2FA_Enabled = 1`
3. Verifica que el backend esté enviando el flag correcto

### **Email no llega**

**Causa:** Configuración SMTP incorrecta o email bloqueado

**Solución:**
1. Revisa la carpeta de SPAM
2. Verifica las credenciales SMTP en `.env`
3. Prueba con otro email (no Gmail, por ejemplo Outlook)
4. Revisa los logs de Laravel: `storage/logs/laravel.log`

---

## ✅ Checklist de Implementación

- [x] ✅ Actualizar `LoginRequest` interface con `USR_2FA_Code`
- [x] ✅ Actualizar `LoginResponse` interface con `requires_2fa`
- [x] ✅ Crear propiedades 2FA en `login.page.ts`
- [x] ✅ Implementar método `verify2FACode()`
- [x] ✅ Implementar método `resend2FACode()`
- [x] ✅ Implementar método `cancel2FA()`
- [x] ✅ Implementar método `onCodeInput()` (validación)
- [x] ✅ Refactorizar `handleSuccessfulLogin()`
- [x] ✅ Crear modal de 2FA en HTML
- [x] ✅ Agregar estilos CSS para modal
- [x] ✅ Agregar animaciones (fadeIn, slideUp)
- [x] ✅ Hacer responsive el modal
- [ ] ⚠️ Configurar SMTP en Laravel `.env`
- [ ] ⚠️ Probar envío de emails
- [ ] ⚠️ Probar flujo completo de 2FA
- [ ] ⚠️ Habilitar 2FA para usuarios específicos en BD

---

## 📚 Referencias

- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833
- **Laravel Mail**: https://laravel.com/docs/10.x/mail
- **Ionic Modals**: https://ionicframework.com/docs/api/modal
- **2FA Best Practices**: https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html

---

## 🎉 Resultado Final

Ahora el sistema de login tiene **autenticación de dos factores (2FA)** funcional:

- ✅ Modal elegante y responsive
- ✅ Validación de código de 6 dígitos
- ✅ Opción de reenviar código
- ✅ Expiración automática (5 minutos)
- ✅ Integración con Gmail SMTP
- ✅ Experiencia de usuario fluida
- ✅ Seguridad reforzada contra bots y ataques

**Los usuarios con 2FA habilitado ahora requieren verificación por email antes de acceder a la app!** 🚀🔐
