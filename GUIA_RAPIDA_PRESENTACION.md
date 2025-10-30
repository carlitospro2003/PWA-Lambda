# 🎤 GUÍA RÁPIDA PARA PRESENTAR (10-15 MINUTOS)

## ESTRUCTURA SUGERIDA DE PRESENTACIÓN

### 1. INTRODUCCIÓN (2 minutos)
**Qué decir:**
> "Buenos días. Hoy voy a presentar cómo implementé **Entrega Continua (CD)** en mi proyecto Lambda Fitness PWA usando **GitHub Actions**. Este proyecto es una aplicación web progresiva para gestión de entrenamiento fitness, desarrollada con Angular e Ionic."

**Mostrar:**
- Captura del proyecto funcionando
- Repositorio en GitHub

---

### 2. CONTEXTO: ¿QUÉ ES CD? (2 minutos)
**Qué decir:**
> "La Entrega Continua o CD es una práctica donde el código se compila, prueba y prepara automáticamente para despliegue. Investigué varias herramientas: Jenkins, GitLab CI, CircleCI y GitHub Actions. Elegí GitHub Actions porque..."

**Mostrar diapositiva:**
```
HERRAMIENTAS EVALUADAS
✅ GitHub Actions → Integrado, gratuito, simple
❌ Jenkins → Complejo, requiere servidor
❌ GitLab CI → Requiere migrar repo
❌ CircleCI → Costo por usuario
```

**Por qué GitHub Actions:**
1. Ya uso GitHub para mi repositorio
2. Gratuito (2000 min/mes)
3. YAML simple
4. Artifacts y Environments integrados

---

### 3. ARQUITECTURA DE LA SOLUCIÓN (3 minutos)
**Qué decir:**
> "Mi pipeline tiene 2 jobs principales: Build y Deploy. Cuando hago push a main, automáticamente se ejecuta todo el proceso."

**Mostrar diagrama:**
```
PUSH → BUILD (npm install + build + test) → ARTIFACT → DEPLOY (preproducción)
```

**Explicar Jobs:**
- **Job 1 - build_artifact:** Compila la app y crea el artefacto
- **Job 2 - deploy_simulado:** Despliega a preproducción (simulado)

**Mostrar el archivo YAML** (pantalla compartida):
- Trigger: `on: push: branches: - main`
- Steps del build
- Upload/Download artifacts

---

### 4. DEMOSTRACIÓN EN VIVO (5 minutos)
**Qué hacer:**

#### Opción A - Si hay internet:
1. Abrir GitHub en el navegador
2. Ir a la pestaña **Actions**
3. Mostrar workflows ejecutados
4. Abrir el último workflow exitoso
5. Explicar cada step mientras navegas:
   - "Aquí se instalaron las dependencias"
   - "Aquí se compiló la aplicación"
   - "Aquí se ejecutaron las pruebas"
   - "Este es el artefacto generado"
6. Click en **Artifacts** → Mostrar el ZIP descargable
7. (BONUS) Hacer un cambio en vivo:
   ```bash
   # Editar README.md
   git add .
   git commit -m "demo: Presentación CD"
   git push
   ```
8. Mostrar workflow ejecutándose en tiempo real

#### Opción B - Sin internet o para ir seguro:
1. Mostrar capturas de pantalla pre-hechas
2. Explicar cada imagen:
   - Workflow list
   - Job execution
   - Artifacts section
   - Deployment approval

---

### 5. RESULTADOS Y BENEFICIOS (2 minutos)
**Qué decir:**
> "Los beneficios que obtuve al implementar CD fueron..."

**Mostrar tabla:**
```
ANTES vs DESPUÉS
❌ Build manual 30 min → ✅ Automático 5 min
❌ Tests se olvidaban → ✅ Obligatorios siempre
❌ Sin trazabilidad → ✅ Historial completo
❌ Errores en prod → ✅ Detección temprana
```

