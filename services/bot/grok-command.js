const { SlashCommandBuilder } = require("discord.js");
const { askGrok, configured, XAI_MODEL } = require("./lib/grok");

function chunkDiscord(text, max = 1900) {
  const chunks = [];
  let remaining = String(text || "");
  while (remaining.length > max) {
    let cut = remaining.lastIndexOf("\n", max);
    if (cut < max * 0.5) cut = max;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).trimStart();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("grok")
    .setDescription("Ask WISE² Grok")
    .addStringOption((option) =>
      option
        .setName("prompt")
        .setDescription("What should WISE² Grok work on?")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!configured()) {
      return interaction.reply({
        content: "WISE² Grok is installed but XAI_API_KEY has not been configured on this host.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    try {
      const prompt = interaction.options.getString("prompt", true);
      const result = await askGrok(prompt);
      const chunks = chunkDiscord(result.content);
      await interaction.editReply(`**WISE² GROK** · ${result.model || XAI_MODEL}\n\n${chunks.shift() || "No response."}`);
      for (const chunk of chunks) await interaction.followUp(chunk);
    } catch (error) {
      console.error("WISE² Grok command failed:", error.response?.data || error.message);
      const message = error.response?.status === 401
        ? "xAI rejected the configured API key."
        : "WISE² Grok could not complete that request. Check the bot logs for details.";
      await interaction.editReply(message);
    }
  },
};
