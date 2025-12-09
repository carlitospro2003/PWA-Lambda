# 🔐 Configuración de Google reCAPTCHA v2 - Lambda Fitness

## 📋 ¿Qué es reCAPTCHA v2?

reCAPTCHA v2 es un sistema de protección contra bots de Google que muestra un **checkbox "No soy un robot"**. A diferencia de v3 (invisible), v2 requiere que el usuario haga clic en el checkbox y, ocasionalmente, complete un desafío visual (seleccionar imágenes).

### Ventajas de v2:
- ✅ **Más confiable**: Validación explícita por parte del usuario
- ✅ **Control del usuario**: El usuario sabe cuándo está siendo verificado
- ✅ **Mejor para formularios críticos**: Ideal para registro, contacto, pagos
- ✅ **Sin falsos positivos**: No rechaza usuarios reales por comportamiento

---

## 🎯 Pasos para Obtener las Keys

### 1. **Ir a Google reCAPTCHA Admin**

Visita: https://www.google.com/recaptcha/admin/create

### 2. **Crear un nuevo sitio**

Completa el formulario:

```
┌─────────────────────────────────────────┐
│ Label (Etiqueta):                       │
│ Lambda Fitness PWA                      │
├─────────────────────────────────────────┤
│ reCAPTCHA type:                         │
│ ☑ reCAPTCHA v2                          │
│   ☐ "I'm not a robot" Checkbox          │
├─────────────────────────────────────────┤
│ Domains (Dominios):                     │
│ - safekids.site                         │
│ - localhost                             │
├─────────────────────────────────────────┤
│ Owners (Propietarios):                  │
│ tu-email@gmail.com                      │
└─────────────────────────────────────────┘
```

**IMPORTANTE:** 
- Selecciona **reCAPTCHA v2** con la opción **"I'm not a robot" Checkbox**
- Agrega tanto tu dominio de producción (`safekids.site`) como `localhost` para desarrollo.

### 3. **Aceptar términos**

☑ Accept the reCAPTCHA Terms of Service

### 4. **Submit (Enviar)**

Click en "Submit"

---

## 🔑 Copiar las Keys

Después de crear el sitio, verás dos keys:

```
╔════════════════════════════════════════════════════╗
║  SITE KEY (Clave del sitio)                       ║
║  6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX    ║
║  → Esta va en el FRONTEND (Angular)               ║
╚════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════╗
║  SECRET KEY (Clave secreta)                        ║
║  6LcYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY    ║
║  → Esta va en el BACKEND (Laravel .env)           ║
╚════════════════════════════════════════════════════╝
```

---

## ⚙️ Configuración en el Proyecto
#### 1. **Actualizar `src/index.html`**

Reemplaza `TU_SITE_KEY_AQUI` con tu SITE KEY:

```html
<script src="https://www.google.com/recaptcha/api.js" async defer></script>
```

**NOTA:** En v2 NO se usa el parámetro `?render=` como en v3.
```html
<script src="https://www.google.com/recaptcha/api.js?render=6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"></script>
```

#### 2. **Actualizar `src/environments/environment.ts`**

```typescript
export const environment = {
  // ...
  recaptchaSiteKey: '6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  // ...
};
```

#### 3. **Actualizar `src/environments/environment.production.ts`**

```typescript
export const environment = {
  // ...
  recaptchaSiteKey: '6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  // ...
};
```

### **Backend (Laravel)**

#### 1. **Actualizar `.env`**

```env
RECAPTCHA_SECRET_KEY=6LcYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
```

#### 2. **Verificar `composer.json`**

Asegúrate de tener la librería de reCAPTCHA:

```bash
composer require google/recaptcha
```

---

## 🧪 Probar la Configuración

### **1. Modo Desarrollo (localhost)**

```bash
# Frontend
npm start

# Ir a http://localhost:4200/register
# Llenar formulario
# Click en "Crear Cuenta"
**En la consola del navegador deberías ver:**
```
[REGISTER] Renderizando reCAPTCHA v2...
[RECAPTCHA v2] Renderizando widget en: recaptcha-container
[RECAPTCHA v2] Widget renderizado con ID: 0
[REGISTER] reCAPTCHA verificado correctamente
[RECAPTCHA v2] Token obtenido del checkbox
```

**Y en pantalla:**
- Deberías ver el checkbox "No soy un robot" de Google
- Al hacer clic, se marca como verificado
- Si Google sospecha, te pedirá seleccionar imágenesCAPTCHA] Token obtenido para acción: register
[REGISTER] Token de reCAPTCHA obtenido
```

### **2. Modo Producción (safekids.site)**

```bash
# Build
npm run build

# Subir a servidor
# Ir a https://safekids.site/register
# Probar registro
```

---

## 🔍 Verificar que Funciona
Deberías ver estadísticas:
- Requests totales
- Requests exitosos vs fallidos
- Requests por país
- Dispositivos

### **En el Backend (Laravel)**

Verifica en los logs que la verificación está funcionando:

```php
// En AuthController.php
Log::info('reCAPTCHA Verificación:', ['success' => $response->isSuccess()]);
```

Si la verificación es exitosa, el usuario pudo registrarse. Si falla, se rechaza el registro.

Verifica en los logs que la verificación está funcionando:

```php
// En AuthController.php
Log::info('reCAPTCHA Score:', ['score' => $response->getScore()]);
```

Un score típico para humanos es **0.7 - 1.0**

## 🎨 Personalizar el Badge (Opcional)

