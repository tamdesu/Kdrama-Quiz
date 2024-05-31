const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Inventory = require('../../models/Inventory.js');
const Player = require('../../models/Player.js');
const { badges, backgrounds } = require('../../shop.json');

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
            var shop;
            var currentProducts;
            const player = await Player.findOne({
                userId: interaction.user.id
            });
            const inventory = await Inventory.findOne({
                userId: interaction.user.id
            });

            if (player && inventory) {
                const subcommand = interaction.options.getSubcommand();
                if (subcommand === 'badges') {
                    shop = badges;
                    currentProducts = inventory.badges;
                } else if (subcommand === 'backgrounds') {
                    shop = backgrounds;
                    currentProducts = inventory.backgrounds;
                }

                var pageNo = 0;
                const shopArr = Object.entries(shop);

                const updateShopPage = () => {
                    const item = shopArr[pageNo][1];
                    return `Name: ${item.name}\n\nPrice: ${item.price}\n\nRequired Level: ${item.requiredLevel}\n\nYour balance: ${inventory.coins}\n `;
                };

                // Shop embed
                const shopEmbed = new EmbedBuilder()
                    .setTitle('Shop')
                    .setColor('Random')
                    .setDescription(updateShopPage())
                    .setTimestamp(Date.now())
                    .setThumbnail(shopArr[pageNo][1].thumbnail)
                    .setFooter({ text: `Page ${pageNo + 1}`, iconURL: interaction.user.displayAvatarURL() });

                // Shop buttons
                const updateButtons = () => {
                    const item = shopArr[pageNo][1];
                    const emoji = interaction.guild.emojis.cache.find(e => e.name === item.emoji);
                    const buyButton = new ButtonBuilder()
                        .setCustomId('buy')
                        .setLabel(`Buy (${item.price} 🪙)`)
                        .setEmoji(emoji)
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

                const shopButtons = updateButtons();
                const reply = await interaction.reply({ embeds: [shopEmbed], components: [shopButtons], fetchReply: true });

                const filter = i => i.user.id === interaction.user.id;
                const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, filter, time: 360000 });

                collector.on('collect', async i => {
                    if (i.customId === 'buy') {
                        await i.reply({ content: `You have successfully bought ${shopArr[pageNo][1].name} for ${shopArr[pageNo][1].price}`, ephemeral: true });
                    } else if (i.customId === 'next') {
                        pageNo++;
                        if (pageNo >= shopArr.length) {
                            pageNo = 0;
                        }

                        shopEmbed.setDescription(updateShopPage())
                            .setFooter({ text: `Page ${pageNo + 1}`, iconURL: interaction.user.displayAvatarURL() });

                        const newShopButtons = updateButtons();
                        await i.update({ embeds: [shopEmbed], components: [newShopButtons] });
                    }
                });

                collector.on('end', async () => {
                    const finalButtons = new ActionRowBuilder().addComponents(
                        new ButtonBuilder(shopButtons.components[0]).setDisabled(true),
                        new ButtonBuilder(shopButtons.components[1]).setDisabled(true)
                    );
                    await reply.edit({ embeds: [shopEmbed], components: [finalButtons] });
                });
            } else {
                await interaction.reply({ content: "You haven't played any game yet! Please use /quizstart to start playing!", ephemeral: true });
            }
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: "There has been an error! Please try using the command again", ephemeral: true });
        }
    },
};
