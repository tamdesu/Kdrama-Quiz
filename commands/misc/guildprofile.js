const { EmbedBuilder } = require('discord.js');
const Level = require('../../models/Level.js');
const Player = require('../../models/Player.js');
const { generateProfileCard } = require('../../imageBuilder/profileCard.js');

module.exports = {
    name: "guildprofile",
    aliases: ['guild profile'],
    description: 'Shows your peofile card for this server',
    callback: async (client, interaction) => {


        try{
            const user = interaction.user;

            //await interaction.deferReply();

            try {
              const reply = await interaction.reply("loading image")
              const buffer = await generateProfileCard({
                username: user.tag,
                displayName: user.tag,
                exp: 735, // Example data
                totalExp: 1200, // Example data
                avatarUrl: user.displayAvatarURL({ format: 'png' }),
                level: 3 // Example data
              });
              
              await reply.edit({
                files: [{
                  attachment: buffer,
                  name: 'profile-card.png'
                }]
              });

            } catch (error) {
              console.error(error);
              await interaction.followUp('There was an error generating the profile card.');
            }
        }
        catch(err){
            console.error(err)
            interaction.channel.send("There has been an error! Please try using the command again")
        }
    },
};
