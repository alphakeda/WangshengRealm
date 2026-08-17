const {MessageEmbed} = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "deposit",
  category: "💸 Economy",
  aliases: ["tobank", "dep"],
  description: "Allows you to deposit a specific amount or everything to your Bank",
  usage: "deposit <AMOUNT/ALL>",
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
    let number = require("../../function/numbers")
    
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

    if(!args[0]) return message.reply(`❌ **Specify the amount you want to deposit!**`)

    let amount;

    if(isNaN(args[0])) {
      if(args[0] == 'max' || args[0] == 'all') {
        if(profile.coins > profile.maxBank) {
          amount = profile.maxBank - profile.bank
        } else {
          amount = profile.coins
        }
    } else {
      return message.reply(`❌ You must deposit a **number** or \`<max/all>\` to **deposit all**`)
    }

    if(profile.maxBank == profile.bank) return message.reply(`❌ **Your bank is full!**`)

    } else {
      if(args[0] > profile.coins) {
        amount = profile.coins
      } else {
        if(args[0] > profile.maxBank) {
          amount = profile.maxBank
        } else {
          if(args[0] <= profile.coins && !isNaN(args[0])) {
          amount = args[0]
        }
      }
    }
    }

  try {
    await eco.findOneAndUpdate(
        {
          userID: message.author.id,
        },
        {
          $inc: {
            coins: -amount,
            bank: amount,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }

    let updatedBank = Math.floor(profile.bank + Number(amount))

    message.reply(`Deposited **⏣ ${number(amount)}**!\nYour bank now is **⏣ ${number(updatedBank)}**`);
    } else {
      return message.reply(`❌ **Error! Try again!!**`)
    }
  }
}