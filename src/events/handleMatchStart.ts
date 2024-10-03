import { randomInt } from 'node:crypto';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  Events,
  type Interaction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import type { MatchType, PlayerClassesType, PlayerType } from '../types/match';
import db from '../utils/database';

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.guild) return;

    if (!interaction.customId.startsWith('game-start-')) return;
    await interaction.deferReply({ ephemeral: false });

    const GameID = interaction.customId.split('-')[2];
    await interaction.editReply({
      content: `Você começou o jogo! gameID: ${GameID}`,
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

    const startButton = new ButtonBuilder()
      .setCustomId(`game-start-${GameID}`)
      .setLabel('Iniciar Jogo')
      .setStyle(ButtonStyle.Success);

    const abortButton = new ButtonBuilder()
      .setCustomId(`game-abort-${GameID}`)
      .setLabel('Cancelar Jogo')
      .setStyle(ButtonStyle.Danger);

    if (matchData.isStarted) {
      await interaction.editReply({
        content: 'O jogo já começou.',
      });

      await interaction.message.edit({
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            startButton.setDisabled(true),
            abortButton,
          ]),
        ],
      });
      return;
    }

    const matchPlayers = matchData.matchPlayers;
    const redTeam = matchData.redTeam;
    const blueTeam = matchData.blueTeam;
    const matchClassesMap = new Map<PlayerClassesType, PlayerType[]>();

    for (const player of matchPlayers) {
      const players = matchClassesMap.get(player.PlayerClass) || [];
      console.log(players, player, typeof player);

      matchClassesMap.set(player.PlayerClass, [...players, player]);
    }

    const matchClassesMapKeys = Array.from(matchClassesMap.keys());

    for (const mClass of matchClassesMapKeys) {
      const players = matchClassesMap.get(mClass);
      if (!players) continue;

      const tPlayer = randomInt(2);
      if (players[tPlayer]) {
        redTeam.push(players[tPlayer]);
      }
      const t2Player = tPlayer === 0 ? 1 : 0;
      if (players[t2Player]) {
        blueTeam.push(players[t2Player]);
      }
    }

    const data = await (await db()).collection<MatchType>('games').updateOne(
      { matchId: GameID },
      {
        $set: {
          redTeam,
          blueTeam,
          isStarted: true,
          updatedAt: new Date(),
        },
      },
    );

    if (data.modifiedCount === 0) {
      await interaction.editReply({
        content: 'Erro ao iniciar o jogo.',
      });
      return;
    }

    const prevEmbed = interaction.message.embeds[0];
    if (!prevEmbed) {
      await interaction.editReply({
        content: 'Erro ao iniciar o jogo.',
      });
      return;
    }
    console.trace();
    const prevEmbedFields = prevEmbed.fields;

    const redTeamPlayers = redTeam
      .map(player => {
        return `${player.PlayerName} - ${player.PlayerClass}`;
      })
      .join('\n');

    const blueTeamPlayers = blueTeam
      .map(player => {
        return `${player.PlayerName} - ${player.PlayerClass}`;
      })
      .join('\n');

    const redTeamMention = redTeam
      .map(player => {
        return `<@${player.PlayerID}>`;
      })
      .join(', ');

    const blueTeamMention = blueTeam
      .map(player => {
        return `<@${player.PlayerID}>`;
      })
      .join(', ');

    const newEmbed = new EmbedBuilder()
      .setTitle('Jogo Iniciado!')
      .setDescription(`${prevEmbed.description}`)
      .setColor(prevEmbed.color)
      .setFields([
        ...prevEmbedFields,
        {
          name: 'Red Team',
          value: redTeamPlayers,
          inline: false,
        },
        {
          name: 'Blue Team',
          value: blueTeamPlayers,
          inline: false,
        },
      ]);
    console.trace();
    await interaction.message.edit({
      content: `Red Team: ${redTeamMention}\nBlue Team: ${blueTeamMention}`,
      embeds: [newEmbed],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          startButton.setDisabled(true),
          abortButton,
        ]),
      ],
    });
  },
};
