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
            try {
                  await generateProfileCard({
                    username: user.username,
                    displayName: user.tag,
                    exp: 735,
                    totalExp: 1200,
                    avatarUrl,
                    level: 3
                  });

                  const profileCardBuffer = fs.readFileSync('profileCard.png');
                  const attachment = new MessageAttachment(profileCardBuffer, 'profileCard.png');
                  await interaction.reply({ files: [attachment] });
                } catch (error) {
                  console.error('Error generating profile card:', error);
                  await interaction.reply('Failed to generate profile card.');
                }

        }
        catch(err){
            console.error(err)
            interaction.channel.send("There has been an error! Please try using the command again")
        }
    },
};