reCAPTCHA v2 muestra un badge en la esquina inferior derecha. **NO recomendamos ocultarlo** ya que es parte de la UX del usuario saber que está siendo verificado.

Si necesitas ajustar su posición, puedes usar CSS:

```css
/* En src/app/register/register.page.scss */
.recaptcha-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}
```

**IMPORTANTE:** El texto de privacidad ya está incluido en el HTML del registro.

(Ya lo agregamos en el HTML del registro)

---

## 🚨 Troubleshooting

### **Error: "grecaptcha is not defined"**

**Causa:** El script de reCAPTCHA no cargó
### **Error: "grecaptcha is not defined"**

**Causa:** El script de reCAPTCHA no cargó

**Solución:**
1. Verifica que el script está en `index.html`: `<script src="https://www.google.com/recaptcha/api.js" async defer></script>`
2. Espera a que la página cargue completamente
3. Limpia caché del navegador

### **Error: "Invalid site key"**

**Causa:** La SITE_KEY es incorrecta o el dominio no está configurado

**Solución:**
1. Ve a Google reCAPTCHA Admin
2. Verifica que el dominio esté en la lista
3. Verifica que seleccionaste **v2 Checkbox**
4. Copia de nuevo la SITE_KEY
### **Error: "Verificación de seguridad fallida"**

**Causa:** El backend no puede verificar el token o el token expiró

**Soluciones:**
1. Verifica que `RECAPTCHA_SECRET_KEY` esté en `.env`
2. Verifica que `composer require google/recaptcha` esté instalado
3. Verifica que el servidor tenga acceso a internet (para llamar a Google)
4. El token de v2 expira después de 2 minutos - no tardes mucho en enviar el formulario
5. Si ves un error, el reCAPTCHA se reseteará automáticamente para que intentes de nuevo

### **El checkbox no aparece**

**Causa:** El contenedor no está en el DOM o el script no cargó

**Soluciones:**
1. Verifica que existe el div `<div id="recaptcha-container"></div>` en el HTML
2. Abre DevTools → Consola y busca errores de reCAPTCHA
3. Verifica que no haya bloqueadores de contenido (AdBlock, etc.)
4. Verifica que la SITE_KEY sea correcta

## 📊 Diferencias con v3

### **reCAPTCHA v2 (Implementado)**
- ✅ Checkbox visible "No soy un robot"
- ✅ Usuario tiene control explícito
- ✅ Más confiable para formularios críticos
- ✅ Sin falsos positivos
- ⚠️ Requiere una acción del usuario
- ⚠️ Ocasionalmente requiere resolver desafío visual

### **reCAPTCHA v3 (No usado)**
- ✅ Completamente invisible
- ✅ No interrumpe la UX
- ⚠️ Score de 0-1 puede rechazar usuarios reales
- ⚠️ Requiere ajustar threshold manualmente
- ⚠️ Menos confiable para formularios de registro
$score = $response->getScore();

if ($score < 0.5) {
    return response()->json([
        'success' => false,
## ✅ Checklist de Configuración

- [ ] Crear sitio en Google reCAPTCHA Admin
- [ ] Seleccionar **reCAPTCHA v2 → "I'm not a robot" Checkbox**
- [ ] Agregar dominios: `safekids.site` y `localhost`
- [ ] Copiar SITE_KEY y SECRET_KEY
- [ ] Actualizar `src/index.html` (verificar que no tenga `?render=`)
- [ ] Actualizar `environment.ts` con SITE_KEY
- [ ] Actualizar `environment.production.ts` con SITE_KEY
- [ ] Actualizar `.env` en Laravel con SECRET_KEY
- [ ] Instalar `composer require google/recaptcha`
- [ ] Probar en localhost (debe aparecer checkbox)
- [ ] Hacer clic en "No soy un robot"
- [ ] Enviar formulario y verificar que se registra
- [ ] Probar en producción
- [ ] Verificar analytics en Google reCAPTCHA
## 🎉 Resultado Final

Ahora tu formulario de registro está protegido con reCAPTCHA v2:
- ✅ Checkbox visible "No soy un robot"
- ✅ Validación explícita del usuario
- ✅ Protección contra bots automatizados
- ✅ Protección contra ataques de fuerza bruta
- ✅ Protección contra scripts maliciosos
- ✅ Protección contra spam de registros
- ✅ Sin falsos positivos que rechacen usuarios reales
- ✅ UX clara: el usuario sabe cuándo está siendo verificado

**El usuario simplemente hace clic en "No soy un robot" antes de registrarse** 🚀
- [ ] Instalar `composer require google/recaptcha`
- [ ] Probar en localhost
- [ ] Probar en producción
- [ ] Verificar analytics en Google reCAPTCHA

---

## 🎉 Resultado Final
## 📚 Enlaces Útiles

- **reCAPTCHA Admin Console**: https://www.google.com/recaptcha/admin
- **Documentación oficial v2**: https://developers.google.com/recaptcha/docs/display
- **FAQ**: https://developers.google.com/recaptcha/docs/faq
- **Librería PHP**: https://github.com/google/recaptcha
- **Diferencias v2 vs v3**: https://developers.google.com/recaptcha/docs/versions

Todo sin que el usuario tenga que hacer nada (no hay checkbox ni captcha visible) 🚀

---

## 📚 Enlaces Útiles

- **reCAPTCHA Admin Console**: https://www.google.com/recaptcha/admin
- **Documentación oficial**: https://developers.google.com/recaptcha/docs/v3
- **FAQ**: https://developers.google.com/recaptcha/docs/faq
- **Librería PHP**: https://github.com/google/recaptcha
