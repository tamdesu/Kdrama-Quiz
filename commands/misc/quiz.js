const Quiz = require('../../quiz/quizBuilder.js');
const {ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType} = require('discord.js');
module.exports = {
  name: 'quiz',
  description: 'Generates a new quiz!',

  callback: async (client, interaction) => {   
      const quiz = await Quiz(client);
      const buttonA = new ButtonBuilder().setLabel(quiz.options[0].toUpperCase()).setEmoji('💛').setStyle(ButtonStyle.Primary).setCustomId('option-a')
      const buttonB = new ButtonBuilder().setLabel(quiz.options[1].toUpperCase()).setEmoji('💙').setStyle(ButtonStyle.Primary).setCustomId('option-b')
      const buttonC = new ButtonBuilder().setLabel(quiz.options[2].toUpperCase()).setEmoji('🩷').setStyle(ButtonStyle.Primary).setCustomId('option-c')
      const buttonD = new ButtonBuilder().setLabel(quiz.options[3].toUpperCase()).setEmoji('🤍').setStyle(ButtonStyle.Primary).setCustomId('option-d')
      const row = new ActionRowBuilder().addComponents(buttonA, buttonB, buttonC, buttonD)
      
      interaction.reply({embeds: [quiz.ques], components: [row]});
  },
};