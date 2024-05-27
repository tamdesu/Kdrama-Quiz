const Quiz = require('../../quiz/quizBuilder.js');
const {ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType} = require('discord.js');
module.exports = {
  name: 'quiz',
  description: 'Generates a new quiz!',

  callback: async (client, interaction) => {   
      const quiz = await Quiz(client);
      const buttonA = new ButtonBuilder().setLabel('A').setEmoji('💛').setStyle(ButtonStyle.Primary).setCustomId('option-a')
      const buttonB = new ButtonBuilder().setLabel('B').setEmoji('💙').setStyle(ButtonStyle.Primary).setCustomId('option-b')
      const buttonC = new ButtonBuilder().setLabel('C').setEmoji('💜').setStyle(ButtonStyle.Primary).setCustomId('option-c')
      const buttonD = new ButtonBuilder().setLabel('D').setEmoji('🤍').setStyle(ButtonStyle.Primary).setCustomId('option-d')
      const row = new ActionRowBuilder().addComponents(buttonA, buttonB, buttonC, buttonD)
      
      interaction.reply({embeds: [quiz.ques], components: [row]});
  },
};