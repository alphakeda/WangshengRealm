const { MessageEmbed } = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "buy",
  category: "💸 Economy",
  aliases: ["buyitem"],
  description: "Shows the Store",
  usage: "buy [Item]",
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
    const inventory = require("../../schemas/inv");
    const items = require("../../economy/shop");
    let number = require("../../function/numbers")
    
    if(!args[0]) return message.reply(`❌ **Specify the item you want to buy!**`)

    let itemToBuy = args[0]
    const validItem = !!items.find((val) => val.items.toLowerCase() === itemToBuy)

    if(!validItem) return message.reply(`Couldn't find **${args.join(" ")}** in the shop!`)

    //if(items.find((val) => (val.items.toLowerCase()) === itemToBuy).price.buy === 0 && message.author.id !== '768362780545384449') return message.channel.send(`This item is not purchasable`)

    let profile;
    try {
      profile = await eco.findOne({
        userID: message.author.id,
      })
      if(!profile) {
        if(member.user.bot) return;
        profile = await eco.create({
          userID: message.author.id,
          coins: 500,
          bank: 0
        })
        profile.save()
      }
    } catch (e) {
      console.error(e)
    }

    let itemPrice = items.find((val) => (val.items.toLowerCase()) === itemToBuy).price.buy

    let amountToBuy;
    if(args[1]) {
      if(isNaN(args[1])) {
        if(args[1] == 'all') {
          amountToBuy = Math.floor((profile.coins) / itemPrice)
        } else {
          amountToBuy = 1
        }
      } else {
        amountToBuy = Number(args[1])
      }
    } else {
      amountToBuy = 1
    }

    itemPrice = itemPrice * amountToBuy

    const userBalance = profile.coins;
    if(userBalance < itemPrice) return message.reply(`❌ **You dont have enough coins to buy this!**`)

    const params = {
      User: message.author.id
    }

    function isEmpty(obj) {
  for(var prop in obj) {
    if(Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
      }
    }

      return JSON.stringify(obj) === JSON.stringify({});
    }

    inventory.findOne(params, async(err, data) => {
      if(data && !isEmpty(data.Inventory)) {
        const hasItem = Object.keys(data.Inventory).includes(itemToBuy)
        if(!hasItem) {
          data.Inventory[itemToBuy] = amountToBuy;
        } else {
          data.Inventory[itemToBuy] = data.Inventory[itemToBuy] + amountToBuy;
        }
        await inventory.findOneAndUpdate(params, data)
      } else {
        new inventory({
          User: message.author.id,
          Inventory: {[itemToBuy]: amountToBuy}
        }).save()
      }
      let buyembed = new MessageEmbed()
      .setTitle('SHOP')
      .setDescription(`You bought **${amountToBuy} x ${itemToBuy}** for **⏣ ${number(itemPrice)}**!`)
      .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(`GREEN`)
      message.reply({embeds: [buyembed]})
      try {
    await eco.findOneAndUpdate(
        {
          userID: message.author.id,
        },
        {
          $inc: {
            coins: -itemPrice,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
    })
  }
}
