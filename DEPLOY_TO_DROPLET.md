# 🚀 Guía Rápida: Desplegar PWA actualizada al Droplet

## 📋 Resumen de cambios

Se agregó la funcionalidad de **instalación automática de PWA** con detección de plataforma.

---

## ⚡ Pasos para actualizar en el servidor

### 1️⃣ Build de producción (en tu PC local)

```powershell
# Navega al proyecto
cd C:\Users\carlo\OneDrive\Desktop\Angular\lambda

# Instala dependencias si es necesario
npm install

# Build de producción (con Service Worker activo)
npm run build

# Esto generará la carpeta: dist/lambda/browser/
```

### 2️⃣ Subir archivos al droplet

Desde PowerShell en tu PC:

```powershell
# Opción A: Usando SCP (recomendado)
# Reemplaza <SSH_PORT>, <DEPLOYER_USER> y <DROPLET_IP>

scp -P <SSH_PORT> -r dist/lambda/browser/* deployer@<DROPLET_IP>:/tmp/lambda-build/

# Opción B: Usando WinSCP o FileZilla
# Conecta por SFTP y sube dist/lambda/browser/* a /tmp/lambda-build/
```

### 3️⃣ Mover archivos a la carpeta web (en el droplet)

Conéctate al droplet con PuTTY y ejecuta como usuario `deployer` o `admin`:

```bash
# Conectar por SSH
ssh -p <SSH_PORT> deployer@<DROPLET_IP>

# Hacer backup del directorio actual (opcional pero recomendado)
sudo cp -r /var/www/lambda /var/www/lambda.backup.$(date +%Y%m%d_%H%M%S)

# Limpiar directorio web actual
sudo rm -rf /var/www/lambda/*

# Copiar nuevos archivos
sudo cp -r /tmp/lambda-build/* /var/www/lambda/

# Ajustar permisos
sudo chown -R deployer:nginx /var/www/lambda
sudo chmod -R 755 /var/www/lambda

# Ajustar contexto SELinux (Rocky Linux)
sudo chcon -R -t httpd_sys_content_t /var/www/lambda
sudo restorecon -Rv /var/www/lambda

# Limpiar temporal
rm -rf /tmp/lambda-build/*

# Reiniciar nginx (opcional, por si acaso)
sudo systemctl reload nginx
```

### 4️⃣ Verificar en el navegador

1. Abre Chrome en tu celular Android
2. Ve a: `https://safekids.site`
3. Espera 2-3 segundos
4. **Deberías ver el banner de instalación** deslizándose desde abajo 🎉

---

## 🔍 Verificaciones rápidas

### A. Verificar que los archivos están en el servidor:

```bash
ls -lah /var/www/lambda/

# Debes ver:
# - index.html
# - manifest.webmanifest
# - ngsw-worker.js (service worker)
# - carpetas: browser/, assets/, icons/
```

### B. Verificar configuración de Nginx:

```bash
sudo nginx -t

# Debe decir: "syntax is ok" y "test is successful"
```

### C. Ver logs de Nginx por si hay errores:

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### D. Verificar Service Worker en el navegador:

1. Abre DevTools (F12)
2. Ve a **Application** → **Service Workers**
3. Debe aparecer `ngsw-worker.js` con estado **Activated and running**

---

## 🐛 Solución de problemas comunes

### Problema 1: El banner no aparece

**Causa**: Cache del navegador o Service Worker viejo

**Solución**:
```bash
# En el navegador (consola de DevTools):
# Desregistrar service worker viejo
navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister()));

# Limpiar cache
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));

# Recargar con Ctrl+Shift+R
```

### Problema 2: Error 403 Forbidden

**Causa**: Permisos incorrectos o SELinux bloqueando

**Solución**:
```bash
# Verificar permisos
ls -lZ /var/www/lambda/

# Corregir SELinux
sudo semanage fcontext -a -t httpd_sys_content_t "/var/www/lambda(/.*)?"
sudo restorecon -Rv /var/www/lambda

# Verificar usuario de nginx
ps aux | grep nginx
# Los workers deben correr como nginx, no como root

# Ajustar propietario si es necesario
sudo chown -R deployer:nginx /var/www/lambda
```

### Problema 3: Service Worker no se registra

**Causa**: Falta el archivo ngsw-worker.js o HTTPS no está activo

**Solución**:
```bash
# Verificar que existe el service worker
ls -lh /var/www/lambda/ngsw-worker.js

# Verificar que HTTPS está funcionando
curl -I https://safekids.site | head -5

# Debe mostrar: HTTP/2 200
```

### Problema 4: manifest.webmanifest da 404

**Causa**: Nginx no está sirviendo el archivo o ruta incorrecta

