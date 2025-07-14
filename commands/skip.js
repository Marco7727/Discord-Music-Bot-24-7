const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../services/musicService');
const queueService = require('../services/queueService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),
    
    async execute(interaction) {
        try {
            const guild = interaction.guild;
            const member = interaction.member;

            // Check if user is in a voice channel
            if (!member.voice.channel) {
                return await interaction.reply({ 
                    content: '❌ You need to be in a voice channel to use this command!', 
                    ephemeral: true 
                });
            }

            // Check if bot is connected
            const connection = musicService.getConnection(guild.id);
            if (!connection) {
                return await interaction.reply({ 
                    content: '❌ I\'m not connected to a voice channel!', 
                    ephemeral: true 
                });
            }

            // Check if music is playing
            const player = musicService.getPlayer(guild.id);
            if (!player) {
                return await interaction.reply({ 
                    content: '❌ No music is currently playing!', 
                    ephemeral: true 
                });
            }

            // Get current song info before skipping
            const queue = queueService.getQueue(guild.id);
            const currentSong = queue[0];
            
            if (!currentSong) {
                return await interaction.reply({ 
                    content: '❌ No song to skip!', 
                    ephemeral: true 
                });
            }

            // Skip the song
            musicService.skip(guild.id);
            
            // Check if there are more songs in queue
            const remainingQueue = queueService.getQueue(guild.id);
            if (remainingQueue.length > 0) {
                await interaction.reply({ 
                    content: `⏭️ Skipped: **${currentSong.title}**\nNow playing: **${remainingQueue[0].title}**` 
                });
            } else {
                await interaction.reply({ 
                    content: `⏭️ Skipped: **${currentSong.title}**\nQueue is now empty.` 
                });
            }

        } catch (error) {
            console.error('Error in skip command:', error);
            await interaction.reply({ 
                content: '❌ An error occurred while trying to skip the song.', 
                ephemeral: true 
            });
        }
    }
};
