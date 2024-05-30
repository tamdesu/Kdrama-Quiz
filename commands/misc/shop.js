const { EmbedBuilder } = require('discord.js');
const Inventory = require('../../models/Inventory.js');


module.exports = {
    name: 'shop',
    description: 'Buy badges and backgrounds!',
    options: [
            {
                type: 1, // 1 is for a subcommand
                name: 'badges',
                description: 'Buy badges',
            },
            {
                type: 1, // 1 is for a subcommand
                name: 'backgrounds',
                description: 'Buy backgrounds',
            }
        ],
    
    callback: async (client, interaction) => {

        try{
            const inventory = await Inventory.findOne({
                userId: interaction.user.id
            })
            if(inventory){
                const subcommand = interaction.options.getSubcommand();
                if (subcommand === 'badges') {
                    await interaction.reply('badges used');
                } else if (subcommand === 'backgrounds') {
                    await interaction.reply('background used');
                }
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
