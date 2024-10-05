import { Events, type Interaction } from 'discord.js';
import { MyEmojis } from '../types/emojis';
import type { MatchType, PlayerType } from '../types/match';
import db from '../utils/database';

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.guild) return;
    if (!interaction.message) return;
    if (!interaction.customId.startsWith('game-win-')) return;
    await interaction.deferReply({ ephemeral: false });

    const interactionValues = interaction.values[0];
    if (!interactionValues) return;
    const splitedInteractionValues = interactionValues.split('-');
    const winnerTeam = splitedInteractionValues[2];
    const GameID = splitedInteractionValues[3];
    if (!winnerTeam || !GameID) return;

    await interaction.editReply({
      content: `Você escolheu o time ${winnerTeam} como vencedor!\ngameID: ${GameID}`,
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

    const isUserPartOfMatch = matchData.matchPlayers.some(
      (player: PlayerType) => player.PlayerID === interaction.user.id,
    );

    if (!isUserPartOfMatch) {
      await interaction.editReply({
        content: `<@${interaction.user.id}> Você não faz parte deste jogo.`,
      });
      return;
    }

    // now update in mongodb the match winner team
    const updatedMatchData = await (await db())
      .collection<MatchType>('games')
      .findOneAndUpdate(
        { matchId: GameID },
        {
          $set: {
            matchWinner: winnerTeam,
            isCompleted: true,
          },
        },
        { returnDocument: 'after' },
      );

    if (!updatedMatchData || !updatedMatchData.isCompleted) {
      await interaction.editReply({
        content:
          'Erro ao atualizar o jogo. Entre em contato com o desenvolvedor',
      });
      return;
    }

    const winnerTeamPlayers =
      winnerTeam === 'red'
        ? updatedMatchData.redTeam
        : updatedMatchData.blueTeam;
    const loserTeamPlayers =
      winnerTeam === 'red'
        ? updatedMatchData.blueTeam
        : updatedMatchData.redTeam;

    // do an aggregation to update all players at once
    const bulkOps = [
      ...winnerTeamPlayers.map((player: PlayerType) => ({
        updateOne: {
          filter: { PlayerID: player.PlayerID },
          update: { $inc: { points: 20 } },
        },
      })),
      ...loserTeamPlayers.map((player: PlayerType) => ({
        updateOne: {
          filter: { PlayerID: player.PlayerID },
          update: [
            {
              $set: {
                points: {
                  $max: [{ $subtract: ['$points', 10] }, 0],
                },
              },
            },
          ],
        },
      })),
    ];

    await (await db()).collection('players').bulkWrite(bulkOps);

    await interaction.editReply({
      content: `A equipe ${winnerTeam} venceu o jogo!`,
    });

    await interaction.message.edit({
      content: `A equipe ${winnerTeam} venceu o jogo! ${MyEmojis.Tada}\n\n> **Os pontos dos jogadores foram atualizados!**`,
      components: [],
    });
    return;
  },
};
