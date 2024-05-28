const {EmbedBuilder} = require('discord.js');
var {questions} = require('../questions.json');
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
questions = shuffleArray(questions);
let qIndex = 0;


const Quiz = async (client) =>{
  const q = questions[qIndex % questions.length]
  const embed = new EmbedBuilder();
  embed.setTitle('KDrama Quiz')
  .setDescription(`**QUESTION: \n\n${q.question.toUpperCase()}**`)
  .setThumbnail("https://png.pngtree.com/element_our/20190529/ourlarge/pngtree-tricolor-minimalist-style-question-mark-image_1195548.jpg")
  .setFooter({ text: `question author: ${q.author}`, iconURL: client.user.displayAvatarURL({ dynamic: true, size: 1024 })})
  .setColor(0xFABCA7)
  .setTimestamp(Date.now())
  if(q.attachments.length > 0){
    embed.setImage(q.attachments[0]);
  }
  const ob = {
    ques: embed,
    options: q.options,
    ans: q.answer.toUpperCase()  
  }
  qIndex++;
  return ob;
}

module.exports = Quiz;