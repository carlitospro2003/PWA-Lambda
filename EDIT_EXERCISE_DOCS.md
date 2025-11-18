# 🔧 Funcionalidad de Edición de Ejercicios - Documentación

## ✅ Implementación Completada

Se ha agregado la funcionalidad para **editar ejercicios existentes** con soporte completo para actualizar texto, archivos multimedia y URLs de videos.

---

## 📦 Cambios Realizados

### 1. **Environment.ts** - Nuevo endpoint
```typescript
EDIT_EXERCISE: '/editExcercise'
```

### 2. **ExerciseService** - Nuevo método y interfaz

#### Nueva interfaz:
```typescript
export interface EditExerciseResponse {
  success: boolean;
  message: string;
  data?: Exercise;
  uploaded_files?: number;
  updated_fields?: string[];
  errors?: any;
}
```

#### Nuevo método:
```typescript
editExerciseWithMedia(exerciseId: number, formData: FormData): Observable<EditExerciseResponse>
```

### 3. **RoomExercisesPage** - Funcionalidad de edición

#### Nuevos métodos agregados:

1. **`editExercise(exercise: Exercise)`**
   - Muestra un AlertController con inputs para editar todos los campos
   - Permite editar: Título, Tipo, Dificultad, Instrucciones, URL1, URL2
   - Botones: Cancelar, Agregar Archivos, Guardar Cambios

2. **`editExerciseWithFiles(exercise: Exercise, textData: any)`**
   - Abre selector de archivos del sistema
   - Permite seleccionar múltiples archivos (imágenes/videos)
   - Límite: 4 archivos máximo
   - Formatos: JPEG, PNG, JPG, WEBP, MP4, MOV

3. **`uploadExerciseFiles(exerciseId: number, files: FileList, textData: any)`**
   - Construye FormData con texto + archivos
   - Envía a la API para actualizar
   - Muestra toast de éxito/error
   - Recarga la lista automáticamente

4. **`saveExerciseEdits(exerciseId: number, data: any)`**
   - Guarda solo cambios de texto (sin archivos)
   - Envía FormData con campos modificados
   - Recarga lista después de guardar

### 4. **HTML** - Botón de editar

Agregado en cada tarjeta de ejercicio:
```html
<ion-button 
  fill="clear" 
  color="warning"
  (click)="editExercise(exercise); $event.stopPropagation()">
  <ion-icon name="create-outline" slot="icon-only"></ion-icon>
</ion-button>
```

También agregado en el modal de detalles como botón "Editar"

### 5. **SCSS** - Estilos para edición

- Clase `.action-buttons`: Botones de acción (editar/eliminar)
- Clase `.edit-exercise-alert`: Modal de edición con estilos personalizados
- Inputs con border-radius y focus state

---

## 🎯 Flujo de Usuario

### Opción 1: Editar solo texto (sin archivos)

1. Usuario hace click en el ícono de lápiz (✏️) en la tarjeta del ejercicio
2. Se abre modal con inputs pre-llenados
3. Usuario modifica los campos deseados
4. Click en **"Guardar Cambios"**
5. Toast de confirmación
6. Lista se recarga automáticamente

### Opción 2: Editar con archivos nuevos

1. Usuario hace click en el ícono de lápiz (✏️)
2. Se abre modal con inputs
3. Usuario modifica texto Y hace click en **"Agregar Archivos"**
4. Se abre selector de archivos del sistema
5. Usuario selecciona hasta 4 archivos (imágenes/videos)
6. Se suben automáticamente con los cambios de texto
7. Toast de confirmación
8. Lista se recarga

### Opción 3: Editar desde detalles

1. Usuario hace click en "Ver Detalles"
2. En el modal de detalles, click en **"Editar"**
3. Sigue el flujo de Opción 1 o 2

---

## 🔍 Validaciones y Restricciones

### Backend (Laravel):
- **EXC_Title**: nullable, string, máx 255 caracteres
- **EXC_Type**: nullable, debe ser uno de: Calentamiento, Calistenia, Musculatura, Elasticidad, Resistencia, Médico
- **EXC_Instructions**: nullable, string
- **EXC_DifficultyLevel**: nullable, debe ser: PRINCIPIANTE, INTERMEDIO, AVANZADO
- **Archivos (EXC_Media1-4)**: nullable, formatos permitidos: jpeg, png, jpg, webp, mp4, mov, máx 20MB cada uno
- **URLs (EXC_URL1-2)**: nullable, debe ser URL válida, máx 255 caracteres

### Frontend (Angular):
- Solo se envían campos con valor (no vacíos)
- Máximo 4 archivos por edición
- Validación de formato en selector de archivos
- FormData construido dinámicamente

