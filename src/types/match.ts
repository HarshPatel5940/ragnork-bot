import { ObjectId } from "mongodb";
import { z } from "zod";

export const playerClasses = {
  scholar: "🇸​​🇨​​🇭​​🇴​​🇱​​🇦​​🇷​ - Scholar",
  champion: "​🇨​​🇭​​🇦​​🇲​​🇵​​🇮​​🇺​​🇳​ - Champion",
  paladin: "​🇵​​🇦​​🇱​​🇦​​🇩​​🇮​​🇳​ - Paladin",
  high_priest: "​🇭​​🇮​​🇬​​🇭​ 🇵​​🇷​​🇮​​🇪​​🇸​​🇹​ - High Priest",
  high_wizard: "🇭​​🇮​​🇬​​🇭​ ​🇼​​🇮​​🇿​​🇦​​🇷​​🇩 - High Wizard",
  minstrel: "​🇲​​🇮​​🇳​​🇸​​🇹​​🇷​​🇪​​🇱 - Minstrel",
  wildCardClass: "🃏 - Wild Card" as wildCardClassType,
};

export const playerClasses2 = {
  scholar: "Scholar",
  champion: "Champion",
  paladin: "Paladin",
  high_priest: "High Priest",
  high_wizard: "High Wizard",
  minstrel: "Minstrel",
  wildCardClass: "Wild Cards",
};

export type wildCardClassType =
  | "Gypsy"
  | "Stalker"
  | "Sniper"
  | "🃏 - Wild Card";

export type PlayerClassesType = keyof typeof playerClasses2 | wildCardClassType;

export const PlayerSchema = z.object({
  PlayerID: z.string(),
  PlayerName: z.string(),
  PlayerClass: z.enum(
    Object.keys(playerClasses2) as [PlayerClassesType, ...PlayerClassesType[]],
  ),
});

export type PlayerType = z.infer<typeof PlayerSchema>;

export const MatchSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),

  matchId: z.string().ulid(),
  matchMsgChannel: z.string(),
  matchMsgId: z.string(),

  matchPlayers: z.array(PlayerSchema).max(14),
  // TODO: change to redTeam and blueTeam
  redTeam: z.array(PlayerSchema).max(7),
  blueTeam: z.array(PlayerSchema).max(7),

  winner: z.enum(["Team Red", "Team Blue", "Draw"]).optional(),

  isStarted: z.boolean().optional().default(false),
  isAborted: z.boolean().optional().default(false),
  isDraw: z.boolean().optional().default(false),
  isCompleted: z.boolean().optional().default(false),

  playedAt: z.date().optional(),
  updatedAt: z
    .date()
    .optional()
    .default(() => new Date()),
});

export type MatchType = z.infer<typeof MatchSchema>;
