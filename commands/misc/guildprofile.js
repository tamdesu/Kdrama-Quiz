const { EmbedBuilder, ApplicationCommandOptionType} = require('discord.js');
const Level = require('../../models/Level.js');
const Inventory = require('../../models/Inventory.js');
const { generateProfileCard } = require('../../imageBuilder/profileCard.js');

module.exports = {
    name: "guildprofile",
    aliases: ['guild profile'],
    description: "Shows user's profile card for this server",
    options: [
        {
            name: 'user',
            description: 'The user to show the profile for (optional)',
            type: ApplicationCommandOptionType.Mentionable,
            required: false
        }
    ],
    callback: async (client, interaction) => {
        try {
            const user = interaction.options.getUser('user') || interaction.user;
            
            const query = {
                userId: user.id,
                guildId: interaction.guild.id
            }
            const inventoryQuery = {
                userId: user.id
            }
            const inventory = await Inventory.findOne(inventoryQuery);
            const player = await Level.findOne(query);
            if (player && inventory){
                await interaction.deferReply();

                const av = user.displayAvatarURL({ format: 'png', size: 4096 });
                const avArr = av.split('.');
                const ext = ".png?size=4096";
                const avUrl = `${avArr[0]}.${avArr[1]}.${avArr[2]}${ext}`;

                try {
                    const profileCardBuffer = await generateProfileCard({
                        username: user.tag,
                        displayName: user.globalName,
                        exp: player.exp,
                        totalExp: player.totalExp,
                        targetExp: player.targetExp,
                        guildName: interaction.guild.name,
                        avatarUrl: avUrl,
                        level: player.level,
                        userBadges: inventory.currentBadges
                    });
                    
                    const cardEmbed = new EmbedBuilder()
                    //const attachment = new Attachment(profileCardBuffer, 'profile_card.png');
                    cardEmbed.setTitle(`${user.globalName}'s Server Profile`)
                    .setDescription('\n')
                    .setImage("attachment://profile_card.png")
                    .setColor(0xFABCA7)
                    .setTimestamp(Date.now())
                    .setFooter({ text: `Requested by ${interaction.user.globalName}`, iconURL: interaction.user.displayAvatarURL({ format: 'png', size: 4096 }) })
                    await interaction.editReply({
                        embeds: [cardEmbed], files: [{ attachment: profileCardBuffer, name: 'profile_card.png' }]
                    });
                } catch (error) {
                    console.error('Error generating profile card:', error);
                    await interaction.editReply('Failed to generate profile card.');
                }
            }
            else{
                if(user.id === interaction.user.id){
                    await interaction.reply("You aren't registered in the game yet. Use `/quizstart` to begin.");
                }
                else{
                    await interaction.reply("The user you mentioned isn't registered in the game yet.");
                }
            }
        } catch (err) {
            console.error(err);
            interaction.reply({ content: 'There has been an error! Please try using the command again.', ephemeral: true });
        }
    },
};
