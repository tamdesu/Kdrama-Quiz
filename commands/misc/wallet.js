const { EmbedBuilder } = require('discord.js');
const Inventory = require('../../models/Inventory.js');
const {emojis} = require('../../emoji.json');

module.exports = {
    name: "wallet",
    aliases: ['wallet'],
    description: 'Shows your wallet',
    callback: async (client, interaction) => {

        try{
            const inventory = await Inventory.findOne({
                userId: interaction.user.id
            })
            if(inventory){
                const guild = await client.guilds.fetch("1244352964609441852");
                const walletEmbed = new EmbedBuilder()
                walletText = `**Coins:** ${inventory.coins} :coin:\n\n**Badges:**\n`
                for(const badge of inventory.badges){
                    const emoji = guild.emojis.cache.find(e => e.name === emojis[badge]);
                    walletText += `${emoji}  `;
                }
                walletText += "\n\n**Using Badges:**\n"
                for(const badge of inventory.currentBadges){
                    const emoji = guild.emojis.cache.find(e => e.name === emojis[badge]);
                    walletText += `${emoji}  `;
                }
                walletEmbed.setTitle(`${interaction.user.globalName}'s Wallet`)
                           .setDescription(walletText)
                           .setColor(0xFABCA7)
                           .setTimestamp(Date.now())

                await interaction.reply({ embeds: [walletEmbed] , ephemeral: true})
            }
            else{
                interaction.reply({content: "You haven't played any game yet! Please use /quizstart to start playing!", ephemeral: true})
            }
            
        }
        catch(err){
            console.error(err)
            interaction.channel.send("There has been an error! Please try using the command again")
        }
    },
};
