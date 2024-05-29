const Quiz = require('../../quiz/quizBuilder.js');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, EmbedBuilder } = require('discord.js');
const {sessions} = require('../../session.json');
var {questions} = require('../../questions.json');
const Level = require('../../models/Level.js');
const Player = require('../../models/Player.js');

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = {
    name: "quizstart",
    aliases: ['quiz start'],
    description: 'Starts a new quiz session!',
    callback: async (client, interaction) => {
        
        
        try{
            shuffleArray(questions)
            
            let ignoredCount = 0;
            let answeredUsers = new Set();

            if(!sessions[interaction.guild.id]){
                sessions[interaction.guild.id] = {
                    channel: interaction.channel.id,
                    qIndex: 0,
                    session: {},
                    levelUps: []
                };
            }
            else{
                    await interaction.reply("There is already a quiz session in this channel!" + `<#${sessions[interaction.guild.id].channel}>`);
                    return;
                
            }
            
            
            
            const sortSessionByScores = (session) => {
                let sessionArray = Object.entries(session);
                sessionArray.sort((a, b) => b[1].points - a[1].points);
                let sortedSession = Object.fromEntries(sessionArray);

                return sortedSession;
            }
            if (!sessions[interaction.guild.id].session[interaction.user.id]) {
                    sessions[interaction.guild.id].session[interaction.user.id] = {
                    userId: interaction.user.id,
                    username: interaction.user.username,
                    points: 0,
                    newExp: 0,
                    isInitiator: true
                };
            }
            await interaction.reply("New Quiz Started!");
            
            let quiz = await Quiz(client, questions ,sessions[interaction.guild.id].qIndex);
            async function sendQuiz(channel) {
                quiz = await Quiz(client, questions ,sessions[interaction.guild.id].qIndex);
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
//qIndex++
                timer = setTimeout(updateTimer, 5000); // Start the timer

                collector.on('collect', async (i) => {
                    if(sessions[i.guild.id]){
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

                    if (!sessions[i.guild.id].session[i.user.id]) {
                            sessions[i.guild.id].session[i.user.id] = {
                            userId: i.user.id,
                            username: i.user.username,
                            points: 0,
                            newExp: 0,
                            isInitiator: false
                        };
                    }
                    
                    if (i.customId === quiz.ans) {
                        sessions[i.guild.id].qIndex++;
                        buttons.forEach(button => {
                            if (button.data.custom_id === quiz.ans) {
                                button.setStyle(ButtonStyle.Success); // Turn the correct answer button green
                            }
                            button.setDisabled(true); // Disable all buttons
                        });
                        row = new ActionRowBuilder().addComponents(buttons);
                        await reply.edit({ components: [row] });
                        
                        sessions[interaction.guild.id].session[i.user.id].points += 10
                        let addExp = Math.floor((timeLeft / 10)  * 23.4);
                        sessions[interaction.guild.id].session[i.user.id].newExp += addExp;

                        
                        
                        
                        let scorearr = Object.entries(sortSessionByScores(sessions[interaction.guild.id].session));
                        let scoarboardText = `<@${i.user.id}> gave the right answer and earned 10 points (+${addExp} Exp)! :sparkles:\n\n\n**Current Scoreboard**`;
                        for (let i = 0; i < scorearr.length; i++){
                            if(i == 0){
                                scoarboardText += `\n\n:first_place: <@${scorearr[i][0]}> - ${scorearr[i][1].points} points`;
                            }
                            else if(i == 1){
                                scoarboardText += `\n\n:second_place: <@${scorearr[i][0]}> - ${scorearr[i][1].points} points`;
                            }
                            else if(i == 2){
                                scoarboardText += `\n\n:third_place: <@${scorearr[i][0]}> - ${scorearr[i][1].points} points`;
                            }
                            else{
                                scoarboardText += `\n\n${i+1}. <@${scorearr[i][0]}> - ${scorearr[i][1].points} points`;
                            }
                        }
                        const pointEmbed = new EmbedBuilder()
                            .setTitle('Correct Answer!')
                            .setThumbnail('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWtd75dnnzvArXnmEIbSDuBUhq81Wp-AgcNg&s')
                            .setFooter({ text: `${i.user.tag}`, iconURL: i.user.displayAvatarURL({ dynamic: true, size: 1024 }) })
                            .setColor(0xFABCA7)
                            .setTimestamp(Date.now())
                            .setDescription(scoarboardText);

                        await i.reply({ embeds: [pointEmbed] });
                        collector.stop();
                        clearTimeout(timer); // Stop the timer
                        answeredUsers.clear();
                        ignoredCount = 0;
                        
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
                        ignoredCount = 0;
                    }
                }
                else{
                    i.reply("This game has already ended")
                }
                });

                collector.on('end', async () => {
                    
                    buttons.forEach(button => button.setDisabled(true));
                    row = new ActionRowBuilder().addComponents(buttons);
                    await reply.edit({ components: [row] });
                    if(sessions[interaction.guild.id]){
                     if(ignoredCount == 2){
                         if(timeLeft <= 5){
                             
                             
                             
                             let scorearr = Object.entries(sortSessionByScores(sessions[interaction.guild.id].session));
                             let scoarboardText = `3 questions weren't answered consequtively, the quiz session has ended! :sparkles:\n\n\n**Final Scoreboard**`;
                             for (let i = 0; i < scorearr.length; i++){
                                 const query = {
                                     userId:  scorearr[i][1].userId,
                                     guildId: interaction.guild.id
                                 }
                                  const playerQuery = {
                                      userId: scorearr[i][1].userId
                                  }
                                  const player = await Player.findOne(playerQuery);
                                 const level = await Level.findOne(query);
                                 if(player){
                                    player.exp += scorearr[i][1].newExp;
                                    player.totalExp += scorearr[i][1].newExp
                                    player.score += scorearr[i][1].points;
                                    if(player.exp >= player.targetExp){
                                        player.level++;
                                        player.exp = player.exp - player.targetExp;
                                        player.targetExp += Math.min(player.level * 200, 3000)
                                        const sessionEndEmbed = new EmbedBuilder()
                                              .setTitle('Leveled Up! (Globally)')
                                              .setThumbnail('https://png.pngtree.com/png-vector/20210225/ourmid/pngtree-game-level-up-with-star-design-png-image_2953821.jpg')
                                              .setFooter({ text: `Congratulations!`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 1024 }) })
                                              .setColor(0xFABCA7)
                                              .setTimestamp(Date.now())
                                              .setDescription(`<@${scorearr[i][1].userId}> has leveled up to level ${player.level}! :tada:`);
                                        sessions[interaction.guild.id].levelUps.push(sessionEndEmbed);
                                          
                                    }
                                    await player.save().catch(err => console.log(err));
                                 }
                                 else{
                                     const newPlayer = new Player({
                                         userId: scorearr[i][1].userId,
                                         exp: scorearr[i][1].newExp,
                                         totalExp: scorearr[i][1].newExp,
                                         score: scorearr[i][1].points
                                     })
                                     await newPlayer.save().catch(err => console.log(err));
                                 }
                                 if(level){
                                     level.exp += scorearr[i][1].newExp;
                                     level.totalExp += scorearr[i][1].newExp
                                     level.score += scorearr[i][1].points;
                                     if(level.exp >= level.targetExp){
                                         level.level++;
                                         level.exp = level.exp - level.targetExp;
                                         level.targetExp += Math.min(level.level * 200, 3000);
                                         const sessionEndEmbed = new EmbedBuilder()
                                               .setTitle(`Leveled Up! (In ${interaction.guild.name})`)
                                               .setThumbnail('https://png.pngtree.com/png-vector/20210225/ourmid/pngtree-game-level-up-with-star-design-png-image_2953821.jpg')
                                               .setFooter({ text: `Congratulations!`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 1024 }) })
                                               .setColor(0xFABCA7)
                                               .setTimestamp(Date.now())
                                               .setDescription(`<@${scorearr[i][1].userId}> has leveled up to level ${level.level}! :tada:`);
                                         sessions[interaction.guild.id].levelUps.push(sessionEndEmbed);
                                     }
                                     await level.save().catch(err => console.log(err));
                                 }
                                 else{
                                      const newLevel = new Level({
                                           userId: scorearr[i][1].userId,
                                          guildId: interaction.guild.id,
                                          exp: scorearr[i][1].newExp,
                                          totalExp: scorearr[i][1].newExp,
                                          score: scorearr[i][1].points
                                      })
                                      await newLevel.save().catch(err => console.log(err));
                                  }

                                 
                                 
                                 if(i == 0){
                                     scoarboardText += `\n\n:first_place: <@${scorearr[i][0]}> - ${scorearr[i][1].points} points`;
                                 }
                                 else if(i == 1){
                                     scoarboardText += `\n\n:second_place: <@${scorearr[i][0]}> - ${scorearr[i][1].points} points`;
                                 }
                                 else if(i == 2){
                                     scoarboardText += `\n\n:third_place: <@${scorearr[i][0]}> - ${scorearr[i][1].points} points`;
                                 }
                                 else{
                                     scoarboardText += `\n\n${i+1}. <@${scorearr[i][0]}> - ${scorearr[i][1].points} points`;
                                 }
                             }
                             scoarboardText += `\n\n:crown: <@${scorearr[0][0]}> has won! - ${scorearr[0][1].points} points`
                              const sessionEndEmbed = new EmbedBuilder()
                                  .setTitle('Quiz Session Ended!')
                                  .setThumbnail('https://media.istockphoto.com/id/1224927571/vector/stop-red-road-sign-on-blue-background-stop-action-symbol.jpg?s=612x612&w=0&k=20&c=p8AGKV68LubdAM516Lmk4Ajy_zAz-B_2hZ66hP6e6D8=')
                                  .setFooter({ text: `Use /quizstart to start again`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 1024 }) })
                                  .setColor(0xFABCA7)
                                  .setTimestamp(Date.now())
                                  .setDescription(scoarboardText);
                              await channel.send({ embeds: [sessionEndEmbed]});
                              sessions[interaction.guild.id].levelUps.forEach(emb => channel.send({ embeds: [emb] }))
                              delete sessions[interaction.guild.id];
                          }
                     }
                     else{
                         if(timeLeft <= 5){
                             const timesUpEmbed = new EmbedBuilder()
                                 .setTitle('Times Up!')
                                 .setThumbnail('https://www.kindpng.com/picc/m/256-2569648_transparent-respect-clipart-animated-alarm-clock-clipart-hd.png')
                                 .setFooter({ text: `Goodluck next time!`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 1024 }) })
                                 .setColor(0xFABCA7)
                                 .setTimestamp(Date.now())
                                 .setDescription(`The time is over for the previous question! :timer: No one gave any right answer!`);
                             if(answeredUsers.size == 0){
                                 ignoredCount++;
                             }
                             sessions[interaction.guild.id].qIndex++;
                             await channel.send({ embeds: [timesUpEmbed]});
                         }
                         answeredUsers.clear();
                         
                             await sendQuiz(interaction.channel);
                         }
                     }
                });
            }
            if(sessions[interaction.guild.id]){
                await sendQuiz(interaction.channel);
            }
            
        }
        catch(err){
            console.error(err)
            interaction.channel.send("There has been an error! Please try using the command again")
        }
    },
};
