# Discord Music Bot

Bot de música para Discord que reproduce canciones de YouTube con funcionalidad de búsqueda y cola.

## Funcionalidades

- 🎵 Reproducir música de YouTube por URL o nombre
- 🔍 Búsqueda automática de canciones
- 📝 Sistema de cola de canciones
- ⏸️ Controles de reproducción (pausa, resume, skip, stop)
- 🚪 Comandos de conexión (join, leave)
- 🌐 Interfaz completamente en español

## Comandos

- `/play <canción o URL>` - Reproduce música
- `/pause` - Pausa la reproducción
- `/resume` - Reanuda la reproducción
- `/skip` - Salta a la siguiente canción
- `/stop` - Detiene la música y limpia la cola
- `/queue` - Muestra la cola actual
- `/leave` - Desconecta el bot del canal de voz

## Configuración

### Variables de entorno requeridas:
- `DISCORD_TOKEN` - Token del bot de Discord
- `CLIENT_ID` - ID del cliente de Discord

### Instalación

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Configura las variables de entorno
4. Ejecuta el bot: `node index.js`

## Dependencias

- discord.js
- @discordjs/voice
- @distube/ytdl-core
- youtube-search-api
- sodium-native

## Requisitos del sistema

- Node.js 18+
- FFmpeg instalado

## Despliegue

Compatible con servicios como Render.com, Heroku, Railway, etc.

### Configuración para mantener 24/7 con UptimeRobot

El bot incluye un servidor HTTP simple para monitoreo:
- Endpoint: `/ping` o `/`
- Respuesta: JSON con estado del bot
- Puerto: 3000 (configurable con variable PORT)

**Pasos para UptimeRobot:**
1. Despliega el bot en Render.com como Web Service
2. Copia la URL de tu aplicación (ej: https://tu-bot.onrender.com)
3. En UptimeRobot, crea un nuevo monitor HTTP(s)
4. URL: https://tu-bot.onrender.com/ping
5. Intervalo: 5 minutos
6. El bot se mantendrá activo 24/7