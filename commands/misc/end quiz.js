const { EmbedBuilder } = require('discord.js');
const {sessions} = require('../../session.json');
const Level = require('../../models/Level.js');
const Player = require('../../models/Player.js');

module.exports = {
    name: "endquiz",
    aliases: ['quiz end'],
    description: 'Ends a running quiz session!',
    callback: async (client, interaction) => {


        try{
            const sortSessionByScores = (session) => {
                let sessionArray = Object.entries(session);
                sessionArray.sort((a, b) => b[1].points - a[1].points);
                let sortedSession = Object.fromEntries(sessionArray);

                return sortedSession;
            }
            
            if(sessions[interaction.guild.id]){
                let session = sessions[interaction.guild.id].session
                
                if(session[interaction.user.id] && session[interaction.user.id].isInitiator){
                
                
                 let scorearr = Object.entries(sortSessionByScores(session));
                 let scoarboardText = `This wonderful quiz session has been put to an end! :sparkles:\n\n\n**Final Scoreboard**`;
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
                  await interaction.reply({ embeds: [sessionEndEmbed]});
                 sessions[interaction.guild.id].levelUps.forEach(emb => interaction.channel.send({ embeds: [emb] }))
                delete sessions[interaction.guild.id];
                }
                else{
                    await interaction.reply({ content: `You are not the initiator of this quiz session! :x: Please ask the player who used the /quizstart command to stop this game or don't respond to the next 3 questions.`, ephemeral: true });
                }
            }
            else{
                await interaction.reply("No quiz session running")
            }
        }
        catch(err){
            console.error(err)
            interaction.channel.send("There has been an error! Please try using the command again")
        }
    },
};
