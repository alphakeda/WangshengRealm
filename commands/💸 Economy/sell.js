const {MessageEmbed} = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "sell",
  category: "💸 Economy",
  description: "Sell an item from your inventory!",
  usage: "sell [Item] [Amount]",
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
  let number = require("../../function/numbers");
  const eco = require('../../schemas/economy');
  const inventory = require("../../schemas/inv");
  const items = require("../../economy/shop")

    let inv;
    try {
      inv = await inventory.findOne({
        User: message.author.id
      })
      if(!inv) return message.reply(`❌ **Your inventory is empty!**`)
    } catch (e) {
      console.error(e)
    }
if(!args[0]) return message.reply("❌ **Please provide a item to sell!**")
    if(!Object.keys(inv.Inventory).includes(args[0])) return message.reply(`❌ **You dont own this item!**`)

    let toSell = args[0].toLowerCase()

    //if(items.find((val) => (val.items.toLowerCase()) === toSell).price.sell === 0 && message.author.id !== '768362780545384449') return message.reply(`This item is not sellable`)

    let amountToSell;
    if(!args[1]) {
      amountToSell = 1
    } else {
      if(isNaN(args[1]) && (args[1] == 'all' || args[1] == 'max')) {
        amountToSell = inv.Inventory[toSell]
      } else {
        if(!isNaN(args[1])) {
          amountToSell = Number(args[1])
        }
      }
    }

    let params = {
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

    if(inv.Inventory[toSell] < amountToSell && inv.Inventory[toSell] !== 0) {
      amountToSell = inv.Inventory[toSell]
    }

    const itemPrice = items.find((val) => (val.items.toLowerCase()) === toSell).price.sell * amountToSell

    inventory.findOne(params, async(err, data) => {
      if(data && !isEmpty(data.Inventory)) {
        if((data.Inventory[toSell] - amountToSell) >= 1) {
          data.Inventory[toSell] = data.Inventory[toSell] - amountToSell;
        } else {
          if(Object.keys(data.Inventory).length === 1) {
          await inventory.deleteOne(params)
          } else {
            delete data.Inventory[toSell]
          }
        }
        await inventory.findOneAndUpdate(params, data)
      }
      message.reply(`You sold **${amountToSell} ${toSell}** for **⏣ ${number(itemPrice)}**!`)
      try {
    await eco.findOneAndUpdate(
        {
          userID: message.author.id,
        },
        {
          $inc: {
            coins: itemPrice,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
    })
  }
}
