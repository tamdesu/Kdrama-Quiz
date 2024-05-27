const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler.js');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.MessageContent,
  ],
});

eventHandler(client);

client.login(process.env.TOKEN);