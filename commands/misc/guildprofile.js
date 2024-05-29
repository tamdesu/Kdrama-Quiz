const { EmbedBuilder } = require('discord.js');
const Level = require('../../models/Level.js');
const { generateProfileCard } = require('../../imageBuilder/profileCard.js');

module.exports = {
    name: "guildprofile",
    aliases: ['guild profile'],
    description: 'Shows your profile card for this server',
    callback: async (client, interaction) => {
        try {
            const query = {
                userId: interaction.user.id,
                guildId: interaction.guild.id
            }
            const player = await Level.findOne(query);
            if (player){
                await interaction.deferReply();

                const av = interaction.user.displayAvatarURL({ format: 'png', size: 4096 });
                const avArr = av.split('.');
                const ext = ".png?size=4096";
                const avUrl = `${avArr[0]}.${avArr[1]}.${avArr[2]}${ext}`;

                try {
                    const profileCardBuffer = await generateProfileCard({
                        username: interaction.user.tag,
                        displayName: interaction.user.globalName,
                        exp: player.exp,
                        totalExp: player.totalExp,
                        targetExp: player.targetExp,
                        avatarUrl: avUrl,
                        level: player.level
                    });

                    await interaction.editReply({
                        files: [{
                            attachment: profileCardBuffer,
                            name: 'profile-card.png'
                        }]
                    });
                } catch (error) {
                    console.error('Error generating profile card:', error);
                    await interaction.editReply('Failed to generate profile card.');
                }
            }
            else{
                await interaction.reply('You have not started the game yet. Type `/quizstart` to begin.');
            }
        } catch (err) {
            console.error(err);
            interaction.reply({ content: 'There has been an error! Please try using the command again.', ephemeral: true });
        }
    },
};
