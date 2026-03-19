# Guía Simple: Cómo Mostrar Standings en Tu Sitio Web

Esta guía te explica paso a paso cómo mostrar las tablas de posiciones (standings) de Tropheo en cualquier página web.

## 🎯 Lo que necesitas

Antes de empezar, necesitas 3 cosas:

1. **API Key** - Una llave de acceso que puedes generar desde tu dashboard de organización
2. **URL Base** - La dirección de tu sitio Tropheo (ejemplo: `https://app.tropheo.mx`)
3. **Event ID** - El ID del evento que quieres mostrar (ejemplo: `65abc123def456789`)

### ¿Cómo obtener tu API Key?

1. Inicia sesión en tu dashboard de Tropheo
2. Ve al **perfil de tu organización**
3. Si eres administrador de la organización, verás la opción **"Manage Organization"**
4. Dentro de **"Manage Organization"**, encontrarás diferentes apartados, entre ellos **"API Keys"**
5. Haz clic en el botón **"Create New API Key"**
6. Dale un nombre descriptivo a tu key (ejemplo: "Widget del Sitio Web")
7. Copia la API key generada y guárdala en un lugar seguro

**¡Importante!** Guarda tu API key inmediatamente después de crearla - ¡no podrás verla de nuevo!

Desde el dashboard de API Keys puedes:

- Ver todas tus keys activas e inactivas
- Activar/Desactivar keys sin eliminarlas
- Ver cuándo fue la última vez que se usó cada key
- Eliminar keys que ya no necesitas

### ¿Cómo encontrar el Event ID?

Cuando estés viendo un evento en Tropheo, mira la barra de direcciones de tu navegador:

```
https://app.tropheo.mx/events/65abc123def456789
                                  ↑
                        Este es tu Event ID
```

## 📝 Opción 1: Para Sitios Web Simples (HTML)

Esta es la forma más fácil. No necesitas instalar nada.

### Paso 1: Crea un archivo HTML

Crea un nuevo archivo llamado `standings.html` y copia este código:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Standings del Torneo</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f5f5f5;
      }
      h1 {
        color: #333;
      }
    </style>
  </head>
  <body>
    <h1>🏆 Standings del Torneo</h1>

    <!-- Aquí se mostrará la tabla de posiciones -->
    <div id="standings"></div>

    <!-- Carga la librería de Tropheo -->
    <script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>

    <script>
      // ⚙️ CONFIGURA TUS VALORES AQUÍ
      const embed = new window.TropheoEmbed({
        apiKey: 'TU-API-KEY-AQUI', // Reemplaza con tu API key
        baseUrl: 'https://app.tropheo.mx', // Reemplaza con tu URL
      });

      // Muestra los standings
      embed.renderStandings({
        eventId: 'TU-EVENT-ID-AQUI', // Reemplaza con tu Event ID
        title: 'Standings del Torneo', // Título personalizado (opcional)
        container: '#standings', // Dónde mostrar la tabla
        showEmptyState: true, // Mostrar mensaje si no hay datos
        lang: 'es', // Idioma: 'es' (español) o 'en' (inglés)
      });
    </script>
  </body>
</html>
```

### Paso 2: Reemplaza los valores

En el código anterior, reemplaza:

- `TU-API-KEY-AQUI` con tu API Key
- `https://app.tropheo.mx` con tu URL de Tropheo (si es diferente)
- `TU-EVENT-ID-AQUI` con tu Event ID

### Paso 3: Abre el archivo

1. Guarda el archivo `standings.html`
2. Haz doble clic en el archivo para abrirlo en tu navegador
3. ¡Listo! Ya deberías ver los standings

### Paso 4: Sube el archivo a tu sitio web

Si tienes un hosting web:

1. Sube el archivo `standings.html` a tu servidor web (usando FTP, cPanel, etc.)
2. Accede a él desde tu navegador: `https://tusitioweb.com/standings.html`

## 🔄 Opción 2: Integrar en una Página Existente

Si ya tienes una página web y quieres agregar los standings:

### Paso 1: Agrega el script antes de `</body>`

```html
<!-- Justo antes de cerrar </body> -->
<script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
<script>
  const embed = new window.TropheoEmbed({
    apiKey: 'TU-API-KEY-AQUI',
    baseUrl: 'https://app.tropheo.mx',
  });

  embed.renderStandings({
    eventId: 'TU-EVENT-ID-AQUI',
    title: 'Standings',
    container: '#standings', // ID del div donde quieres mostrar la tabla
    lang: 'es', // Idioma: 'es' o 'en'
  });
</script>
```

### Paso 2: Agrega el contenedor donde quieras mostrar los standings

```html
<div id="standings"></div>
```

## ⚡ Características Automáticas

El widget hace todo esto automáticamente:

✅ Detecta si el evento es un torneo, división, pool o bracket  
✅ Agrupa los equipos correctamente (por división, pool, etc.)  
✅ Muestra logos de equipos  
✅ Muestra todas las estadísticas (victorias, derrotas, puntos, etc.)  
✅ Se adapta a móviles y tablets  
✅ Incluye un botón para ver más detalles en Tropheo

## 🎨 Personalización Básica

### Cambiar el idioma

El widget soporta español e inglés:

```javascript
embed.renderStandings({
  eventId: 'TU-EVENT-ID-AQUI',
  container: '#standings',
  lang: 'es', // 'es' para español, 'en' para inglés
});
```

### Cambiar el título

```javascript
embed.renderStandings({
  eventId: 'TU-EVENT-ID-AQUI',
  title: 'Tabla de Posiciones 2026', // ← Cambia esto
  container: '#standings',
  lang: 'es',
});
```

