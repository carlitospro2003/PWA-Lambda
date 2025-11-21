# Instrucciones para visualizar imágenes de Laravel Storage

## 1. Verificar Symlink en Laravel

En tu proyecto Laravel backend, ejecuta:

```bash
php artisan storage:link
```

Esto crea un enlace simbólico desde `public/storage` a `storage/app/public`

## 2. Verificar estructura de carpetas

Las imágenes deben estar guardadas en:
```
storage/app/public/exercises/exercise_{ID}/imagen.jpg
```

Y deben ser accesibles vía:
```
http://127.0.0.1:8000/storage/exercises/exercise_{ID}/imagen.jpg
```

## 3. Verificar que el backend retorna rutas correctas

Cuando llamas a `GET /api/getExcercise/{id}`, debe retornar:

```json
{
  "success": true,
  "data": {
    "EXC_ID": 1,
    "EXC_Title": "Sentadillas",
    "EXC_Media1": "exercises/exercise_1/imagen1.jpg",
    "EXC_Media2": "exercises/exercise_1/imagen2.jpg",
    ...
  }
}
```

**Importante:** Las rutas deben ser RELATIVAS (sin `/storage/` al inicio)

## 4. Cómo funciona en el frontend

El método `getImageUrl()` construye la URL completa:

```typescript
// Input (del backend):  "exercises/exercise_1/imagen.jpg"
// Output: "http://127.0.0.1:8000/storage/exercises/exercise_1/imagen.jpg"
```

## 5. Probar en el navegador

Abre esta URL directamente en tu navegador:
```
http://127.0.0.1:8000/storage/exercises/exercise_1/imagen.jpg
```

Si NO funciona:
- ✅ Verifica que `php artisan storage:link` se ejecutó correctamente
- ✅ Revisa que la carpeta existe: `storage/app/public/exercises/`
- ✅ Verifica permisos: `chmod -R 755 storage/`

## 6. Configuración de producción

En producción (https://api.safekids.site), cambia:
- environment.production.ts ya está configurado con: `https://api.safekids.site/api`
- Las imágenes se accederán desde: `https://api.safekids.site/storage/exercises/...`

## 7. Si las imágenes no se ven

**Revisa la consola del navegador (F12 → Console):**
- Verás las URLs exactas que se están intentando cargar
- Si hay error 404, significa que la ruta es incorrecta
- Si hay error 403, significa problema de permisos

**Revisa la consola del navegador (F12 → Network):**
- Filtra por "Img"
- Verás las peticiones de imágenes y sus respuestas
