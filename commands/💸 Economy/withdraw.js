const {MessageEmbed} = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "withdraw",
  category: "💸 Economy",
  aliases: ["with"],
  description: "Allows you to withdraw a specific amount or everything from your Bank",
  usage: "withdraw <AMOUNT/ALL>",
  type: "info",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {

    if (GuildSettings.ECONOMY === false && !config.ownerIDS.some(r => r.includes(message.author.id))) {
      return message.reply({embeds: [new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.disabled.title)
        .setDescription(require(`../../handlers/functions`).handlemsg(client.la[ls].common.disabled.description, {prefix: prefix}))
      ]});
    }

    //COMMAND
    const eco = require('../../schemas/economy');
    let number = require("../../function/numbers");
    
    let profile;

    try {
      profile = await eco.findOne({
        userID: message.author.id
      })

      if(!profile) {
        if(message.author.bot) return;
        profile = await eco.create({
          userID: message.author.id,
          coins: 500,
          bank: 0,
          maxBank: 1000
        })
        profile.save()
      }
    } catch (e) {
      console.error(e)
    }

    if(profile) {

    if(!args[0]) return message.reply(`❌ **Specify the amount you want to withdraw!**`)

    let amount;

    if(profile.bank == 0) return message.reply(`❌ **Your bank is empty!**`)

    if(isNaN(args[0])) {
      if(args[0] == 'max' || args[0] == 'all') {
      amount = profile.bank
    } else {
      return message.reply(`❌ You must deposit a **number** or \`<max/all>\` to deposit all!`)
    }
    } else {
      if(args[0] > profile.bank) {
        amount = profile.bank
      } else {
          amount = Number(args[0])
      }
    }

  try {
    await eco.findOneAndUpdate(
        {
          userID: message.author.id,
        },
        {
          $inc: {
            coins: amount,
            bank: -amount,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }

    message.reply(`Withdrawn **⏣ ${number(amount)}**!`);
    } else {
      return message.reply(`❌ **Error! try again!**`)
    }
  }
}