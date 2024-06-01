const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Inventory = require('../../models/Inventory.js');
const Player = require('../../models/Player.js');
const { badges, backgrounds } = require('../../shop.json');
const path = require('path');
const fs = require('fs').promises;

module.exports = {
    name: 'shop',
    description: 'Buy badges and backgrounds!',
    options: [
        {
            type: 1, // 1 is for a subcommand
            name: 'badges',
            description: 'Buy badges',
        },
        {
            type: 1, // 1 is for a subcommand
            name: 'backgrounds',
            description: 'Buy backgrounds',
        }
    ],

    callback: async (client, interaction) => {
        try {
            const player = await Player.findOne({ userId: interaction.user.id });
            const inventory = await Inventory.findOne({ userId: interaction.user.id });

            if (!player || !inventory) {
                return interaction.reply({ content: "You haven't played any game yet! Please use /quizstart to start playing!", ephemeral: true });
            }

            const subcommand = interaction.options.getSubcommand();
            const shop = subcommand === 'badges' ? badges : backgrounds;
            const imagePath = subcommand === 'badges' ? path.join(__dirname, '../../imageBuilder/assets') : path.join(__dirname, '../../imageBuilder/backgrounds');
            const currentProducts = subcommand === 'badges' ? inventory.badges : inventory.backgrounds;

            const getImage = async (filename) => {
                try {
                    const data = await fs.readFile(path.join(imagePath, filename));
                    return data;
                } catch (err) {
                    console.error('Error reading the image file:', err);
                    return null;
                }
            };

            let pageNo = 0;
            const shopArr = Object.entries(shop);

            const updateShopPage = () => {
                const item = shopArr[pageNo][1];
                return `Name: ${item.name}\n\nPrice: ${item.price}\n\nRequired Level: ${item.requiredLevel}\n\nYour balance: ${inventory.coins}\n `;
            };

            const shopEmbed = new EmbedBuilder()
                .setTitle('Shop')
                .setColor(0xFABCA7)
                .setDescription(updateShopPage())
                .setTimestamp(Date.now())
                .setFooter({ text: `Page ${pageNo + 1}`, iconURL: interaction.user.displayAvatarURL() });

            const updateButtons = () => {
                const item = shopArr[pageNo][1];

                const buyButton = new ButtonBuilder()
                    .setCustomId('buy')
                    .setLabel(`Buy (${item.price})`)
                    .setEmoji('🪙')
                    .setStyle(ButtonStyle.Success);

                if (currentProducts.includes(item.id) || player.level < item.requiredLevel || inventory.coins < item.price) {
                    buyButton.setDisabled(true);
                }

                const nextButton = new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary);

                return new ActionRowBuilder().addComponents(buyButton, nextButton);
            };

            let shopButtons = updateButtons();
            const imageBuffer = await getImage(shopArr[pageNo][1].thumbnail);
            if (subcommand === 'badges') {
                shopEmbed.setThumbnail('attachment://thumb.png');
            } else {
                shopEmbed.setImage('attachment://thumb.png');
            }

            const reply = await interaction.reply({
                embeds: [shopEmbed],
                components: [shopButtons],
                files: [{ attachment: imageBuffer, name: 'thumb.png' }],
                ephemeral: true
            });

            const filter = i => i.user.id === interaction.user.id;
            const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, filter, time: 90000 });

            collector.on('collect', async i => {
                if (i.customId === 'buy') {
                    const item = shopArr[pageNo][1];
                    currentProducts.push(item.id); // Update the user's inventory with the new purchase
                    inventory.coins -= item.price; // Deduct the cost from the user's balance
                    await inventory.save();

                    // Update the buttons after purchase
                    shopButtons = updateButtons();
                    shopEmbed.setDescription(updateShopPage());
                    const newImageBuffer = await getImage(shopArr[pageNo][1].thumbnail);
                    await reply.edit({
                        embeds: [shopEmbed],
                        components: [shopButtons],
                        files: [{ attachment: newImageBuffer, name: 'thumb.png' }],
                        ephemeral: true
                    });

                    await i.reply({ content: `You have successfully bought ${item.name} for ${item.price}`, ephemeral: true });
                } else if (i.customId === 'next') {
                    pageNo++;
                    if (pageNo >= shopArr.length) {
                        pageNo = 0;
                    }

                    shopEmbed.setDescription(updateShopPage());
                    if (subcommand === 'badges') {
                        shopEmbed.setThumbnail('attachment://thumb.png');
                    } else {
                        shopEmbed.setImage('attachment://thumb.png');
                    }
                    shopEmbed.setFooter({ text: `Page ${pageNo + 1}`, iconURL: interaction.user.displayAvatarURL() });

                    shopButtons = updateButtons();
                    const newImageBuffer = await getImage(shopArr[pageNo][1].thumbnail);
                    await i.update({
                        embeds: [shopEmbed],
                        components: [shopButtons],
                        files: [{ attachment: newImageBuffer, name: 'thumb.png' }],
                        ephemeral: true
                    });
                }
            });

            collector.on('end', async () => {
                const finalButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder(shopButtons.components[0])
                        .setDisabled(true)
                        .setLabel('Buy (' + shopArr[pageNo][1].price + ')')
                        .setEmoji('🪙')
                        .setStyle(ButtonStyle.Success)
                        .setCustomId('disabled-buy'),
                    new ButtonBuilder(shopButtons.components[1])
                        .setDisabled(true)
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId('disabled-next')
                );
                const finalImageBuffer = await getImage(shopArr[pageNo][1].thumbnail);
                await reply.edit({
                    embeds: [shopEmbed],
                    components: [finalButtons],
                    files: [{ attachment: finalImageBuffer, name: 'thumb.png' }],
                    ephemeral: true
                });
            });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: "There has been an error! Please try using the command again", ephemeral: true });
        }
    },
};
