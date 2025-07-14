const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../services/musicService');
const queueService = require('../services/queueService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the music and clear the queue'),
    
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

            // Stop the music and clear queue
            musicService.stop(guild.id);
            queueService.clearQueue(guild.id);

            await interaction.reply({ content: '⏹️ Music stopped and queue cleared!' });

        } catch (error) {
            console.error('Error in stop command:', error);
            await interaction.reply({ 
                content: '❌ An error occurred while trying to stop the music.', 
                ephemeral: true 
            });
        }
    }
};
