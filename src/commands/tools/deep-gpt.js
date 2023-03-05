

const { Translator } = require('deepl-node');
const { getBasicGptOptions, getEmbed, getAnswer } = require("../../modules/gpt");

const translator = new Translator(process.env.DEEPL_KEY);

module.exports = {
  data: getBasicGptOptions("deep-gpt", "Ask gpt (for Russian language only)"),
  async execute(interaction) {
    const option = interaction.options.get('question');
    const optionAnswerType = interaction.options.get('answer-type');

    await interaction.deferReply({
      fetchReply: true
    })

    const question = await translator.translateText(option.value, null, 'en-US');

    const answer = await getAnswer(question.text);

    const isPrivate = optionAnswerType && optionAnswerType.value === "private";

    if (isPrivate) {
      interaction.member.send(answer);
    }

    const ruAnswer = await translator.translateText(answer, null, 'ru');

    const embed = getEmbed(isPrivate, option.value, ruAnswer.text);

    await interaction.editReply({
      ephemeral: true,
      embeds: [embed]
    })
  }
    
} 