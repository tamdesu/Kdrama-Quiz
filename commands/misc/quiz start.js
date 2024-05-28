const Quiz = require('../../quiz/quizBuilder.js');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'quiz',
    description: 'Generates a new quiz!',
    callback: async (client, interaction) => {
        //add a try catch block
        try{
            let answeredUsers = new Set();
            await interaction.reply("New Quiz Started!");

            async function sendQuiz(channel) {
                let quiz = await Quiz(client);
                let timeLeft = 20;
                let timer; // Variable to store the setTimeout reference

                const buttons = quiz.options.map((option, index) => {
                    const labels = ['A', 'B', 'C', 'D'];
                    const emojis = ['💛', '💙', '🩷', '🤍'];
                    return new ButtonBuilder()
                        .setLabel(option.toUpperCase())
                        .setEmoji(emojis[index])
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId(labels[index]);
                });

                let row = new ActionRowBuilder().addComponents(buttons);
                let embed = quiz.ques.setDescription(`**QUESTION: \n\n${quiz.question.toUpperCase()}**\n\n\n:timer: Time left: ${timeLeft}`);
                const reply = await channel.send({ embeds: [embed], components: [row] });

                const collector = reply.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 20000,
                });

                const updateTimer = async () => {
                    if (timeLeft > 0) {
                        timeLeft -= 5;
                        embed = quiz.ques.setDescription(`**QUESTION: \n\n${quiz.question.toUpperCase()}**\n\n\n:timer: Time left: ${timeLeft}`);
                        await reply.edit({ embeds: [embed] });
                        timer = setTimeout(updateTimer, 5000);
                    }
                };

                timer = setTimeout(updateTimer, 5000); // Start the timer

                collector.on('collect', async (i) => {
                    if (answeredUsers.has(i.user.id)) {
                        const elimEmbed = new EmbedBuilder()
                            .setTitle('Eliminated!')
                            .setThumbnail('https://cdn.discordapp.com/attachments/1244577886413914202/1244956677057282069/1244956231311953941remix-1716891204364.png')
                            .setFooter({ text: `${i.user.tag}`, iconURL: i.user.displayAvatarURL({ dynamic: true, size: 1024 }) })
                            .setColor(0xFABCA7)
                            .setTimestamp(Date.now())
                            .setDescription(`You have already been eliminated for this round! :x:`);
                        await i.reply({ embeds: [elimEmbed], ephemeral: true });
                        return;
                    }

                    if (i.customId === quiz.ans) {
                        buttons.forEach(button => {
                            if (button.data.custom_id === quiz.ans) {
                                button.setStyle(ButtonStyle.Success); // Turn the correct answer button green
                            }
                            button.setDisabled(true); // Disable all buttons
                        });
                        row = new ActionRowBuilder().addComponents(buttons);
                        await reply.edit({ components: [row] });

                        const pointEmbed = new EmbedBuilder()
                            .setTitle('Correct Answer!')
                            .setThumbnail('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWtd75dnnzvArXnmEIbSDuBUhq81Wp-AgcNg&s')
                            .setFooter({ text: `${i.user.tag}`, iconURL: i.user.displayAvatarURL({ dynamic: true, size: 1024 }) })
                            .setColor(0xFABCA7)
                            .setTimestamp(Date.now())
                            .setDescription(`<@${i.user.id}> gave the right answer and earned 10 points! :sparkles:`);

                        await i.reply({ embeds: [pointEmbed] });
                        collector.stop();
                        clearTimeout(timer); // Stop the timer
                        answeredUsers.clear();
                    } else {
                        const wrongEmbed = new EmbedBuilder()
                            .setTitle('Wrong Answer!')
                            .setThumbnail('https://cdn.discordapp.com/attachments/1244577886413914202/1244956677057282069/1244956231311953941remix-1716891204364.png')
                            .setFooter({ text: `${i.user.tag}`, iconURL: i.user.displayAvatarURL({ dynamic: true, size: 1024 }) })
                            .setColor(0xFABCA7)
                            .setTimestamp(Date.now())
                            .setDescription(`You gave the wrong answer and have been eliminated for this round! :x:`);
                        await i.reply({ embeds: [wrongEmbed], ephemeral: true });
                        answeredUsers.add(i.user.id);
                    }
                });

                collector.on('end', async () => {
                    buttons.forEach(button => button.setDisabled(true));
                    row = new ActionRowBuilder().addComponents(buttons);
                    await reply.edit({ components: [row] });
                    if(timeLeft <= 5){
                        const timesUpEmbed = new EmbedBuilder()
                            .setTitle('Times Up!')
                            .setThumbnail('https://www.kindpng.com/picc/m/256-2569648_transparent-respect-clipart-animated-alarm-clock-clipart-hd.png')
                            .setFooter({ text: `Goodluck next time!`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 1024 }) })
                            .setColor(0xFABCA7)
                            .setTimestamp(Date.now())
                            .setDescription(`The time is over for the previous question! :timer: No one gave any right answer!`);
                        await channel.send({ embeds: [timesUpEmbed]});
                    }
                    answeredUsers.clear();
                    await sendQuiz(channel); // Send a new quiz after the timer ends
                });
            }

            await sendQuiz(interaction.channel);
        }
        catch(err){
            interaction.channel.send("There has been an error! Please try using the command again")
        }
    },
};