### Mostrar en diferentes lugares

Puedes tener varios widgets en la misma página:

```html
<h2>División A</h2>
<div id="division-a"></div>

<h2>División B</h2>
<div id="division-b"></div>

<script>
  const embed = new window.TropheoEmbed({
    apiKey: 'TU-API-KEY',
    baseUrl: 'https://app.tropheo.mx',
  });

  // División A
  embed.renderStandings({
    eventId: 'EVENT-ID-DIVISION-A',
    container: '#division-a',
  });

  // División B
  embed.renderStandings({
    eventId: 'EVENT-ID-DIVISION-B',
    container: '#division-b',
  });
</script>
```

## 🛠️ Solución de Problemas

### No se muestra nada

1. Verifica que el API Key sea correcto
2. Verifica que el Event ID sea correcto
3. Abre la consola del navegador (F12) y busca mensajes de error

### Aparece "Error: Authentication failed"

- Tu API Key es incorrecto o está desactivado. Ve al perfil de tu organización → **Manage Organization** → **API Keys** para verificar que tu key esté activa.

### Aparece "Error: Event not found"

- El Event ID es incorrecto. Verifica el ID en la URL del evento.

### Los standings están vacíos

- Es normal si el evento aún no tiene juegos o resultados registrados.

## 🏀 Opción 3: Mostrar Leaderboards (Estadísticas)

Los leaderboards muestran las estadísticas de jugadores o equipos en un evento.

### Ejemplo Básico - Basketball

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Leaderboard del Torneo</title>
  </head>
  <body>
    <h1>🏀 Mejores Anotadores</h1>
    <div id="leaderboard"></div>

    <script src="https://unpkg.com/@tropheo/embed@latest/dist/index.js"></script>
    <script>
      const embed = new window.TropheoEmbed({
        apiKey: 'TU-API-KEY-AQUI',
        baseUrl: 'https://app.tropheo.mx',
      });

      embed.renderLeaderboard({
        eventId: 'TU-EVENT-ID-AQUI',
        scopeType: 'TOURNAMENT', // o 'DIVISION', 'STAGE', 'GAMEDAY'
        sport: 'basketball', // o 'baseball', 'softball', 'soccer'
        facet: 'basketball', // tipo de estadísticas
        mode: 'athletes', // 'athletes' o 'teams'
        title: 'Mejores Anotadores',
        container: '#leaderboard',
      });
    </script>
  </body>
</html>
```

### Ejemplo - Baseball Batting

```javascript
embed.renderLeaderboard({
  eventId: 'TU-EVENT-ID-AQUI',
  scopeType: 'TOURNAMENT',
  sport: 'baseball',
  facet: 'batting', // estadísticas de bateo
  mode: 'athletes',
  title: 'Mejores Bateadores',
  container: '#leaderboard',
});
```

### Ejemplo - Baseball Pitching

```javascript
embed.renderLeaderboard({
  eventId: 'TU-EVENT-ID-AQUI',
  scopeType: 'TOURNAMENT',
  sport: 'baseball',
  facet: 'pitching', // estadísticas de pitcheo
  mode: 'athletes',
  title: 'Mejores Lanzadores',
  container: '#leaderboard',
});
```

### Ejemplo - Soccer (Futbol)

```javascript
embed.renderLeaderboard({
  eventId: 'TU-EVENT-ID-AQUI',
  scopeType: 'TOURNAMENT',
  sport: 'soccer',
  facet: 'soccer',
  mode: 'athletes',
  title: 'Goleadores',
  container: '#leaderboard',
});
```

### Ejemplo - Estadísticas de Equipos

```javascript
embed.renderLeaderboard({
  eventId: 'TU-EVENT-ID-AQUI',
  scopeType: 'TOURNAMENT',
  sport: 'basketball',
  facet: 'basketball',
  mode: 'teams', // cambiar a 'teams' para equipos
  title: 'Mejores Equipos Ofensivos',
  container: '#leaderboard',
});
```

### Parámetros del Leaderboard

- **eventId**: ID del evento (obligatorio)
- **scopeType**: Alcance de las estadísticas
  - `'TOURNAMENT'` - Todo el torneo
  - `'DIVISION'` - Una división
  - `'STAGE'` - Una etapa específica
  - `'GAMEDAY'` - Un día de juego
- **sport**: Deporte
  - `'basketball'` - Baloncesto
  - `'baseball'` - Beisbol
  - `'softball'` - Softbol
  - `'soccer'` - Futbol
- **facet**: Tipo de estadísticas
  - Basketball: `'basketball'`
  - Baseball/Softball: `'batting'`, `'pitching'`, `'fielding'`
  - Soccer: `'soccer'`, `'goalkeeping'`
- **mode**: `'athletes'` (jugadores) o `'teams'` (equipos)
- **title**: Título personalizado (opcional)
- **limit**: Número máximo de entradas (opcional, default: 50)

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:

1. **API Keys:** Ve al perfil de tu organización → **Manage Organization** → **API Keys** para:
   - Generar nuevas API keys
   - Ver cuáles keys están activas
   - Activar o desactivar keys
   - Verificar cuándo fue la última vez que se usó una key

2. **Errores técnicos:** Abre la consola del navegador (F12) para ver mensajes de error detallados

3. **Reportar problemas:** Contacta al soporte de Tropheo para reportar errores o solicitar nuevas funcionalidades

## 🚀 Próximos Pasos

Para implementaciones más avanzadas:

- [QUICK_START.md](./QUICK_START.md) - Guía técnica completa
- [README.md](./README.md) - Documentación detallada
- [docs/getting-started.md](./docs/getting-started.md) - Integración en React/Next.js
