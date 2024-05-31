module.exports = (client) => {
  console.log(`${client.user.tag} is online.`);
  client.user.setPresence({
      activities: [{ name: 'Kdrama Quizes~ <3' }],
      status: 'invisible',
  });
  
};