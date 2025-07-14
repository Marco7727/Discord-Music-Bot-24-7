const { 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState
} = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const queueService = require('./queueService');

class MusicService {
    constructor() {
        this.connections = new Map(); // guildId -> connection
        this.players = new Map(); // guildId -> player
        this.currentSongs = new Map(); // guildId -> current song info
    }

    // Get connection for a guild
    getConnection(guildId) {
        return this.connections.get(guildId);
    }

    // Set connection for a guild
    setConnection(guildId, connection) {
        this.connections.set(guildId, connection);
        
        // Handle connection state changes
        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5000),
                ]);
            } catch (error) {
                console.log(`Connection for guild ${guildId} was destroyed`);
                this.cleanup(guildId);
            }
        });

        connection.on(VoiceConnectionStatus.Destroyed, () => {
            this.cleanup(guildId);
        });
    }

    // Get player for a guild
    getPlayer(guildId) {
        return this.players.get(guildId);
    }

    // Play music for a guild
    async play(guildId, textChannel) {
        const connection = this.getConnection(guildId);
        if (!connection) {
            throw new Error('No voice connection found');
        }

        const queue = queueService.getQueue(guildId);
        if (queue.length === 0) {
            // No more songs in queue
            this.cleanup(guildId);
            if (textChannel) {
                textChannel.send('🎵 Queue finished! Use `/play` to add more songs.');
            }
            return;
        }

        const song = queue[0];
        let player = this.getPlayer(guildId);

        if (!player) {
            player = createAudioPlayer();
            this.players.set(guildId, player);
            
            // Handle player events
            player.on(AudioPlayerStatus.Idle, () => {
                // Song finished, play next
                queueService.removeFromQueue(guildId); // Remove current song
                // Add delay before trying next song to prevent immediate failures
                setTimeout(() => {
                    this.play(guildId, textChannel);
                }, 500);
            });

            player.on(AudioPlayerStatus.Playing, () => {
                console.log(`Now playing: ${song.title} in guild ${guildId}`);
            });

            player.on('error', (error) => {
                console.error('Audio player error:', error);
                if (textChannel) {
                    textChannel.send('❌ Ocurrió un error al reproducir la canción. Saltando a la siguiente canción.');
                }
                queueService.removeFromQueue(guildId);
                // Add delay before trying next song to prevent infinite loops
                setTimeout(() => {
                    this.play(guildId, textChannel);
                }, 1000);
            });

            // Subscribe connection to player
            connection.subscribe(player);
        }

        try {
            // Create audio stream with better error handling
            const stream = ytdl(song.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25,
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                }
            });

            // Handle stream errors
            stream.on('error', (error) => {
                console.error('Stream error:', error);
                if (textChannel) {
                    textChannel.send('❌ Error al obtener el audio. Saltando a la siguiente canción.');
                }
                queueService.removeFromQueue(guildId);
                setTimeout(() => {
                    this.play(guildId, textChannel);
                }, 1000);
            });

            const resource = createAudioResource(stream, {
                inputType: 'arbitrary',
                inlineVolume: false
            });

            // Volume control disabled for compatibility

            // Play the resource
            player.play(resource);
            this.currentSongs.set(guildId, song);

        } catch (error) {
            console.error('Error playing song:', error);
            if (textChannel) {
                textChannel.send('❌ Error al reproducir la canción. Saltando a la siguiente canción.');
            }
            queueService.removeFromQueue(guildId);
            // Add delay before trying next song to prevent infinite loops
            setTimeout(() => {
                this.play(guildId, textChannel);
            }, 1000);
        }
    }

    // Pause music
    pause(guildId) {
        const player = this.getPlayer(guildId);
        if (player && player.state.status === AudioPlayerStatus.Playing) {
            player.pause();
            return true;
        }
        return false;
    }

    // Resume music
    resume(guildId) {
        const player = this.getPlayer(guildId);
        if (player && player.state.status === AudioPlayerStatus.Paused) {
            player.unpause();
            return true;
        }
        return false;
    }

    // Stop music
    stop(guildId) {
        const player = this.getPlayer(guildId);
        if (player) {
            player.stop();
            return true;
        }
        return false;
    }

    // Skip current song
    skip(guildId) {
        const player = this.getPlayer(guildId);
        if (player) {
            player.stop(); // This will trigger the idle event and play next song
            return true;
        }
        return false;
    }

    // Get current song info
    getCurrentSong(guildId) {
        return this.currentSongs.get(guildId);
    }

    // Clean up resources for a guild
    cleanup(guildId) {
        const player = this.getPlayer(guildId);
        if (player) {
            player.stop();
            this.players.delete(guildId);
        }

        const connection = this.getConnection(guildId);
        if (connection) {
            try {
                connection.destroy();
            } catch (error) {
                console.log(`Connection already destroyed for guild ${guildId}`);
            }
            this.connections.delete(guildId);
        }

        this.currentSongs.delete(guildId);
        queueService.clearQueue(guildId);
        
        console.log(`Cleaned up resources for guild ${guildId}`);
    }
}

module.exports = new MusicService();
