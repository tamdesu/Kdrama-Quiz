const Inventory = require('../../models/Inventory.js');
const { backgrounds } = require('../../shop.json');

module.exports = {
    name: 'setbackground',
    description: 'Set your background',
    callback: async (client, interaction) => {
        // Fetch user inventory
        const inventory = await Inventory.findOne({ userId: interaction.user.id });
        if (!inventory) {
            return interaction.reply({ content: "You haven't played any game yet! Please use /quizstart to start playing!", ephemeral: true });
        }

        // Fetch and format available background choices
        const availableBackgrounds = inventory.backgrounds.map(id => {

            // Correct the search within backgrounds object
            const bg = Object.values(backgrounds).find(background => background.id === id);

            // Handle case where background is not found
            if (!bg) {
                console.error(`Background with ID ${id} not found`);
                return null;
            }

            return { label: bg.name, value: String(bg.id) };
        }).filter(bg => bg !== null); // Filter out any null values

        if (availableBackgrounds.length === 0) {
            return interaction.reply({ content: "You don't have any backgrounds to set.", ephemeral: true });
        }

        if (availableBackgrounds.length === 0) {
            return interaction.reply({ content: "You don't have any backgrounds to set.", ephemeral: true });
        }

        // Send a message with a dropdown menu to choose a background
        const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_background')
            .setPlaceholder('Select a background')
            .addOptions(availableBackgrounds);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setTitle('Select Background')
            .setDescription('Choose a background from the dropdown menu below.')
            .setColor(0xFABCA7)
       const reply = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        // Handle the selection
        const filter = i => i.customId === 'select_background' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            const selectedBackgroundId = parseInt(i.values[0], 10);
            if (!inventory.backgrounds.includes(selectedBackgroundId)) {
                return i.reply({ content: "You don't own this background.", ephemeral: true });
            }

            inventory.currentBackgroundId = selectedBackgroundId;
            await inventory.save();

            const background = Object.values(backgrounds).find(bg => bg.id === selectedBackgroundId);
            await i.reply({ content: `Your background has been set to: ${background.name}`, files:[{ attachment: background.thumbnail, name: 'current_background.png' }],  ephemeral: true });
            reply.delete()
            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'You did not select any background in time.', components: [] });
            }
        });
    }
};