**Solución**:
```bash
# Verificar que existe
ls -lh /var/www/lambda/manifest.webmanifest

# Verificar configuración de Nginx
sudo cat /etc/nginx/conf.d/lambda.conf | grep root

# Debe apuntar a: /var/www/lambda
# o /var/www/lambda/browser dependiendo de tu estructura

# Si está mal, editar:
sudo nano /etc/nginx/conf.d/lambda.conf

# Cambiar la línea root a la correcta, luego:
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📱 Probar en diferentes dispositivos

### Android (Chrome/Edge):
1. Abre el sitio
2. Espera 2 segundos
3. Banner aparece desde abajo
4. Click en "Instalar App"
5. Confirma en el diálogo nativo
6. ✅ App instalada

### iOS (Safari):
1. Abre el sitio
2. Espera 2 segundos
3. Banner con instrucciones aparece
4. Sigue los pasos manualmente
5. ✅ App en home screen

### Desktop (Chrome/Edge):
1. Abre el sitio
2. Banner aparece en esquina inferior izquierda
3. Click en "Instalar"
4. ✅ App instalada como app de escritorio

---

## 🔄 Script de despliegue automatizado (opcional)

Puedes crear este script en el droplet para agilizar futuros despliegues:

```bash
# Crear archivo /home/deployer/deploy-pwa.sh
cat > /home/deployer/deploy-pwa.sh << 'EOF'
#!/bin/bash

echo "🚀 Desplegando PWA Lambda Fitness..."

# Variables
WEB_DIR="/var/www/lambda"
TMP_DIR="/tmp/lambda-build"
BACKUP_DIR="/var/www/lambda.backup.$(date +%Y%m%d_%H%M%S)"
NGINX_USER="nginx"

# Verificar que existen archivos en temporal
if [ ! -d "$TMP_DIR" ] || [ -z "$(ls -A $TMP_DIR)" ]; then
    echo "❌ Error: No hay archivos en $TMP_DIR"
    echo "Sube los archivos primero con: scp -r dist/* deployer@server:/tmp/lambda-build/"
    exit 1
fi

echo "📦 Haciendo backup..."
sudo cp -r $WEB_DIR $BACKUP_DIR
echo "✅ Backup creado: $BACKUP_DIR"

echo "🗑️  Limpiando directorio web..."
sudo rm -rf $WEB_DIR/*

echo "📂 Copiando nuevos archivos..."
sudo cp -r $TMP_DIR/* $WEB_DIR/

echo "🔐 Ajustando permisos..."
sudo chown -R deployer:$NGINX_USER $WEB_DIR
sudo chmod -R 755 $WEB_DIR

echo "🛡️  Ajustando SELinux..."
sudo chcon -R -t httpd_sys_content_t $WEB_DIR
sudo restorecon -Rv $WEB_DIR > /dev/null 2>&1

echo "🔄 Recargando Nginx..."
sudo systemctl reload nginx

echo "🧹 Limpiando temporal..."
rm -rf $TMP_DIR/*

echo "✅ ¡Despliegue completado!"
echo "🌐 Verifica en: https://safekids.site"
EOF

# Dar permisos de ejecución
chmod +x /home/deployer/deploy-pwa.sh
```

**Uso del script**:
```bash
# 1. Desde tu PC, sube los archivos
scp -P <SSH_PORT> -r dist/lambda/browser/* deployer@<DROPLET_IP>:/tmp/lambda-build/

# 2. En el droplet, ejecuta el script
./deploy-pwa.sh
```

---

## 📊 Monitoreo post-despliegue

### Ver logs en tiempo real:
```bash
# Logs de acceso (cada request)
sudo tail -f /var/log/nginx/access.log

# Logs de errores
sudo tail -f /var/log/nginx/error.log

# Buscar errores del service worker
sudo grep "ngsw-worker" /var/log/nginx/error.log
```

### Verificar instalaciones:
Agrega analytics para trackear cuántos usuarios instalan la PWA.

---

## ✅ Checklist de despliegue

- [ ] Build de producción ejecutado: `npm run build`
- [ ] Archivos subidos a `/tmp/lambda-build/`
- [ ] Backup del directorio actual creado
- [ ] Archivos copiados a `/var/www/lambda/`
- [ ] Permisos ajustados (chown + chmod)
- [ ] SELinux configurado correctamente
- [ ] Nginx recargado sin errores
- [ ] Verificado en navegador: HTTPS funcionando
- [ ] Service Worker activo en DevTools
- [ ] Manifest sin errores en DevTools
- [ ] Banner de instalación aparece después de 2 segundos
- [ ] Instalación funciona en Android/Desktop
- [ ] Instrucciones aparecen en iOS

---

## 🎯 Resultado esperado

Después del despliegue:

1. ✅ Usuario visita `https://safekids.site`
2. ✅ PWA carga correctamente
3. ✅ Después de 2 segundos aparece el banner de instalación
4. ✅ Usuario puede instalar con 1 click (Android/Desktop)
5. ✅ Usuario ve instrucciones claras (iOS)
6. ✅ App funciona offline (Service Worker activo)
7. ✅ Iconos y splash screen correctos
8. ✅ App se abre en modo standalone (sin barra del navegador)

**¡Tu PWA ahora tiene instalación profesional automática!** 🚀📱

---

## 💡 Tips finales

1. **Cache del navegador**: Si haces cambios, incrementa la versión en `package.json` para que el SW se actualice
2. **Testing**: Prueba siempre en modo incógnito primero para evitar cache
3. **Logs**: Mantén los logs de nginx abiertos durante el primer despliegue
4. **Backup**: Siempre haz backup antes de sobrescribir archivos
5. **SELinux**: En Rocky Linux, SELinux está activo por defecto, no lo desactives

¿Listo para desplegar? 🚀
