# 🔐 Guía de Autenticación Biométrica

## 📋 Implementación Completada

Se ha implementado la autenticación con huella digital en el login de la aplicación usando el enfoque de **credenciales locales encriptadas**.

## ✅ Archivos Creados/Modificados

### Nuevos Archivos:
1. **`src/app/services/biometric.service.ts`** - Servicio para manejar la biometría
   - Verificación de disponibilidad del sensor
   - Encriptación/desencriptación de credenciales
   - Guardado en localStorage
   - Autenticación con huella

### Archivos Modificados:
1. **`src/app/login/login.page.ts`**
   - Agregado login con huella
   - Checkbox para activar huella en primer login
   - Opción para desactivar huella
   
2. **`src/app/login/login.page.html`**
   - Botón grande "Iniciar con Huella"
   - Checkbox "Activar inicio con huella"
   - Botón para desactivar huella
   
3. **`src/app/login/login.page.scss`**
   - Estilos para botón biométrico (verde)
   - Estilos para divider y checkbox

## 📦 Dependencias Instaladas

```bash
npm install @aparajita/capacitor-biometric-auth --legacy-peer-deps
npm install crypto-js --legacy-peer-deps
npm install --save-dev @types/crypto-js --legacy-peer-deps
```

## 🚀 Cómo Funciona

### Primera Vez (Activar Huella):
1. Usuario hace login normal (email + password)
2. Si el dispositivo tiene sensor de huella, ve un checkbox: **"Activar inicio con huella"**
3. Si lo marca y hace login exitoso:
   - Se le pregunta si quiere activar la huella
   - Si acepta, se guardan las credenciales encriptadas en localStorage
4. Para próximos ingresos, ve el botón **"Iniciar con Huella"**

### Login con Huella:
1. Usuario presiona **"Iniciar con Huella"**
2. El dispositivo pide la huella (nativo del SO)
3. Si la huella es correcta:
   - Se desencriptan las credenciales guardadas
   - Se hace POST /api/login normal (backend NO sabe que se usó huella)
   - Backend devuelve el JWT
4. Usuario entra a la app

### Desactivar Huella:
- Hay un botón "Desactivar huella" debajo del botón verde
- Al presionarlo, se borran las credenciales guardadas

## 🔒 Seguridad

### ¿Qué se guarda?
- **Email**: Texto plano en localStorage
- **Password**: Encriptado con AES usando crypto-js
- **Flag**: biometric_enabled = true

### Clave de Encriptación
La clave está hardcodeada en `biometric.service.ts`:
```typescript
private readonly ENCRYPTION_KEY = 'lambda-fitness-2025';
```

**⚠️ IMPORTANTE**: Para producción, considera usar una clave más segura o generarla dinámicamente.

### ¿Dónde están los datos?
- En `localStorage` del navegador/app
- Solo accesibles desde esta app
- Si borras datos de la app, se pierden

## 📱 Pasos para Probar

### En Android (Recomendado):

1. **Sincronizar Capacitor**:
   ```bash
   npx cap sync android
   ```

2. **Abrir Android Studio**:
   ```bash
   npx cap open android
   ```

3. **Compilar y ejecutar** en dispositivo físico o emulador con sensor de huella

4. **Probar el flujo**:
   - Hacer login normal
   - Marcar checkbox "Activar inicio con huella"
   - Aceptar el prompt
   - Cerrar sesión
   - Ver el botón verde "Iniciar con Huella"
   - Presionarlo y poner tu huella

### En iOS:

1. **Sincronizar Capacitor**:
   ```bash
   npx cap sync ios
   ```

2. **Abrir Xcode**:
   ```bash
   npx cap open ios
   ```

3. **Agregar permisos en Info.plist** (si no están):
   ```xml
   <key>NSFaceIDUsageDescription</key>
   <string>Usa Face ID para iniciar sesión rápidamente</string>
   ```

4. Compilar y probar en dispositivo con Face ID o Touch ID

### En Navegador (NO funcionará):

