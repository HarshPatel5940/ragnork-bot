import { Events, type Interaction } from "discord.js";
import type { DiscordUser } from "../types";
import { MyEmojis } from "../types/emojis";
import type { MatchType, PlayerType } from "../types/match";
import db from "../utils/database";

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.guild) return;
    if (!interaction.message) return;
    if (!interaction.customId.startsWith("game-win-")) return;
    await interaction.deferReply({ ephemeral: false });

    const interactionValues = interaction.values[0];
    if (!interactionValues) return;
    const splitedInteractionValues = interactionValues.split("-");
    const winnerTeam = splitedInteractionValues[2];
    const GameID = splitedInteractionValues[3];
    if (!winnerTeam || !GameID) return;

    await interaction.editReply({
      content: `Você escolheu o time ${winnerTeam} como vencedor!\ngameID: ${GameID}`,
    });

    const matchData = await (await db())
      .collection<MatchType>("games")
      .findOne({ matchId: GameID });
    if (!matchData) {
      await interaction.editReply({
        content: "Jogo não encontrado.",
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
      .collection<MatchType>("games")
      .findOneAndUpdate(
        { matchId: GameID },
        {
          $set: {
            matchWinner: winnerTeam,
            isDraw: winnerTeam === "draw",
            isCompleted: true,
          },
        },
        { returnDocument: "after" },
      );

    if (!updatedMatchData || !updatedMatchData.isCompleted) {
      await interaction.editReply({
        content:
          "Erro ao atualizar o jogo. Entre em contato com o desenvolvedor",
      });
      return;
    }

    if (updatedMatchData.isDraw) {
      const bulkOps = [
        ...updatedMatchData.matchPlayers.map((player: PlayerType) => ({
          updateOne: {
            filter: { userId: player.PlayerID },
            update: {
              $inc: { InGameScore: 5, GamesPlayed: 1, GamesDraw: 1 },
              updatedAt: new Date(),
            },
          },
        })),
      ];
      await (await db()).collection("players").bulkWrite(bulkOps);
    } else {
      const winnerTeamPlayers =
        winnerTeam === "red"
          ? updatedMatchData.redTeam
          : updatedMatchData.blueTeam;
      const loserTeamPlayers =
        winnerTeam === "red"
          ? updatedMatchData.blueTeam
          : updatedMatchData.redTeam;

      const bulkOps = [
        ...winnerTeamPlayers.map((player: PlayerType) => ({
          updateOne: {
            filter: { userId: player.PlayerID },
            update: {
              $inc: { InGameScore: 20, GamesPlayed: 1, GamesWin: 1 },
              $set: { updatedAt: new Date() },
            },
          },
        })),
        ...loserTeamPlayers.map((player: PlayerType) => ({
          updateOne: {
            filter: { userId: player.PlayerID },
            update: {
              $inc: { InGameScore: -10, GamesPlayed: 1, GamesLose: 1 },
              $set: { updatedAt: new Date() },
            },
          },
        })),
      ];
      await (await db())
        .collection<DiscordUser>("discord-users")
        .bulkWrite(bulkOps);
    }

    await interaction.editReply({
      content: `**Os pontos dos jogadores foram atualizados!**! ${MyEmojis.Sparkels}`,
    });

    await interaction.message.edit({
      content: `**O jogo foi concluído!**

      > ${updatedMatchData.isDraw ? "A partida está empatada" : `A partida foi vencida pela equipe ${winnerTeam}`}  ${MyEmojis.Sparkels}`,
      components: [],
    });
    return;
  },
};