**Mencionar métricas:**
- 85% reducción de tiempo
- 100% de commits con tests
- 7 días de artefactos almacenados

---

### 6. CONCLUSIÓN (1 minuto)
**Qué decir:**
> "En conclusión, implementé exitosamente Entrega Continua en mi proyecto usando GitHub Actions. Logré automatizar el pipeline completo desde el código hasta el artefacto desplegable. Los próximos pasos serían configurar despliegue real a un servidor cloud."

**Mostrar diapositiva final:**
```
LOGROS
✅ Pipeline automatizado completo
✅ Tests obligatorios en cada commit
✅ Artefactos versionados
✅ Environment de preproducción
✅ Base para despliegue a producción
```

---

### 7. PREGUNTAS (2-3 minutos)
**Preguntas probables y respuestas:**

**Q: "¿Por qué no usaste Jenkins?"**
A: "Jenkins requiere configurar y mantener un servidor. GitHub Actions ya está integrado en mi repositorio y es gratuito."

**Q: "¿Qué pasa si los tests fallan?"**
A: "El workflow se detiene automáticamente. El artefacto no se crea y no hay despliegue. Esto previene errores en producción."

**Q: "¿Es gratis?"**
A: "Sí, GitHub Actions da 2000 minutos gratis al mes. Mi workflow usa ~5 minutos por ejecución, suficiente para desarrollo."

**Q: "¿Se puede desplegar a un servidor real?"**
A: "Sí, solo necesito agregar las credenciales del servidor (SSH, AWS keys, etc.) y los comandos de despliegue. El proceso es el mismo."

**Q: "¿Cómo se revierte un despliegue fallido?"**
A: "Descargo el artefacto de un commit anterior desde la sección Artifacts. Todos quedan almacenados 7 días."

---

## 📝 TIPS PARA LA PRESENTACIÓN

### Preparación
- [ ] Practica 2-3 veces en voz alta
- [ ] Mide el tiempo (máximo 15 min)
- [ ] Ten el GitHub abierto en pestañas separadas
- [ ] Prepara capturas de pantalla de respaldo
- [ ] Haz un push de prueba 1 hora antes

### Durante
- [ ] Habla despacio y claro
- [ ] Usa términos técnicos pero explícalos
- [ ] Señala en pantalla lo que mencionas
- [ ] No leas las diapositivas, explícalas
- [ ] Muestra confianza (¡tú lo implementaste!)

### Lenguaje Corporal
- 👍 Contacto visual con la audiencia
- 👍 Gestos naturales para enfatizar
- 👍 Postura erguida
- 👎 Evita muletillas ("ehhh", "este", "o sea")
- 👎 No leas directamente de las diapositivas

---

## 🎬 SCRIPT COMPLETO (OPCIONAL)

### INICIO
> "Buenos días/tardes. Mi nombre es [TU NOMBRE] y hoy voy a presentar la implementación de **Entrega Continua** en mi proyecto Lambda Fitness PWA.
>
> Lambda Fitness es una aplicación web progresiva que desarrollé con Angular e Ionic. Permite a entrenadores crear salas de entrenamiento, agregar ejercicios y gestionar miembros.
>
> Para esta materia de Gestión del Proceso de Desarrollo de Software, investigamos sobre herramientas de Liberación y Despliegue Continuo. Específicamente sobre:
> - Entrega continua de artefactos a ambientes de prueba
> - Entrega continua a preproducción
> - Despliegue automatizado
>
> De las herramientas investigadas, elegí **GitHub Actions** y lo apliqué a mi proyecto."

