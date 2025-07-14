const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const musicService = require('../services/musicService');
const queueService = require('../services/queueService');
const { getVideoInfo, isValidYouTubeUrl, searchYouTube } = require('../utils/youtube');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music from YouTube')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('YouTube URL o nombre de la canción')
                .setRequired(true)),
    
    async execute(interaction) {
        try {
            const query = interaction.options.getString('query');
            const member = interaction.member;
            const guild = interaction.guild;

            // Check if user is in a voice channel
            if (!member.voice.channel) {
                return await interaction.reply({ 
                    content: '❌ Necesitas estar en un canal de voz para reproducir música!', 
                    ephemeral: true 
                });
            }

            await interaction.deferReply();

            let url = query;
            let videoInfo;

            // Check if it's a YouTube URL
            if (isValidYouTubeUrl(query)) {
                // It's a URL, get video info directly
                videoInfo = await getVideoInfo(query);
                if (!videoInfo) {
                    return await interaction.editReply({ 
                        content: '❌ No se pudo obtener información del video. Verifica la URL e intenta nuevamente.' 
                    });
                }
            } else {
                // It's a search query, search YouTube
                const searchResults = await searchYouTube(query);
                if (searchResults.length === 0) {
                    return await interaction.editReply({ 
                        content: '❌ No se encontraron resultados para tu búsqueda.' 
                    });
                }
                
                // Use the first result
                url = searchResults[0].url;
                videoInfo = searchResults[0];
            }

            // Add to queue
            const song = {
                title: videoInfo.title,
                url: url,
                duration: videoInfo.duration,
                thumbnail: videoInfo.thumbnail,
                requestedBy: member.user.tag
            };

            queueService.addToQueue(guild.id, song);

            // Join voice channel if not already connected
            const voiceChannel = member.voice.channel;
            let connection = musicService.getConnection(guild.id);

            if (!connection) {
                connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: guild.id,
                    adapterCreator: guild.voiceAdapterCreator,
                });
                musicService.setConnection(guild.id, connection);
            }

            // Start playing if queue was empty
            const queue = queueService.getQueue(guild.id);
            if (queue.length === 1) {
                await musicService.play(guild.id, interaction.channel);
                await interaction.editReply({ 
                    content: `🎵 Reproduciendo ahora: **${song.title}**\nSolicitado por: ${song.requestedBy}` 
                });
            } else {
                await interaction.editReply({ 
                    content: `✅ Añadido a la cola: **${song.title}**\nPosición en la cola: ${queue.length}` 
                });
            }

        } catch (error) {
            console.error('Error in play command:', error);
            const content = '❌ Ocurrió un error al intentar reproducir la canción. Inténtalo nuevamente.';
            
            if (interaction.deferred) {
                await interaction.editReply({ content });
            } else {
                await interaction.reply({ content, ephemeral: true });
            }
        }
    }
};
