const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const queueService = require('../services/queueService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current music queue'),
    
    async execute(interaction) {
        try {
            const guild = interaction.guild;
            const queue = queueService.getQueue(guild.id);

            if (queue.length === 0) {
                return await interaction.reply({ 
                    content: '📝 The queue is empty! Use `/play` to add songs.', 
                    ephemeral: true 
                });
            }

            // Create embed for queue display
            const embed = new EmbedBuilder()
                .setTitle('🎵 Music Queue')
                .setColor('#0099ff')
                .setTimestamp();

            // Add current song (first in queue)
            const currentSong = queue[0];
            embed.addFields({
                name: '🎶 Now Playing',
                value: `**${currentSong.title}**\nRequested by: ${currentSong.requestedBy}`,
                inline: false
            });

            // Add upcoming songs
            if (queue.length > 1) {
                const upcomingSongs = queue.slice(1, 11); // Show up to 10 upcoming songs
                const queueList = upcomingSongs.map((song, index) => {
                    return `${index + 1}. **${song.title}** - ${song.requestedBy}`;
                }).join('\n');

                embed.addFields({
                    name: '📋 Up Next',
                    value: queueList,
                    inline: false
                });

                if (queue.length > 11) {
                    embed.addFields({
                        name: 'ℹ️ Additional Info',
                        value: `... and ${queue.length - 11} more songs`,
                        inline: false
                    });
                }
            }

            embed.setFooter({ text: `Total songs in queue: ${queue.length}` });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in queue command:', error);
            await interaction.reply({ 
                content: '❌ An error occurred while trying to show the queue.', 
                ephemeral: true 
            });
        }
    }
};
