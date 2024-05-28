const { EmbedBuilder } = require('discord.js');
const {sessions} = require('../../session.json');

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
                sortSessionByScores(session)
                
                 let scorearr = Object.entries(session);
                 let scoarboardText = `3 questions weren't answered consequtively, the quiz session has ended! :sparkles:\n\n\n**Final Scoreboard**`;
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
                 scoarboardText += `\n\n:crown: <@${scorearr[0][0]}> has won! - ${scorearr[0][1].points} points`
                const sessionEndEmbed = new EmbedBuilder()
                      .setTitle('Quiz Session Ended!')
                      .setThumbnail('https://media.istockphoto.com/id/1224927571/vector/stop-red-road-sign-on-blue-background-stop-action-symbol.jpg?s=612x612&w=0&k=20&c=p8AGKV68LubdAM516Lmk4Ajy_zAz-B_2hZ66hP6e6D8=')
                      .setFooter({ text: `Use /quizstart to start again`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 1024 }) })
                      .setColor(0xFABCA7)
                      .setTimestamp(Date.now())
                      .setDescription(scoarboardText);
                  await interaction.reply({ embeds: [sessionEndEmbed]});
                delete sessions[interaction.guild.id];
            }
            else{
                interaction.reply("No quiz session running")
            }
        }
        catch(err){
            console.error(err)
            interaction.channel.send("There has been an error! Please try using the command again")
        }
    },
};
