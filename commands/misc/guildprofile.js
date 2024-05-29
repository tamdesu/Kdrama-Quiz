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
                await interaction.deferReply()
                const av = interaction.user.displayAvatarURL({ format: 'png', size: 4096 })
                const avArr = av.split('.')
                const ext = ".png?size=4096"
                const avUrl = avArr[0] + '.' + avArr[1] + '.' + avArr[2] + ext
                const profileCardBuffer = await generateProfileCard({
                    username: interaction.user.tag,
                    displayName: interaction.user.globalName,
                    exp: 735,
                    totalExp: 1200,
                    avatarUrl: avUrl,
                    level: 3
                  });
                  
                await interaction.channel.send({
                    files: [{
                      attachment: profileCardBuffer,
                      name: 'profile-card.png'
                    }]
                  });
                } catch (error) {
                  console.error('Error generating profile card:', error);
                  await interaction.reply('Failed to generate profile card.');
                }
 
        }
        catch(err){
            console.error(err)
            interaction.reply({content: err, ephmeral: true})
        }
    },
};
