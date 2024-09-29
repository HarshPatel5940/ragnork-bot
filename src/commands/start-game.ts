import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  type ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  PermissionFlagsBits,
  SelectMenuBuilder,
  SlashCommandBuilder,
  type SlashCommandChannelOption,
  StringSelectMenuBuilder,
} from "discord.js";
import { ulid } from "ulid";
import db from "../utils/database";
import type { MatchType } from "../types/match";
import type { Command } from "../interface";
import { MyEmojis } from "../types/emojis";

const GameClasses = {
  scholar: "🇸​​🇨​​🇭​​🇴​​🇱​​🇦​​🇷​ - Scholar",
  champion: "​🇨​​🇭​​🇦​​🇲​​🇵​​🇮​​🇺​​🇳​ - Champion",
  paladin: "​🇵​​🇦​​🇱​​🇦​​🇩​​🇮​​🇳​ - Paladin",
  high_priest: "​🇭​​🇮​​🇬​​🇭​ 🇵​​🇷​​🇮​​🇪​​🇸​​🇹​ - High Priest",
  high_wizard: "🇭​​🇮​​🇬​​🇭​ ​🇼​​🇮​​🇿​​🇦​​🇷​​🇩 - High Wizard",
  minstrel: "​🇲​​🇮​​🇳​​🇸​​🇹​​🇷​​🇪​​🇱 - Minstrel",
};

const GameClasses2 = {
  scholar: "Scholar",
  champion: "Champion",
  paladin: "Paladin",
  high_priest: "High Priest",
  high_wizard: "High Wizard",
  minstrel: "Minstrel",
};

export default {
  data: new SlashCommandBuilder()
    .setName("início-jogo")
    .setDescription("Comece um novo jogo onde todos possam participar")
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    if (!interaction.channel) return;
    if (interaction.channel.type !== ChannelType.GuildText) return;

    await interaction.deferReply({ ephemeral: false });

    const channel = interaction.guild.channels.cache.get(interaction.channelId);
    if (channel?.type !== ChannelType.GuildText) {
      await interaction.reply({
        content: "Este comando só pode ser utilizado em um canal de texto.",
        ephemeral: true,
      });
      return;
    }

    const matchID = ulid();
    // to future me :D --> This is intentionally left non - awaited
    interaction.editReply({
      content: `O jogo começa em breve! ID do jogo: ${matchID}`,
    });
    const embed = new EmbedBuilder()
      .setTitle(`Novo jogo! ${MyEmojis.Controller}`)
      .setDescription(`${MyEmojis.Sparkels} Escolha uma classe para começar.`)
      .setColor(Colors.Green)
      .setFooter({ text: `ID do jogo - ${matchID}` })
      .addFields([
        {
          name: GameClasses2.scholar,
          value: "Ninguém se juntou ainda",
          inline: true,
        },
        {
          name: GameClasses2.champion,
          value: "Ninguém se juntou ainda",
          inline: true,
        },
        {
          name: GameClasses2.paladin,
          value: "Ninguém se juntou ainda",
          inline: true,
        },
        {
          name: GameClasses2.high_priest,
          value: "Ninguém se juntou ainda",
          inline: true,
        },
        {
          name: GameClasses2.high_wizard,
          value: "Ninguém se juntou ainda",
          inline: true,
        },
        {
          name: GameClasses2.minstrel,
          value: "Ninguém se juntou ainda",
          inline: true,
        },
        {
          name: "O jogo começou?",
          value: "Não",
          inline: false,
        },
      ])
      .setThumbnail(
        "https://cdn.discordapp.com/icons/1178394769173528576/5ce1d932838ec68d08d84e14c6cb246c.png?size=4096",
      )
      .setTimestamp();

    const dropdown = new StringSelectMenuBuilder()
      .setCustomId(`game-${matchID}`)
      .setPlaceholder("Escolha uma classe")
      .addOptions([
        {
          label: GameClasses.scholar,
          value: "scholar",
        },
        {
          label: GameClasses.champion,
          value: "champion",
        },
        {
          label: GameClasses.paladin,
          value: "paladin",
        },
        {
          label: GameClasses.high_priest,
          value: "high_priest",
        },
        {
          label: GameClasses.high_wizard,
          value: "high_wizard",
        },
        {
          label: GameClasses.minstrel,
          value: "minstrel",
        },
      ]);

    const actionRow =
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(dropdown);

    const message = await interaction.channel.send({
      embeds: [embed],
    });

    const match = {
      matchId: matchID,
      matchMsgChannel: interaction.channelId,
      matchMsgId: message.id,

      team1: [],
      team2: [],

      isStarted: false,
      isDraw: false,
      isCompleted: false,

      updatedAt: new Date(),
    } as MatchType;

    const data = await (await db())
      .collection<MatchType>("games")
      .insertOne(match);

    if (!data.insertedId) {
      await interaction.editReply({
        content: "Erro ao iniciar o jogo. Tente novamente.",
      });
      await message.delete();
      return;
    }

    await interaction.editReply({
      content: "Jogo iniciado com sucesso!",
    });

    await message.edit({
      content: `## Jogo iniciado com sucesso! \nEscolha uma classe para começar.\n> ID do jogo - \`${matchID}\``,
      embeds: [embed],
      components: [actionRow],
    });
  },
} as Command;
