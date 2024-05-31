const { EmbedBuilder } = require('discord.js');
const Player = require('../../models/Player.js');
const Level = require('../../models/Level.js');
const path = require('path');
module.exports = {
    name: "leaderboard",
    aliases: ['leaderboard'],
    description: 'Shows the command list and their explanaton',
    options: [
        {
            type: 1, // 1 is for a subcommand
            name: 'server',
            description: 'Shows leaderboard for this server',
        },
        {
            type: 1, // 1 is for a subcommand
            name: 'global',
            description: 'Shows global leaderboard',
        }
    ],
    callback: async (client, interaction) => {

        try{
            let leaderboard;
            let leaderboardTitle;
            if(interaction.options.getSubcommand() === 'server'){
                leaderboard = await Level.find({guildId: interaction.guild.id}).sort({totalExp: -1}).limit(10)
                leaderboardTitle = `Leaderboard for ${interaction.guild.name}`
            }
            else if(interaction.options.getSubcommand() === 'global'){
                leaderboard = await Player.find().sort({totalExp: -1}).limit(10)
                leaderboardTitle = `Leaderboard Global`
            }
            let leaderboardDescription = ``;
            for(let i = 0; i < leaderboard.length; i++){
                const user = await client.users.fetch(leaderboard[i].userId);
                leaderboardDescription += `**${i+1}. ${user.globalName} (${user.username}) - Level. ${leaderboard[i].level} - Total Exp: ${leaderboard[i].totalExp}** \n`
            }
            const lbEmbed = new EmbedBuilder()
            .setTitle(leaderboardTitle)
            .setDescription(leaderboardDescription)
            .setColor(0xFABCA7)
            .setFooter({text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL()})
            .setTimestamp(Date.now())

            await interaction.reply({
                embeds: [lbEmbed]
            })

        }
        catch(err){
            console.error(err)
            interaction.channel.send("There has been an error! Please try using the command again")
        }
    },
};
