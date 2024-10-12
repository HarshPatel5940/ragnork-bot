import { ActivityType, type Client, Events } from "discord.js";

export default {
  name: Events.ClientReady,
  once: true,

  execute: async (client: Client) => {
    console.log(`Logged in as ${client.user?.tag}`);

    // Set the client user's activity

    client.user?.setActivity({
      name: "jogos | Bot desenvolvido por HarshPatel5940",
      type: ActivityType.Watching,
    });
  },
};
