# Guía Simple: Cómo Mostrar Standings en Tu Sitio Web

Esta guía te explica paso a paso cómo mostrar las tablas de posiciones (standings) de Tropheo en cualquier página web.

## 🎯 Lo que necesitas

Antes de empezar, necesitas conseguir 3 cosas de tu administrador de Tropheo:

1. **API Key** - Una llave de acceso (ejemplo: `abc123def456...`)
2. **URL Base** - La dirección de tu sitio Tropheo (ejemplo: `https://app.tropheo.mx`)
3. **Event ID** - El ID del evento que quieres mostrar (ejemplo: `65abc123def456789`)

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

### Cambiar el título

```javascript
embed.renderStandings({
  eventId: 'TU-EVENT-ID-AQUI',
  title: 'Tabla de Posiciones 2026', // ← Cambia esto
  container: '#standings',
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

- Tu API Key es incorrecto. Contacta a tu administrador de Tropheo.

### Aparece "Error: Event not found"

- El Event ID es incorrecto. Verifica el ID en la URL del evento.

### Los standings están vacíos

- Es normal si el evento aún no tiene juegos o resultados registrados.

## 📞 ¿Necesitas Ayuda?

Contacta a tu administrador de Tropheo para:

- Obtener o renovar tu API Key
- Resolver problemas de acceso
- Reportar errores

## 🚀 Próximos Pasos

Para implementaciones más avanzadas:

- [QUICK_START.md](./QUICK_START.md) - Guía técnica completa
- [README.md](./README.md) - Documentación detallada
- [docs/getting-started.md](./docs/getting-started.md) - Integración en React/Next.js
