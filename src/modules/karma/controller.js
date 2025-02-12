const { EmbedBuilder, MessageType } = require("discord.js");
const { addKarmaEntry, getKarmaEntriesForTimeRange } = require("./services");
const { updateMemberTotalKarma, getMemberByDiscordId } = require("../member");
const { subDays } = require("date-fns");
const { getKarmaLeaders, calculateTotalKarma } = require("./utils");

const updateKarma = async (discordMemberId, karma, type, target) => {
  const member = await getMemberByDiscordId(discordMemberId);
  await addKarmaEntry(member._id, { karma, type, target });
  await updateMemberTotalKarma(member._id, karma);
}

const changeKarmaManual = async (karma, member) => {
  const successMessage = karma > 0 ?
    `Added ${karma} karma points to user ${member.username}` : 
    `Removed ${Math.abs(karma)} karma points from user ${member.username}`

  const errorMessage = karma > 0 ?
    `Error adding karma to user ${member.username}` : 
    `Error removing karma from user ${member.username}`

  try {
    await updateKarma(member.id, karma, "manual");
    return new EmbedBuilder().setDescription(successMessage);
  } catch (error) {
    console.log(error);
    return new EmbedBuilder().setDescription(errorMessage);
  }
}

const addKarmaForBump = async (interaction) => {
  if (interaction.type !== MessageType.ChatInputCommand || (interaction.interaction.commandName !== "bump" && interaction.interaction.commandName !== "like")) return;
  for (let embed of interaction.embeds) {
    if (embed.description.includes("Bump done!") || embed.description.includes("Server bumped") || embed.description.includes("successfully liked")) {
      await updateKarma(interaction.interaction.user.id, 50, "bump");
    }
  }
}

const addKarmaForMessageActivity = (message, memberId) => {
  const points = Math.round(message.length/20);
  const karma = points > 5 ? 5 : points;
  if (karma === 0) return;
  return updateKarma(memberId, karma, "bump");
}

const removeKarmaForSwearWord = (memberId, text) => {
  return updateKarma(memberId, -10, "bump", text);
}

const getKarmaForThePastDay = async () => {
  const end = new Date();
  const start = subDays(end, 1);
  try {
    const entries = await getKarmaEntriesForTimeRange(start, end);
    return calculateTotalKarma(entries);
  } catch (error) {
    console.error(error)
  }
}

const getKarmaLeaderBoard = async () => {
  const end = new Date();
  const start = subDays(end, 1);
  try {
    const entries = await getKarmaEntriesForTimeRange(start, end);
    const leaders = getKarmaLeaders(entries);
    const list = Object.keys(leaders).map((id) => ({ ...leaders[id] })).sort((a, b) => b.karma - a.karma).filter(member => member.username);
    let text = '';
    list.forEach((entry, index) => {
      text = `${text}\n${index + 1}. ${entry.username}: ${entry.karma}`;
    })
    return new EmbedBuilder().setTitle("Karma leaders for the last 24 hours:").setDescription(text).setImage("https://res.cloudinary.com/de76u6w6i/image/upload/v1683985555/karma_leaderboard_yuqenx.png");
  } catch (error) {
    return new EmbedBuilder().setDescription(`Something went wrong with getting data for leader board`);
  }
}

module.exports = {
  changeKarmaManual,
  addKarmaForBump,
  addKarmaForMessageActivity,
  removeKarmaForSwearWord,
  getKarmaLeaderBoard,
  getKarmaForThePastDay
}
