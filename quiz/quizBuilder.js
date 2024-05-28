const {EmbedBuilder} = require('discord.js');


const Quiz = async (client,questions, qIndex) =>{
  const q = questions[qIndex % questions.length]
  const embed = new EmbedBuilder();
  embed.setTitle('KDrama Quiz')
  .setDescription(`**QUESTION: \n\n${q.question.toUpperCase()}**\n\n\nquestion author: ${q.author}`)
  .setThumbnail("https://png.pngtree.com/element_our/20190529/ourlarge/pngtree-tricolor-minimalist-style-question-mark-image_1195548.jpg")
  .setFooter({ text: `question author: ${q.author}`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 1024 })})
  .setColor(0xFABCA7)
  .setTimestamp(Date.now())
  if(q.attachments.length > 0){
    embed.setImage(q.attachments[0]);
  }
  const ob = {
    ques: embed,
    question: q.question,
    options: q.options,
    ans: q.answer.toUpperCase()  
  }
  return ob;
}

module.exports = Quiz;