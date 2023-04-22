const { ContextMenuCommandBuilder, ApplicationCommandType } = require("discord.js");
const { getKarmaPoints } = require("../../modules/karma");

module.exports = {
  data: new ContextMenuCommandBuilder().setName("Get user karma").setType(ApplicationCommandType.User),
  async execute(interaction) {
    await interaction.deferReply({
      fetchReply: true,
      ephemeral: true,
    })

    const embed = await getKarmaPoints(interaction.targetUser);
    
    await interaction.editReply({
      embeds: [embed]
    })
  }
} 