### Permisos:
- Solo el dueño de la sala (trainer) puede editar ejercicios
- La API valida que `ROO_USR_ID` coincida con el usuario autenticado

---

## 📝 Ejemplo de Request

### Editar solo texto:
```http
POST /api/editExcercise/5
Content-Type: multipart/form-data
Authorization: Bearer {token}

EXC_Title=Flexiones Modificadas
EXC_Type=Musculatura
EXC_DifficultyLevel=INTERMEDIO
EXC_Instructions=Realizar 3 series de 15 repeticiones
```

### Editar con archivos:
```http
POST /api/editExcercise/5
Content-Type: multipart/form-data
Authorization: Bearer {token}

EXC_Title=Sentadillas con Peso
EXC_Media1=[archivo1.jpg]
EXC_Media2=[video1.mp4]
EXC_URL1=https://youtube.com/watch?v=abc123
```

---

## 📊 Response de la API

### Éxito:
```json
{
  "success": true,
  "message": "Ejercicio actualizado exitosamente",
  "data": {
    "EXC_ID": 5,
    "EXC_Title": "Flexiones Modificadas",
    "EXC_Type": "Musculatura",
    "EXC_DifficultyLevel": "INTERMEDIO",
    "EXC_Instructions": "Realizar 3 series de 15 repeticiones",
    "EXC_Media1": "/storage/exercises/exercise_5/1699999999_media1_image.jpg",
    "EXC_Media2": null,
    "EXC_Media3": null,
    "EXC_Media4": null,
    "EXC_URL1": "https://youtube.com/watch?v=abc123",
    "EXC_URL2": null,
    "EXC_ROO_ID": 3,
    "created_at": "2025-11-08T10:00:00.000000Z",
    "updated_at": "2025-11-13T15:30:45.000000Z",
    "room": {
      "ROO_ID": 3,
      "ROO_Code": "ROOM003",
      "ROO_Name": "Grupo Personalizado",
      "ROO_USR_ID": 2
    }
  },
  "uploaded_files": 2,
  "updated_fields": ["EXC_Title", "EXC_Type", "EXC_Media1", "EXC_URL1"]
}
```

### Error - Sin permisos (403):
```json
{
  "success": false,
  "message": "No tienes permiso para editar este ejercicio"
}
```

### Error - Ejercicio no encontrado (404):
```json
{
  "success": false,
  "message": "Ejercicio no encontrado"
}
```

### Error - Validación (422):
```json
{
  "success": false,
  "message": "Error de validación",
  "errors": {
    "EXC_Type": ["El campo EXC Type debe ser uno de: Calentamiento, Calistenia..."],
    "EXC_Media1": ["El archivo debe ser una imagen o video válido"]
  }
}
```

---

## 🎨 UI/UX

### Botón de editar:
- Color: **warning** (amarillo)
- Ícono: **create-outline** (lápiz)
- Posición: Esquina inferior derecha de cada tarjeta
- Comportamiento: `$event.stopPropagation()` para no abrir detalles

### Modal de edición:
- Header: "Editar Ejercicio"
- Mensaje: "Selecciona los campos que deseas modificar"
- Inputs pre-llenados con valores actuales
- Textarea para instrucciones
- Botones:
  - Cancelar (gris)
  - Agregar Archivos (amarillo)
  - Guardar Cambios (azul - primario)

### Toast de confirmación:
- Éxito: Verde, "Ejercicio actualizado exitosamente"
- Error: Rojo, mensaje del error de la API
- Duración: 3 segundos
- Posición: Bottom

---

## 🧪 Testing

### Casos de prueba:

#### 1. Editar solo título
```
Acción: Cambiar título de "Flexiones" a "Flexiones Modificadas"
Resultado esperado: Ejercicio actualizado, título cambiado, lista recargada
```

#### 2. Editar con archivo
```
Acción: Agregar una imagen nueva (Media1)
Resultado esperado: Imagen subida, path guardado, uploaded_files = 1
```

#### 3. Editar múltiples campos
```
Acción: Cambiar título + dificultad + URL1
Resultado esperado: 3 campos actualizados, updated_fields contiene los 3
```

#### 4. Sin cambios
```
Acción: Abrir modal, cerrar sin modificar
Resultado esperado: No se envía request, lista sin cambios
```

#### 5. Archivo muy grande
```
Acción: Subir imagen > 20MB
Resultado esperado: Error 422 de validación
```

#### 6. Usuario sin permisos
```
Acción: Intentar editar ejercicio de otra sala
Resultado esperado: Error 403 Forbidden
```

---

## 🔒 Seguridad

### Validaciones implementadas:

