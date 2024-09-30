import { Emoji, Events, GuildEmoji, type Interaction } from 'discord.js';
import type { DiscordUser } from '../types';
import { MyEmojis } from '../types/emojis';
import db from '../utils/database';

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.isModalSubmit()) return;
    if (!interaction.guild) return;
    if (!interaction.customId.startsWith('add-nickname-')) return;
    await interaction.deferReply({ ephemeral: true });

    const name = interaction.fields.getTextInputValue('add-nick-t');
    try {
      const data = await (await db())
        .collection<DiscordUser>('discord-users')
        .findOneAndUpdate(
          { userId: interaction.user.id },
          {
            $set: {
              username: interaction.user.username,

              InGameUsername: name,
              InGameScore: 0,
              InGameRank: 'Ferro1',
              isActive: false,

              GamesPlayed: 0,
              GamesWon: 0,
              GamesLost: 0,
              GamesDraw: 0,

              updatedAt: new Date(),
            },
          },
          { upsert: true, returnDocument: 'after' },
        );

      await interaction.editReply({
        content: `${MyEmojis.Tick} Seu perfil foi registrado com sucesso! \nApelido: ${name}`,
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content:
          'Ocorreu um erro ao registrar seu apelido. Por favor, tente novamente.',
      });
    }
    return;
  },
};
