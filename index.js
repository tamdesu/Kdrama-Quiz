const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler.js');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
( async ()=>{
  try{
    await mongoose.connect(process.env.MONGO_URI);
    app.get('/', (req, res) => {
      res.send('Hello World!')
    })

    app.listen(PORT, () => {
      console.log('server started');
    });

    const client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildEmojisAndStickers
      ],
    });

    eventHandler(client);
    client.login(process.env.TOKEN);
  }
  catch(err){
    console.log(err);
  }
})();

