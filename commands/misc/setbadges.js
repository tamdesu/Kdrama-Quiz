        const Inventory = require('../../models/Inventory.js');
        const { badges } = require('../../shop.json');
        const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

        module.exports = {
            name: 'setbadges',
            description: 'Set your badges',
            callback: async (client, interaction) => {
                const userId = interaction.user.id;

                // Fetch user inventory
                const inventory = await Inventory.findOne({ userId });
                if (!inventory) {
                    return interaction.reply({ content: "You haven't played any game yet! Please use /quizstart to start playing!", ephemeral: true });
                }

                const ownedBadges = inventory.badges;
                const currentBadges = inventory.currentBadges;

                const availableBadges = ownedBadges.map(badgeId => {
                    const badge = badges[badgeId];
                    return { label: badge.name, value: badge.id };
                });

                if (availableBadges.length === 0) {
                    return interaction.reply({ content: "You don't have any badges to set.", ephemeral: true });
                }

                // Send the initial interaction message with the current badges
                const embed = new EmbedBuilder()
                    .setTitle('Set Your Badges')
                    .setDescription(`Current Badges: ${currentBadges.map(id =>{
                        const guild = client.guilds.cache.get('1244352964609441852');
                        const emoji = guild.emojis.cache.find(e => e.name === badges[id].emoji);
                        return emoji;
                    }).join(', ')}`)
                    .setColor(0xFABCA7);

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('select_badge')
                    .setPlaceholder('Select a badge to set or swap')
                    .addOptions(availableBadges);

                const row = new ActionRowBuilder().addComponents(selectMenu);
                const buttonRow1 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('set1')
                            .setLabel('Set Position 1')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentBadges.length >= 1),
                        new ButtonBuilder()
                            .setCustomId('set2')
                            .setLabel('Set Position 2')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentBadges.length >= 2 || ownedBadges.length < 2),
                        new ButtonBuilder()
                            .setCustomId('set3')
                            .setLabel('Set Position 3')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentBadges.length >= 3 || ownedBadges.length < 3)
                    );

                const buttonRow2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('swap1')
                            .setLabel('Swap Position 1')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(currentBadges.length < 1),
                        new ButtonBuilder()
                            .setCustomId('swap2')
                            .setLabel('Swap Position 2')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(currentBadges.length < 2),
                        new ButtonBuilder()
                            .setCustomId('swap3')
                            .setLabel('Swap Position 3')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(currentBadges.length < 3),
                        new ButtonBuilder()
                            .setCustomId('remove')
                            .setLabel('Remove Selected')
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true) // Initially disabled, will enable once a badge is selected
                    );

                await interaction.reply({ embeds: [embed], components: [row, buttonRow1, buttonRow2], ephemeral: true });

                // Handle select menu and button interactions
                const filter = i => i.user.id === userId;
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

                let selectedBadge = null;

                collector.on('collect', async i => {
                    if (i.customId === 'select_badge') {
                        selectedBadge = i.values[0];
                        // Enable the remove button
                        const guild = client.guilds.cache.get('1244352964609441852');
                        const emoji = guild.emojis.cache.find(e => e.name === badges[selectedBadge].emoji)
                        buttonRow2.components[3].setDisabled(false);
                        await i.update({ content: `Selected badge: ${emoji}`, components: [row, buttonRow1, buttonRow2], ephemeral: true });
                    } else if (i.customId.startsWith('set')) {
                        const position = parseInt(i.customId.slice(-1), 10) - 1;
                        if (selectedBadge) {
                            if (position >= currentBadges.length) {
                                currentBadges.push(selectedBadge);
                            } else {
                                currentBadges[position] = selectedBadge;
                            }
                            inventory.currentBadges = currentBadges.slice(0, 3);
                            await inventory.save();
                            await i.reply({ content: `Set badge: ${badges[selectedBadge].name} to position ${position + 1}`, ephemeral: true });
                        } else {
                            await i.reply({ content: 'Please select a badge first.', ephemeral: true });
                        }
                    } else if (i.customId.startsWith('swap')) {
                        const position = parseInt(i.customId.slice(-1), 10) - 1;
                        if (selectedBadge) {
                            if (position < currentBadges.length) {
                                const targetBadge = currentBadges[position];
                                const selectedIndex = currentBadges.indexOf(selectedBadge);

                                if (selectedIndex !== -1) {
                                    // Swap the badges
                                    currentBadges[selectedIndex] = targetBadge;
                                }

                                currentBadges[position] = selectedBadge;
                            }
                            inventory.currentBadges = currentBadges.slice(0, 3);
                            await inventory.save();
                            await i.reply({ content: `Swapped badge: ${badges[selectedBadge].name} to position ${position + 1}`, ephemeral: true });
                        } else {
                            await i.reply({ content: 'Please select a badge first.', ephemeral: true });
                        }
                    } else if (i.customId === 'remove') {
                        if (selectedBadge && currentBadges.includes(selectedBadge)) {
                            inventory.currentBadges = currentBadges.filter(badge => badge !== selectedBadge);
                            await inventory.save();
                            await i.reply({ content: `Removed badge: ${badges[selectedBadge].name} from current badges`, ephemeral: true });
                        } else {
                            await i.reply({ content: 'Please select a badge first or ensure it is currently equipped.', ephemeral: true });
                        }
                    }

                    // Update the embed with current badges
                    embed.setDescription(`Current Badges: ${inventory.currentBadges.map(id => {
                            const guild = client.guilds.cache.get('1244352964609441852');
                            const emoji = guild.emojis.cache.find(e => e.name === badges[id].emoji);
                            return emoji;
                    }).join(', ')}`);

                    // Update button disabled states based on the number of current badges and available badges
                    buttonRow1.components[0].setDisabled(currentBadges.length >= 1);
                    buttonRow1.components[1].setDisabled(currentBadges.length >= 2 || ownedBadges.length < 2);
                    buttonRow1.components[2].setDisabled(currentBadges.length >= 3 || ownedBadges.length < 3);
                    buttonRow2.components[0].setDisabled(currentBadges.length < 1);
                    buttonRow2.components[1].setDisabled(currentBadges.length < 2);
                    buttonRow2.components[2].setDisabled(currentBadges.length < 3);

                    await interaction.editReply({ embeds: [embed], components: [row, buttonRow1, buttonRow2] });
                });

                collector.on('end', collected => {
                    if (collected.size === 0) {
                        interaction.editReply({ content: 'You did not make any selections in time.', components: [] });
                    }
                });
            }
        };
