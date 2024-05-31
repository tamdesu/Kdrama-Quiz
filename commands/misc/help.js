const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');

const path = require('path');
module.exports = {
    name: "help",
    aliases: ['help'],
    description: 'Shows the command list and their explanaton',
    callback: async (client, interaction) => {

        try{
            const pages = [
                [
                    {name: "/quizstart", value: "Starts a quiz game!"},
                    {name: "/endquiz", value: "Ends the ongoing quiz game!"},
                    {name: "/guildprofile", value: "Shows your profile card to display your progress in this server"},
                    {name: "/globalfile", value: "Shows your profile card to display your progress globally"}
                ],
                [
                    {name: "/wallet", value: "Shows your wallet"},
                    {name: "/shop badges", value: "You can buy badges from here to make your profile card more attractive"},
                    {name: "/shop backgrounds", value: "You can buy backgrounds from here for your profile card and start vibin!"}
                    
                ],
                [
                    {name: "/setbadges", value: "Use it to select the badges you want to show on your profile card. At first select the badge you want to set or swap. Use swap buttons to swap between two badges. Use set buttons to set a badge to an empty slot"},
                    {name: "/setbackground", value: "Use it to select backgrounds you want to show on your profile card"}
                ]
            ]
            let currentPage = 0;
            const helpEmbed = new EmbedBuilder()
            .setTitle("Command List")
            .setDescription("Here is the list of commands that you can use!")
            .setColor(0xFABCA7)
            .addFields(
                pages[currentPage % 3]
            )
            .setFooter({text: `Page ${(currentPage + 1)%3} of ${pages.length}`, iconURL: client.user.displayAvatarURL()})
            .setTimestamp(Date.now())
            const prevButton = new ButtonBuilder()
                .setCustomId('prev-btn')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
            const nextButton = new ButtonBuilder()
                .setCustomId('next-btn')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)

            const row = new ActionRowBuilder()
                .addComponents(prevButton, nextButton)

            const reply = await interaction.reply({
                embeds: [helpEmbed],
                components: [row]
            })
            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 120000
            })

            collector.on('collect', async (i)=>{
                if(i.customId === 'prev-btn'){
                    currentPage--;
                     var displayPageNo = (currentPage + 1)%3 == 0 ? 3 : (currentPage + 1)%3
                    helpEmbed.setFields(pages[currentPage % 3])
                    helpEmbed.setFooter({text: `Page ${displayPageNo} of ${pages.length}`, iconURL: client.user.displayAvatarURL()})
                    await reply.edit({
                        embeds: [helpEmbed],
                        components: [row]
                    })
                    i.reply({content: "Previous page", ephemeral: true})
                }
                else if(i.customId === 'next-btn'){
                    currentPage++;
                    helpEmbed.setFields(pages[currentPage % 3])
                    var displayPageNo = (currentPage + 1)%3 == 0 ? 3 : (currentPage + 1)%3
                    helpEmbed.setFooter({text: `Page ${displayPageNo} of ${pages.length}`, iconURL: client.user.displayAvatarURL()})
                    await reply.edit({
                        embeds: [helpEmbed],
                        components: [row]
                    })
                    i.reply({content: "Next page", ephemeral: true})
                }
            })
            collector.on('end', async () =>{
                prevButton.setDisabled(true)
                nextButton.setDisabled(true)
                newRow = new ActionRowBuilder()
                    .addComponents(prevButton, nextButton)
                helpEmbed.setDescription('Command List (Timeout)')
                await reply.edit({
                    embed: [helpEmbed],
                    components: [newRow]
                })
            })

        }
        catch(err){
            console.error(err)
            interaction.channel.send("There has been an error! Please try using the command again")
        }
    },
};
