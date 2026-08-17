const {MessageEmbed} = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "dice",
  category: "💸 Economy",
  aliases: ["roll", "bet", "gamble"],
  description: "Earn your dice coins",
  usage: "dice <Gamble-Amount>",
  type: "game",
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
        userID: message.author.id,
      })
      if(!profile) {
        profile = await eco.create({
          userID: message.author.id,
          coins: 500,
          bank: 0,
          maxBank: 500
        })
        profile.save()
      }
    } catch (e) {
      console.error(e)
    }

    //let dicenumber = (args[1]);

    //if(dicenumber > 6) return message.reply(`❌ You can't roll a dice more than **6**!`)

    let bot = Math.floor(Math.random() * (6 - 1) + 1);
    let playerdice = (args[1]) || Math.floor(Math.random() * (6 - 1) + 1);

    if(profile.coins < args[0])
        return message.reply(`❌ **You can't bet more than you have!**`);

    if(!args[0]) return message.reply(`❌ **Specify amount to bet!**`)

    let bet;

    if(isNaN(args[0])) {
      if(args[0] !== 'all' || args[0] !== 'max') {
        return message.reply(`❌ **Please specify a valid amount!**`)
      } else {
        bet = profile.coins
      }
    } else {
      bet = Number(args[0])
    }

    if(bet < 200) return message.reply(`❌ You can't bet less than **⏣ 200**!`)

    let sendEmbed = (winorloose) => {
      let embed = new MessageEmbed()
      .setTitle(winorloose !== 'tied' ? `You ${winorloose}!` : 'Its a tie!')
      .setDescription(`>  You ${winorloose} the game and ${winorloose == 'won' ? `got **⏣ ${number(bet * 2)}**` : winorloose == 'lost' ? `paid **⏣ ${number(bet)}**` : `you got your **⏣ ${number(bet)}** back`}`)
      .addField(`You rolled:`, `\`\`\`\n${playerdice}\`\`\``, true)
      .addField(`I rolled:`, `\`\`\`\n${bot}\`\`\``, true)
      .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(`${winorloose == 'won' ? 'GREEN' : winorloose == 'lost' ? "RED" : "424549"}`)
      return message.reply({embeds: [embed]})
    }

    if(bot > playerdice) {
      sendEmbed('lost')
      await eco.findOneAndUpdate({
        userID: message.author.id
      }, {
        $inc: {
          coins: -bet
        }
      })
    } else if(playerdice > bot) {
      sendEmbed('won')
      let amount = Math.floor(bet * 2)
      await eco.findOneAndUpdate({
        userID: message.author.id
      }, {
        $inc: {
          coins: amount
        }
      })
    } else if(playerdice == bot) {
      sendEmbed(`tied`)
    }
  }
}