### DESARROLLO
> "¿Qué es Entrega Continua? Es una práctica donde cada cambio en el código se compila, prueba y prepara automáticamente para producción. La diferencia con Integración Continua es que CI solo verifica el código, mientras CD lo deja listo para desplegar.
>
> [MOSTRAR DIAGRAMA]
>
> Evalué 4 herramientas: Jenkins es muy potente pero complejo. GitLab CI requería migrar mi repositorio. CircleCI tiene costo por usuario. Y GitHub Actions estaba perfecto porque ya uso GitHub, es gratis, y tiene sintaxis simple.
>
> [MOSTRAR COMPARACIÓN]
>
> Mi solución tiene esta arquitectura: Cuando hago push a la rama main, se dispara automáticamente el workflow. Tiene 2 jobs.
>
> El primer job 'build_artifact' hace checkout del código, instala Node.js 20, ejecuta npm install para las dependencias, npm run build para compilar, npm test para las pruebas, y al final sube el artefacto.
>
> El segundo job 'deploy_simulado' espera a que el primero termine, descarga el artefacto, y simula el despliegue a preproducción.
>
> [MOSTRAR CÓDIGO YAML]
>
> Aquí pueden ver el archivo YAML. Es muy legible. Define el trigger 'on push to main', los jobs, y cada step con sus comandos.
>
> Ahora voy a mostrar una ejecución real.
>
> [DEMOSTRACIÓN EN VIVO]
>
> Aquí en GitHub, pestaña Actions, pueden ver todos los workflows ejecutados. Este de hace 2 horas fue exitoso. Si lo abro, vemos los 2 jobs. El primero tardó 4 minutos. Podemos ver cada step: checkout pasó, Node.js configurado, npm install tardó 1 minuto, build 2 minutos, tests pasaron. Y aquí está el artefacto listo para descargar.
>
> El segundo job esperó la aprobación y simuló el despliegue. En un caso real, aquí se copiarían los archivos al servidor.
>
> [MOSTRAR BENEFICIOS]
>
> Los beneficios que obtuve fueron significativos. Antes tardaba 30 minutos haciendo build manual. Ahora son 5 minutos automáticos. Los tests antes se olvidaban, ahora son obligatorios. Y tengo trazabilidad completa de cada build."

### CIERRE
> "En conclusión, implementé exitosamente un pipeline de Entrega Continua usando GitHub Actions. Cumplí con los 3 objetivos: entrega a pruebas, entrega a preproducción, y despliegue automatizado.
>
> Los logros principales fueron: pipeline completamente automatizado, tests obligatorios en cada commit, artefactos versionados y almacenados, y un environment de preproducción configurado.
>
> Como trabajo futuro, planeo configurar despliegue real a Firebase Hosting, agregar notificaciones por Slack, y extender a múltiples ambientes.
>
> ¿Alguna pregunta?"

---

## 📊 DIAPOSITIVAS MÍNIMAS SUGERIDAS

### Diapositiva 1: TÍTULO
```
ENTREGA CONTINUA CON GITHUB ACTIONS
Proyecto: Lambda Fitness PWA

[TU NOMBRE]
Gestión del Proceso de Desarrollo de Software
[FECHA]
```

### Diapositiva 2: EL PROYECTO
```
LAMBDA FITNESS PWA
✓ Progressive Web Application
✓ Angular + Ionic + Laravel
✓ Gestión de entrenamiento
✓ Instalable como app nativa

GitHub: carlitospro2003/PWA-Lambda
```

### Diapositiva 3: ¿QUÉ ES CD?
```
CONTINUOUS DELIVERY (CD)

Código → Build → Tests → Artefacto → Deploy

CI: Integrar código
CD: Entregar software listo para producción
```

### Diapositiva 4: HERRAMIENTAS EVALUADAS
```
┌─────────────────┬──────────┬──────────┐
│ Herramienta     │ Ventajas │ Decisión │
├─────────────────┼──────────┼──────────┤
│ GitHub Actions  │ Integrado│    ✅    │
│                 │ Gratuito │          │
│ Jenkins         │ Flexible │    ❌    │
│ GitLab CI       │ Completo │    ❌    │
│ CircleCI        │ Rápido   │    ❌    │
└─────────────────┴──────────┴──────────┘
```

