const { MessageEmbed } = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "fish",
  category: "💸 Economy",
  aliases: ["fishing"],
  description: "fish for fishes, items or money!",
  usage: "fish",
  type: "earn",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    
    if (GuildSettings.ECONOMY === false && !config.ownerIDS.some(r => r.includes(message.author.id))) {
      return message.reply({embeds: [new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.disabled.title)
        .setDescription(require(`../../handlers/functions`).handlemsg(client.la[ls].common.disabled.description, {prefix: prefix}))
      ]});
    }

    //DEFINE COOLDOWN, TIMEOUT AND COMMAND INFO FOR MONGODB
    const prettyMilliseconds = require('pretty-ms');
    const cooldownSchema = require("../../schemas/cooldown");
    const eco = require('../../schemas/economy');
    let number = require("../../function/numbers")

    let cooldown;
    let command = {
      name: "fish",
      timeout: "60",
      cooldownMsg: { 
        title: "❌ Slow Down!",
        description: `You can use this command again in **[timeleft]**`, 
        color: "RED"
      }
    }
    try {
      cooldown = await cooldownSchema.findOne({
        userID: message.author.id,
        commandName: command.name
      })

      if(!cooldown) {
        cooldown = await cooldownSchema.create({
          userID: message.author.id,
          commandName: command.name,
          cooldown: 0,
        })
        cooldown.save()
      }
    } catch (e) {
      console.error(e)
    }
    
    if(!cooldown || command.timeout * 1000 - (Date.now() - cooldown.cooldown) > 0) {
      let timecommand = prettyMilliseconds(command.timeout * 1000, { verbose: true, verbose :true })

        const timeleft = prettyMilliseconds(command.timeout * 1000 - (Date.now() - cooldown.cooldown), {verbose:true})

        let cooldownMessage =  command.cooldownMsg ? command.cooldownMsg.description : `> You can use this command every **${timecommand}**!\n> Try again in: **${timeleft}** `;

        let cooldownMsg = cooldownMessage.replace("[timeleft]", `${timeleft}`).replace("[cooldown]", `${timecommand}`).replace("[user]", `${message.author.username}`)

        let cooldownEmbed = new MessageEmbed()
        .setTitle(`${command.cooldownMsg ? command.cooldownMsg.title : "Slow Down!"}`)
        .setDescription(cooldownMsg)
        .setColor(`${command.cooldownMsg ? command.cooldownMsg.color : "RED"}`)
        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
        return message.reply({embeds: [cooldownEmbed]})
    } else {
      
      await cooldownSchema.findOneAndUpdate({
        userID: message.author.id,
        commandName: command.name
      }, {
        cooldown: Date.now()
      })
    }

    //COMMAND
    const inventory = require("../../schemas/inv");
    const shopList = require("../../economy/shop")
    
    let inv = await inventory.findOne({
        User: message.author.id
      })
  
      if(!inv || !inv.Inventory.fishingrod) return message.channel.send(`❌ **You need a fishing rod to go fishing!**`)
  
      let chances = Math.floor(Math.random() * 3)
  
      let locations = [" in an EXOTIC PLACE", ' at the beach', ' near your home', ' ', ' at the beach', ' near your home', ' ', ' at the beach', ' near your home', ' ']
      let location = locations[Math.floor(Math.random() * locations.length)]
  
      let desc;
  
      let exotic;
      if(location == ' in an EXOTIC PLACE') exotic = 1
  
      let common = Math.floor(Math.random() * 2)
      let commonn = Math.floor(Math.random() * 2)
  
      let rare = Math.floor(Math.random() * 12)
  
      let items = {}
      let colorr;
      
      if(common == 1 || commonn == 1) {
        let chancesToGetAmount = Math.floor(Math.random() * 3)
        let amount;
        if(chancesToGetAmount == 1) {amount = Math.floor(Math.random() * (1+ 5 - 2) + 2)} else {
          amount = Math.floor(Math.random() * (1+ 3 - 1) + 1)
        }
        items['commonfish'] = amount
        colorr = "#424549"
      }
      
      if(rare == 1) {
        let chancesToGetAmount = Math.floor(Math.random() * 7)
        let amount;
        if(chancesToGetAmount == 1) {amount = Math.floor(Math.random() * (1+ 5 - 2) + 2)} else {
          amount = Math.floor(Math.random() * (1+ 3 - 1) + 1)
        }
        items['rarefish'] = amount
        colorr = "#7fffff"
      }

      if(exotic && exotic == 1) {
        let chancesToGetAmount = Math.floor(Math.random() * 10)
        let amount;
        if(chancesToGetAmount == 1) {
          amount = Math.floor(Math.random() * (1+ 5 - 2) + 2)
        } else {
          amount = Math.floor(Math.random() * (1+ 2 - 1) + 1)
        }
        items['exoticfish'] = amount
        colorr = "#ffb4d7"
      }
  
      if(!Object.keys(items).length) {
        let amount = Math.floor(Math.random() * (1+ 3000 - 1000) + 1000)
        let banknoteRates = Math.floor(Math.random() * 10)
        message.reply(`You found nothing but got **⏣ ${number(amount)}** ${banknoteRates == 1 ? 'and a **banknote!**' : ''}`)
        if(banknoteRates == 1) {
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
            if(inv && !isEmpty(inv.Inventory)) {
              const hasItem = Object.keys(inv.Inventory).includes('banknote')
              if(!hasItem) {
                inv.Inventory['banknote'] = 1;
              } else {
                inv.Inventory['banknote'] = inv.Inventory['banknote'] + 1;
              }
              await inventory.findOneAndUpdate(params, inv)
            } else {
              new inventory({
                User: message.author.id,
                Inventory: {[itemToBuy]: amountToBuy}
              }).save()
            }
        }
        await eco.findOneAndUpdate({
          userID: message.author.id
        }, {
          $inc: {
            coins: amount
          }
        })
      } else {
        const findShopItem = (search) => shopList.find( ({ items }) => items.toLowerCase() === search );
        let mapped = Object.keys(items).map((value) => {
          let fishes = findShopItem(value)
  
          return `${fishes.emoji} | ${value.replace('fish', ' fish')} — (x${items[value]})`
        })
        if(chances == 0) {
          message.reply("**You went fishing and got NOTHING!**")
        } else {
          let amountt = Math.floor(Math.random() * (1+ 900 - 450) + 350)
          if(Math.floor(Math.random() * 3) !== 1) amountt = 0
          let worth = Object.keys(items).reduce((currentWorth, item) => {
            return findShopItem(item).price.sell * items[item] + currentWorth
          }, 0)
          let embed = new MessageEmbed()
          .setTitle(`${message.author.username} went Fishing!`)
          .setColor(colorr)
          .setDescription(`You went fishing**${location}** and found:**\n${mapped.join('\n')}**\n${amountt !== 0 ? `You also found **⏣ ${number(amountt)}**` : ''}`)
          .setFooter(`Sell this for ⏣ ${number(worth)}`, message.author.displayAvatarURL({ dynamic: true }))
          message.reply({embeds: [embed]})
          function isEmpty(obj) {
            for(var prop in obj) {
              if(Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
                }
              }
  
                return JSON.stringify(obj) === JSON.stringify({});
          }
            let params = {
              User: message.author.id
            }
          let data = {};
          Object.keys(items).forEach(async(fish) => {
          if(inv && !isEmpty(inv.Inventory)) {
          const hasItem = Object.keys(inv.Inventory).includes(fish)
          if(!hasItem) {
            inv.Inventory[fish] = items[fish];
          } else {
            inv.Inventory[fish] = inv.Inventory[fish] + items[fish];
          }
          }
          })
          await inventory.findOneAndUpdate(params, inv)
          if(amountt !== 0) {
            await eco.findOneAndUpdate({
              userID: message.author.id
            }, {
              $inc: {
                coins: amountt
              }
            })
          }
        }
      }
  }
}
