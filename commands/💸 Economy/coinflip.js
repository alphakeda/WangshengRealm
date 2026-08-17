const {MessageEmbed} = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "coinflip",
  category: "💸 Economy",
  description: "Earn your Coinflip cash",
  usage: "coinflip <roll-result> <Gamble-Amount>",
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

    try {
      //COMMAND
      const eco = require('../../schemas/economy');
      let number = require("../../function/numbers")

      let profile; 
      try {
        profile = await eco.findOne({
          userID: message.author.id,
        }).clone()
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
      
      var user = message.author
      
      var flip = args[0] ? args[0].toLowerCase() : false //Heads or Tails
      var amount = args[1] //Coins to gamble
      
      if(profile.coins < args[1])
        return message.reply(`❌ **You can't bet more than you have!**`);
      if (!flip || !['heads', 'tails'].includes(flip)) 
        return message.reply(`❌ **Please provide a \`<roll-result>\`!**\nExample: \`${prefix}coinflip heads 100\``);
      if (!amount) 
        return message.reply(`❌ **Please provide a \`<Amount>\`!**\nExample: \`${prefix}coinflip heads 100\``);
      
      if(!Number(amount))
      return message.reply(`❌ **Please enter a valid Number!**\nExample: \`${prefix}coinflip heads 100\``);
      
      if (amount < 200) 
        return message.reply(`❌ You can't bet less than **⏣ 200**!`);

      var valid_Numbers = ['heads', 'tails'];
      var result = valid_Numbers[Math.floor((Math.random() * valid_Numbers.length))]
      let win = false;
      if(flip == result) win = true;
      if (win) {
        //Double the amount
        let amount = Math.floor(args[1] * 2)
        //Add the coins
        await eco.findOneAndUpdate({
          userID: message.author.id
        }, {
          $inc: {
            coins: amount
          }
        })
        //Update Profile
        try {
          profile = await eco.findOne({
            userID: message.author.id,
          }).clone()
        }catch (error) {}

        message.reply({embeds: [new MessageEmbed()
          .setTitle(`You Won!`)
          .setDescription(`The coin flipped **${result}** and won **⏣ ${number(amount)}**!\nYou now have **⏣ ${number(profile.coins)}**`)
          .setColor("GREEN")
          .setFooter(user.tag, user.displayAvatarURL({ dynamic: true }))
        ]})
      } else {
        //Remove the coins
        await eco.findOneAndUpdate({
          userID: message.author.id
        }, {
          $inc: {
            coins: -args[1]
          }
        })
        //Update Profile
        try {
          profile = await eco.findOne({
            userID: message.author.id,
          }).clone()
        }catch (error) {}

        message.reply({embeds: [new MessageEmbed()
          .setTitle(`You Lost!`)
          .setDescription(`The coin flipped **${result}** and lost **⏣ ${number(amount)}**!\nYou now have **⏣ ${number(profile.coins)}**`)
          .setColor("RED")
          .setFooter(user.tag, user.displayAvatarURL({ dynamic: true }))
        ]})
      }
    } catch (e) {
      console.log(String(e.stack).grey.bgRed)
    }
  }
};