### Diapositiva 5: ARQUITECTURA
```
PUSH a main
    ↓
JOB 1: BUILD
  • Checkout
  • Node.js 20
  • npm install
  • npm run build
  • npm test
  • Upload artifact
    ↓
JOB 2: DEPLOY
  • Download artifact
  • Deploy a preproducción
```

### Diapositiva 6: CÓDIGO (OPCIONAL)
```yaml
# .github/workflows/cd_pwa_simulacion.yml
name: Entrega Continua de Artefacto PWA

on:
  push:
    branches: [main]

jobs:
  build_artifact:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install && npm run build
      - uses: actions/upload-artifact@v4
```

### Diapositiva 7: DEMO
```
[CAPTURA DE PANTALLA]
GitHub Actions - Workflow ejecutándose
```

### Diapositiva 8: RESULTADOS
```
ANTES vs DESPUÉS

❌ 30 min manual  →  ✅ 5 min automatizado
❌ Tests opcionales  →  ✅ Tests obligatorios
❌ Sin historial  →  ✅ Trazabilidad 100%
❌ Errores en prod  →  ✅ Detección temprana

MEJORA: 85% reducción de tiempo
```

### Diapositiva 9: CONCLUSIÓN
```
LOGROS ALCANZADOS

✅ Pipeline CD completamente automatizado
✅ Tests obligatorios en cada commit
✅ Artefactos versionados (7 días)
✅ Environment de preproducción
✅ Base para despliegue a producción

PRÓXIMOS PASOS
→ Despliegue real a Firebase/Netlify
→ Notificaciones automáticas
→ Múltiples ambientes (dev, staging, prod)
```

### Diapositiva 10: PREGUNTAS
```
¿PREGUNTAS?

GitHub: github.com/carlitospro2003/PWA-Lambda
Email: [TU EMAIL]

¡Gracias!
```

---

## ⏱️ CRONOMETRAJE SUGERIDO

| Sección | Tiempo | Acumulado |
|---------|--------|-----------|
| Introducción | 2 min | 2 min |
| ¿Qué es CD? | 2 min | 4 min |
| Arquitectura | 3 min | 7 min |
| Demo en vivo | 5 min | 12 min |
| Resultados | 2 min | 14 min |
| Conclusión | 1 min | 15 min |
| **TOTAL** | **15 min** | |
| Preguntas | 3-5 min | 18-20 min |

---

## 🚨 PLAN B: SI ALGO SALE MAL

### Si no hay internet
- Usa capturas de pantalla pre-hechas
- Explica que normalmente lo harías en vivo
- Muestra el código YAML en VS Code

### Si el workflow falla
- Muestra un workflow anterior exitoso
- Explica que los errores son parte del proceso
- Demuestra cómo se depura (ver logs)

### Si te quedas sin tiempo
- Salta directo a la demo
- Reduce explicación de herramientas evaluadas
- Acorta la sección de conclusión

### Si te preguntan algo que no sabes
- "Excelente pregunta, no lo implementé pero investigaré"
- "Eso sería un próximo paso interesante"
- "En la documentación oficial se menciona [X]"

---

## 📌 CHECKLIST FINAL

### 1 Día Antes
- [ ] Revisar que el workflow funcione
- [ ] Hacer capturas de pantalla de respaldo
- [ ] Practicar presentación 2 veces
- [ ] Preparar respuestas a preguntas probables

### 1 Hora Antes
- [ ] Hacer un push de prueba
- [ ] Abrir GitHub en navegador
- [ ] Verificar que Actions esté visible
- [ ] Tener workflow reciente ejecutado

### 5 Minutos Antes
- [ ] Pestañas abiertas: Repo, Actions, Workflow file
- [ ] VS Code con el proyecto abierto
- [ ] Diapositivas listas
- [ ] Respirar profundo 😊

---

**¡MUCHO ÉXITO EN TU PRESENTACIÓN! 🎉**

Recuerda: Tú implementaste esto. Sabes de qué hablas. ¡Confianza!