El plugin de biometría **NO funciona en navegador web**. Solo funciona en:
- Android (dispositivo real o emulador con huella)
- iOS (dispositivo real con Face ID o Touch ID)

## 🔧 API del Plugin

El plugin usado: `@aparajita/capacitor-biometric-auth`

Métodos principales:
```typescript
// Verificar disponibilidad
BiometricAuth.checkBiometry()

// Autenticar
BiometricAuth.authenticate({
  reason: 'Usa tu huella para iniciar sesión',
  cancelTitle: 'Cancelar',
  androidTitle: 'Verificación biométrica',
  // ...
})
```

## 🎨 UI Implementada

### Login Normal (sin huella guardada):
```
[Logo Lambda]
┌─────────────────────┐
│ Email               │
│ [input]             │
│                     │
│ Contraseña          │
│ [input] [👁]        │
│                     │
│ ☑ Activar huella    │ ← Solo si hay sensor
│                     │
│ [Iniciar Sesión]    │
│ ¿Olvidaste...?      │
└─────────────────────┘
```

### Login con Huella Activa:
```
[Logo Lambda]
┌─────────────────────┐
│ [🔓 Iniciar Huella] │ ← Botón verde grande
│ user@email.com      │
│ Desactivar huella   │
│                     │
│ ─── o usa tu ─────  │ ← Divider
│    contraseña       │
│                     │
│ Email               │
│ [input]             │
│ ...                 │
└─────────────────────┘
```

## ⚠️ Limitaciones Conocidas

1. **No funciona en web**: Solo en apps nativas (Android/iOS)
2. **Un dispositivo a la vez**: Si cambias de celular, debes activar huella de nuevo
3. **Credenciales locales**: Si cambias la contraseña en otro lugar, el login con huella fallará
4. **Sin sincronización**: No hay backend, todo es local

## 🔄 Flujo Completo Detallado

```
PRIMER LOGIN:
1. Usuario: email + password
2. POST /api/login → JWT
3. ¿Tiene sensor? → SÍ
4. ¿Marcó checkbox? → SÍ
5. Muestra alert: "¿Activar huella?"
6. Usuario: "Activar"
7. Guarda en localStorage:
   - biometric_email: "user@email.com"
   - biometric_password: "encrypted_password_here"
   - biometric_enabled: "true"

SIGUIENTE LOGIN:
1. Usuario ve botón verde grande
2. Click en "Iniciar con Huella"
3. Plugin: BiometricAuth.authenticate()
4. SO pide huella al usuario
5. Huella OK → Desencripta password
6. POST /api/login con email + password
7. Backend → JWT (no sabe que fue huella)
8. Usuario entra

DESACTIVAR:
1. Click en "Desactivar huella"
2. Confirma en alert
3. Borra datos de localStorage
4. Vuelve a login normal
```

## 🐛 Troubleshooting

### "BiometricAuth is not available"
- Estás probando en navegador. Usa dispositivo real o emulador.

### "No biometry available"
- El dispositivo no tiene sensor de huella
- En emulador: configura huella virtual en settings

### "Authentication failed"
- Usuario canceló
- Huella incorrecta
- Demasiados intentos fallidos

### "Credentials not saved"
- No se marcó el checkbox
- No se aceptó el prompt de activación

## 📚 Recursos

- Plugin: https://github.com/aparajita/capacitor-biometric-auth
- Crypto-js: https://www.npmjs.com/package/crypto-js
- Capacitor: https://capacitorjs.com/

## ✅ Testing Checklist

- [ ] Login normal sin huella funciona
- [ ] Checkbox de activar huella aparece (si hay sensor)
- [ ] Activar huella guarda credenciales
- [ ] Botón verde aparece después de activar
- [ ] Login con huella funciona
- [ ] Desactivar huella borra credenciales
- [ ] Después de desactivar, vuelve a login normal
- [ ] Email se pre-llena después de activar huella
- [ ] Huella incorrecta muestra error apropiado
- [ ] Cancelar huella no crashea la app

---

**¡Listo!** Ahora tu PWA tiene login con huella digital sin tocar el backend. 🎉
