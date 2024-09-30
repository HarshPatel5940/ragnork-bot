import {
  ActionRowBuilder,
  Events,
  type Interaction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import type { MatchType } from '../types/match';
import db from '../utils/database';

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.guild) return;
    if (!interaction.message) return;
    if (!interaction.customId.startsWith('game-')) return;
    await interaction.deferReply({ ephemeral: true });

    const GameID = interaction.customId.split('-')[-1];
    const interactionValues = interaction.values[0];
    console.log(interactionValues);
    if (!interactionValues) return;
    console.log(interactionValues);
    const classSelected = interactionValues.split('-')[1];
    if (!classSelected) {
      await interaction.editReply({
        content: 'Classe não encontrada.',
      });
      return;
    }

    const msg = await interaction.editReply({
      content: `Você escolheu a classe ${classSelected}!\ngameID: ${GameID}`,
    });

    const matchData = await (await db())
      .collection<MatchType>('games')
      .findOne({ matchId: GameID });

    if (!matchData) {
      await interaction.editReply({
        content: 'Jogo não encontrado.',
      });
      await interaction.message.delete();
      return;
    }

    if (matchData.isStarted) {
      await interaction.editReply({
        content: 'O jogo já começou.',
      });
      await interaction.message.edit({ components: [] });
      return;
    }

    if (matchData.matchPlayers.length === 14) {
      await interaction.editReply({
        content: 'O jogo já está cheio.',
      });
      await interaction.message.edit({ components: [] });
      return;
    }

    const classCount = new Map<string, number>();

    for (const player of matchData.matchPlayers) {
      if (classCount.has(player.PlayerClass)) {
        let count = classCount.get(player.PlayerClass);
        if (!count) {
          count = 0;
        }
        classCount.set(player.PlayerClass, count + 1);
      } else {
        classCount.set(player.PlayerClass, 1);
      }
    }

    // TODO: now based on the count procceed to add the player to the teams and proceed with discussed logic

    return;
  },
};
