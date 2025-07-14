const { SlashCommandBuilder } = require('discord.js');
const musicService = require('../services/musicService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused song'),
    
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

            // Check if music player exists
            const player = musicService.getPlayer(guild.id);
            if (!player) {
                return await interaction.reply({ 
                    content: '❌ No music is currently paused!', 
                    ephemeral: true 
                });
            }

            // Resume the music
            const success = musicService.resume(guild.id);
            
            if (success) {
                await interaction.reply({ content: '▶️ Music resumed!' });
            } else {
                await interaction.reply({ 
                    content: '❌ Could not resume the music. It might already be playing.', 
                    ephemeral: true 
                });
            }

        } catch (error) {
            console.error('Error in resume command:', error);
            await interaction.reply({ 
                content: '❌ An error occurred while trying to resume the music.', 
                ephemeral: true 
            });
        }
    }
};
