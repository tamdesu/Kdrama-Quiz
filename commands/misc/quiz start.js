const Quiz = require('../../quiz/quizBuilder.js');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');

module.exports = {
    name: 'quiz',
    description: 'Generates a new quiz!',
    callback: async (client, interaction) => {
        async function sendQuiz(interaction) {
            let quiz = await Quiz(client);

            const buttons = quiz.options.map((option, index) => {
                const labels = ['A', 'B', 'C', 'D'];
                const emojis = ['💛', '💙', '🩷', '🤍'];
                return new ButtonBuilder()
                    .setLabel(option.toUpperCase())
                    .setEmoji(emojis[index])
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(labels[index]);
            });

            const row = new ActionRowBuilder().addComponents(buttons);
            const reply = await interaction.reply({ embeds: [quiz.ques], components: [row], fetchReply: true });

            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 30000,
            });

            collector.on('collect', async (i) => {
                if (i.customId === quiz.ans) {
                    await i.update({ content: `${i.user.tag} gave the right answer and earned 10 points! :sparkles:`, components: [] });
                    collector.stop(); // Stop the collector when a correct answer is given
                } else {
                    await i.reply({ content: 'Wrong answer!', ephemeral: true });
                }
            });

            collector.on('end', async () => {
                buttons.forEach(button => button.setDisabled(true));
                await reply.edit({ components: [row] });
                await sendQuiz(interaction); // Send a new quiz after the timer ends
            });
        }

        await sendQuiz(interaction);
    },
};
