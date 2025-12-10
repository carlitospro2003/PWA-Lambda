# Optimización de Carga de Imágenes en PWA

## 🐛 Problema Identificado

Al crear ejercicios desde la PWA instalada (especialmente en modo offline/móvil), las imágenes pesadas (mayores a 5MB) causaban problemas al intentar subirlas al backend, a pesar de que el backend acepta archivos de hasta 20MB.

## ✅ Solución Implementada

### 1. **Compresión Automática de Imágenes**

Se implementó un sistema de compresión automática que:

- ✅ Detecta imágenes mayores a **5MB**
- ✅ Las comprime automáticamente antes de subir
- ✅ Reduce el tamaño sin perder calidad significativa (80% de calidad JPEG)
- ✅ Redimensiona imágenes muy grandes (máx. 1920px en el lado más largo)
- ✅ Muestra el ahorro de espacio al usuario

### 2. **Validación Mejorada**

**Antes:**
```typescript
const maxSize = 20 * 1024 * 1024; // 20MB
if (file.size > maxSize) {
  this.showToast('El archivo es muy grande. Máximo 20MB permitido', 'danger');
}
```

**Después:**
```typescript
const maxSize = 20 * 1024 * 1024; // 20MB = 20480 KB
if (file.size > maxSize) {
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
  await this.showToast(`El archivo es muy grande (${fileSizeMB}MB). Máximo 20MB permitido`, 'danger');
}
```

### 3. **Algoritmo de Compresión**

```typescript
private async compressImage(file: File): Promise<File> {
  // 1. Leer la imagen
  const reader = new FileReader();
  reader.readAsDataURL(file);
  
  // 2. Crear canvas y redimensionar
  const canvas = document.createElement('canvas');
  const maxDimension = 1920;
  
  // 3. Comprimir a JPEG con calidad 80%
  canvas.toBlob(
    (blob) => {
      const compressedFile = new File(
        [blob],
        file.name.replace(/\.[^.]+$/, '_compressed.jpg'),
        { type: 'image/jpeg', lastModified: Date.now() }
      );
      resolve(compressedFile);
    },
    'image/jpeg',
    0.8 // Calidad 80%
  );
}
```

## 📊 Resultados

### Antes:
- ❌ Imagen de 15MB → Falla al subir desde PWA
- ❌ Imagen de 8MB → Lenta y puede fallar
- ❌ No hay feedback del tamaño real

### Después:
- ✅ Imagen de 15MB → Comprime a ~3-4MB → Sube exitosamente
- ✅ Imagen de 8MB → Comprime a ~1-2MB → Sube rápidamente
- ✅ Muestra tamaño original y comprimido
- ✅ Indica cuánto espacio se ahorró

## 🎯 Características

### Compresión Inteligente
- **Umbral de compresión**: 5MB
- **Resolución máxima**: 1920px (lado más largo)
- **Calidad JPEG**: 80%
- **Formato de salida**: JPEG (optimizado para web)

### Mensajes Informativos
```
✅ Imagen comprimida: 2.3MB (ahorraste 12.7MB)
⚠️ Imagen grande detectada (8.5MB). Comprimiendo...
📁 Archivo seleccionado: foto.jpg (1.2MB)
```

### UI Mejorada
- 📝 Descripción clara del límite de 20MB
- ℹ️ Icono informativo
- 🎨 Estilo visual destacado
- 📊 Feedback en tiempo real

## 🧪 Casos de Uso

### Caso 1: Imagen Pequeña (< 5MB)
```
Usuario selecciona imagen de 2MB
→ No se comprime
→ Sube directamente
→ Mensaje: "Archivo seleccionado: foto.jpg (2MB)"
```

### Caso 2: Imagen Grande (5MB - 20MB)
```
Usuario selecciona imagen de 15MB
→ Se comprime automáticamente
→ Reduce a ~3MB
→ Mensaje: "✅ Imagen comprimida: 3MB (ahorraste 12MB)"
→ Sube sin problemas
```

### Caso 3: Imagen Muy Grande (> 20MB)
```
Usuario selecciona imagen de 25MB
→ Se rechaza antes de comprimir
→ Mensaje: "El archivo es muy grande (25MB). Máximo 20MB permitido"
```

### Caso 4: Video
```
Usuario selecciona video de 18MB
→ No se comprime (solo imágenes)
→ Sube directamente
→ Mensaje: "Archivo seleccionado: video.mp4 (18MB)"
```

## 📝 Archivos Modificados

### 1. `add-exercise.page.ts`
**Cambios:**
- ✅ Método `onFileSelected()` ahora es asíncrono
- ✅ Nuevo método `compressImage()` para comprimir imágenes
- ✅ Validación mejorada con tamaños en MB
- ✅ Feedback detallado al usuario
- ✅ Manejo de errores en compresión

### 2. `add-exercise.page.html`
**Cambios:**
- ✅ Nuevo mensaje informativo en sección multimedia
- ✅ Icono `information-circle-outline`

### 3. `add-exercise.page.scss`
**Cambios:**
- ✅ Nuevo estilo `.section-description`
- ✅ Diseño destacado con fondo amarillo claro
- ✅ Icono informativo dorado

## 🔄 Flujo de Carga de Imagen

```
1. Usuario selecciona imagen
   ↓
2. Validar tipo de archivo (JPEG, PNG, WEBP, MP4, MOV)
   ↓
3. Validar tamaño (< 20MB)
   ↓
4. ¿Es imagen > 5MB?
   ├─ SÍ → Comprimir automáticamente
   │        ├─ Redimensionar si es necesario (máx. 1920px)
   │        ├─ Comprimir a JPEG 80%
   │        ├─ Crear nuevo File
   │        └─ Mostrar ahorro de espacio
   └─ NO → Usar imagen original
   ↓
5. Almacenar en uploadedFiles
   ↓
6. Mostrar mensaje de confirmación
   ↓
7. Al guardar ejercicio → Enviar al backend
```

## 🚀 Beneficios

### Para el Usuario
- ✅ **Subidas más rápidas** (archivos más pequeños)
- ✅ **Mayor éxito** en la carga desde PWA móvil
- ✅ **Ahorro de datos** en conexiones móviles
- ✅ **Feedback claro** sobre el proceso

### Para el Sistema
- ✅ **Menor uso de ancho de banda**
- ✅ **Menor espacio en servidor**
- ✅ **Carga más rápida** en la visualización
- ✅ **Mejor rendimiento** general de la PWA

## 📱 Compatibilidad

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ PWA instalada en Android
- ✅ PWA instalada en iOS
- ✅ Modo online y offline (compresión local)

## 🎓 Mejores Prácticas

1. **Siempre comprimir imágenes grandes** antes de subir
2. **Mantener calidad al 80%** para balance tamaño/calidad
3. **Limitar resolución a 1920px** para dispositivos móviles
4. **Convertir a JPEG** para mejor compresión
5. **Informar al usuario** sobre el proceso

## 🔧 Configuración

Para ajustar el comportamiento, modificar estas constantes:

```typescript
// En onFileSelected()
const compressionThreshold = 5 * 1024 * 1024; // 5MB
const maxFileSize = 20 * 1024 * 1024; // 20MB

// En compressImage()
const maxDimension = 1920; // Resolución máxima
const quality = 0.8; // Calidad JPEG (80%)
```

---

**Versión**: 1.2.7  
**Fecha**: Diciembre 10, 2025  
**Autor**: Lambda Fitness Team
