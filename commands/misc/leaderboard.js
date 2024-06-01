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
                if(leaderboard.length === 0) return interaction.reply({content: "No one has played yet in this server", ephemeral: true})
                leaderboardTitle = `Leaderboard for ${interaction.guild.name}`
            }
            else if(interaction.options.getSubcommand() === 'global'){
                leaderboard = await Player.find().sort({totalExp: -1}).limit(10)
                if(leaderboard.length === 0) return interaction.reply({content: "Seems like the bot hasn't been used by anyone", ephemeral: true})
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
        .setThumbnail("https://cdn.discordapp.com/attachments/1245015570848677938/1246318083317170248/leaderboard-flat-icon-design-illustration-sports-and-games-symbol-on-white-background-eps-10-file-vector.png?ex=665bf3aa&is=665aa22a&hm=f07a7de86480f408bfdadc8d8f1221cb408d4b6442d9d5dc74646f6cc0acd0d5&")
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
