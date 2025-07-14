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