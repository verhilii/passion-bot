const { Events } = require("discord.js");
const { addKarmaForMessageActivity, addKarmaForBump, removeKarmaForSwearWord } = require("../../modules/karma");
const { getSwearWordAmount, checkSwearWordsForUser } = require("../../modules/swear");
const { handleStatsForMessage } = require("../../modules/stats");

module.exports = {
  name: Events.MessageCreate,
  once: false,
  async execute(interaction, client) {
    const message = interaction.content;
    
    // check for bump and add karma
    addKarmaForBump(interaction);
    
    // handle message stats
    handleStatsForMessage(interaction);
    
    if (!interaction.member) return;

    const memberId = interaction.member.user.id;

    if (interaction.author.bot) return;
    // add karma for user activity
    await addKarmaForMessageActivity(message, memberId);

    const swearWordsAmount = getSwearWordAmount(message);
    if (swearWordsAmount > 0) {
      const channel = client.channels.cache.get(interaction.channelId);
      checkSwearWordsForUser(swearWordsAmount, interaction.member, channel);
      await removeKarmaForSwearWord(memberId, message);
    }
  } 
}