1. **JWT Authentication**: Token requerido en header
2. **Ownership Validation**: Solo el dueño de la sala puede editar
3. **File Type Validation**: Solo formatos permitidos
4. **File Size Validation**: Máximo 20MB por archivo
5. **URL Validation**: URLs deben ser válidas
6. **Enum Validation**: Tipo y Dificultad deben ser valores permitidos

### Prevención de ataques:

- **SQL Injection**: Eloquent ORM previene inyecciones
- **XSS**: Angular sanitiza inputs automáticamente
- **CSRF**: Token JWT en lugar de cookies
- **File Upload Attacks**: Validación estricta de tipo MIME y extensión
- **Path Traversal**: Laravel Storage maneja paths de forma segura

---

## 🚀 Próximas Mejoras (Opcionales)

### 1. Eliminar ejercicio:
```typescript
async deleteExercise(exercise: Exercise) {
  const alert = await this.alertController.create({
    header: 'Confirmar eliminación',
    message: '¿Estás seguro de eliminar este ejercicio?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      { 
        text: 'Eliminar', 
        role: 'destructive',
        handler: () => {
          // Llamar API DELETE /api/deleteExcercise/{id}
        }
      }
    ]
  });
  await alert.present();
}
```

### 2. Eliminar archivos individuales:
- Agregar checkboxes para seleccionar qué archivos eliminar
- Enviar parámetro `delete_media[]` en FormData

### 3. Vista previa de imágenes antes de subir:
- Usar `FileReader` para mostrar thumbnails
- Permitir reordenar archivos antes de enviar

### 4. Progress bar de subida:
```typescript
this.http.post(url, formData, {
  reportProgress: true,
  observe: 'events'
}).subscribe(event => {
  if (event.type === HttpEventType.UploadProgress) {
    const progress = Math.round(100 * event.loaded / event.total);
    // Actualizar barra de progreso
  }
});
```

### 5. Modo offline:
- Guardar cambios en IndexedDB
- Sincronizar cuando haya conexión

---

## 📚 Archivos Modificados

```
✅ src/environments/environment.ts
   - Agregado EDIT_EXERCISE endpoint

✅ src/app/services/exercise.service.ts
   - Agregada interfaz EditExerciseResponse
   - Agregado método editExerciseWithMedia()

✅ src/app/trainer/room-exercises/room-exercises.page.ts
   - Agregado método editExercise()
   - Agregado método editExerciseWithFiles()
   - Agregado método uploadExerciseFiles()
   - Agregado método saveExerciseEdits()
   - Modificado showExerciseDetailsModal() (botón Editar)
   - Importados iconos createOutline, trashOutline

✅ src/app/trainer/room-exercises/room-exercises.page.html
   - Agregado botón de editar en exercise-actions

✅ src/app/trainer/room-exercises/room-exercises.page.scss
   - Agregados estilos para .action-buttons
   - Agregados estilos para .edit-exercise-alert
```

---

## ✅ Checklist de Funcionalidad

- [x] Endpoint agregado en environment.ts
- [x] Método en ExerciseService implementado
- [x] Modal de edición con inputs pre-llenados
- [x] Selector de archivos funcional
- [x] FormData construido correctamente
- [x] Validación de campos antes de enviar
- [x] Toast de confirmación/error
- [x] Recarga automática de lista después de editar
- [x] Botón de editar en tarjetas
- [x] Botón de editar en modal de detalles
- [x] Estilos responsive
- [x] Prevención de propagación de eventos
- [x] Manejo de errores completo
- [x] Logs en consola para debugging

---

## 🎯 Resultado Final

Ahora los usuarios (trainers) pueden:

1. ✅ Ver lista de ejercicios de una sala
2. ✅ Ver detalles completos de un ejercicio
3. ✅ **EDITAR ejercicios existentes** (nuevo)
4. ✅ **Modificar texto sin cambiar archivos** (nuevo)
5. ✅ **Subir nuevos archivos multimedia** (nuevo)
6. ✅ **Actualizar URLs de videos** (nuevo)
7. ✅ Agregar nuevos ejercicios (funcionalidad previa)

**La funcionalidad de edición está completa y lista para usar.** 🚀

---

## 📖 Ejemplo de Uso

```typescript
// Usuario hace click en botón de editar
editExercise(exercise: Exercise) {
  // Se abre modal con valores actuales
  // Usuario modifica título y dificultad
  // Click en "Guardar Cambios"
}

// FormData enviado:
{
  EXC_Title: "Nuevo Título",
  EXC_DifficultyLevel: "AVANZADO"
}

// Response:
{
  success: true,
  message: "Ejercicio actualizado exitosamente",
  updated_fields: ["EXC_Title", "EXC_DifficultyLevel"]
}

// Toast verde: "Ejercicio actualizado exitosamente"
// Lista se recarga automáticamente
```

¡Listo para probar! 🎉
