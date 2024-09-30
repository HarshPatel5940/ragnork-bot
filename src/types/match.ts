import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const PlayerSchema = z.object({
  PlayerID: z.string(),
  PlayerName: z.string(),
  PlayerClass: z.string(),
});

export const MatchSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),

  matchId: z.string().ulid(),
  matchMsgChannel: z.string(),
  matchMsgId: z.string(),

  matchPlayers: z.array(PlayerSchema).max(14),
  // TODO: change to redTeam and blueTeam
  team1: z.array(PlayerSchema).max(7),
  team2: z.array(PlayerSchema).max(7),

  winner: z.enum(['Team 1', 'Team 2', 'draw']).optional(),

  isStarted: z.boolean().optional().default(false),
  isDraw: z.boolean().optional().default(false),
  isCompleted: z.boolean().optional().default(false),

  playedAt: z.date().optional(),
  updatedAt: z
    .date()
    .optional()
    .default(() => new Date()),
});

export type MatchType = z.infer<typeof MatchSchema>;
