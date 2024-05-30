const { EmbedBuilder } = require('discord.js');
const Inventory = require('../../models/Inventory.js');


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
                const walletEmbed = new EmbedBuilder()

                walletEmbed.setTitle(`${interaction.user.globalName}'s Wallet`)
                           .setDescription(`**Coins:** ${inventory.coins}\n\n`)
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
