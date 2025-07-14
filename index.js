const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

// Collections for commands
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Register slash commands only once
const rest = new REST().setToken(process.env.DISCORD_TOKEN || 'your_discord_token_here');

let commandsRegistered = false;

async function registerCommands() {
    if (commandsRegistered) return;
    
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID || 'your_client_id_here'),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
        commandsRegistered = true;
    } catch (error) {
        console.error(error);
    }
}

registerCommands();

// Bot ready event
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Handle voice state updates for cleanup
client.on('voiceStateUpdate', (oldState, newState) => {
    // If the bot was disconnected from a voice channel
    if (oldState.member && oldState.member.user.bot && oldState.member.user.id === client.user.id) {
        if (oldState.channel && !newState.channel) {
            // Clean up music service for this guild
            const musicService = require('./services/musicService');
            musicService.cleanup(oldState.guild.id);
        }
    }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN || 'your_discord_token_here');
