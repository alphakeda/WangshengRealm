const { MessageEmbed } = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "use",
  category: "💸 Economy",
  description: "Use items in your inventory!",
  usage: "use",
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
    const multi = require("../../schemas/multi");
    let number = require("../../function/numbers");
    let emo = require("../../emojis");
    const eco = require('../../schemas/economy');
    let inv = require('../../schemas/inv');
    let inventory = require('../../schemas/inv');
    let percent = require("../../function/percentage")
    
    if(args.join(' ').toLocaleLowerCase() == 'banknote') {
      let inventory;
      try {
        inventory = await inv.findOne({
          User: message.author.id
        })
      } catch (e) {
        console.error(e)
      }
      if(!inventory || !inventory.Inventory.banknote) return message.reply(`❌ **You dont own this item!**`);
  
      let amountToUse;
      if(args[1]) {
        if(isNaN(amountToUse)) {
          if(args[0].toLowerCase() != 'all' && args[0].toLowerCase() != 'max') return message.reply(`❌ **Amount of banknote must be a number or \`all\`**`)
          else amountToUse = inventory.Inventory.banknote
        }
      } else {
        amountToUse = 1
      }
  
      let profile;
      try {
        profile = await eco.findOne({
          userID: message.author.id,
        })
        if(!profile) {
          if(message.author.bot) return;
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
  
      let newMaxBank = Math.floor(profile.maxBank * 0.97)
  
      try {
      await eco.findOneAndUpdate(
          {
            userID: message.author.id,
          },
          {
            $inc: {
              maxBank: newMaxBank,
            },
          }
        );
      } catch (err) {
        console.log(err);
      }
      message.reply(`You used your banknote and get **⏣ ${number(newMaxBank)}** (\`${percent(newMaxBank, profile.maxBank)}%\`) more bank space!`)
  
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
  
      inv.findOne({User: message.author.id}, async(err, data) => {
        if(data && !isEmpty(data.Inventory)) {
          if((data.Inventory["banknote"] - amountToUse) >= 1) {
            data.Inventory["banknote"] = data.Inventory["banknote"] - amountToUse;
          } else {
            if(Object.keys(data.Inventory).length === 1) {
            await inventory.deleteOne({User: message.author.id})
            } else {
              delete data.Inventory["banknote"]
            }
          }
          await inv.findOneAndUpdate(params, data)
        }
      })
      } else if(args.join(' ').toLocaleLowerCase() == 'santasbag') {
        let inventory;
      try {
        inventory = await inv.findOne({
          User: message.author.id
        })
      } catch (e) {
        console.error(e)
      }
      if(!inventory || !inventory.Inventory.santasbag) return message.reply(`❌ **You dont own this item!**`);
        let amountToUse;
      if(args[1]) {
        if(isNaN(amountToUse)) {
          if(args[0].toLowerCase() != 'all' && args[0].toLowerCase() != 'max') return message.reply(`❌ **Amount of santasbag must be a number or \`all\`**`)
          else amountToUse = inventory.Inventory.santasbag
        }
      } else {
        amountToUse = 1
      }
  
      let profile;
      try {
        profile = await eco.findOne({
          userID: message.author.id,
        })
        if(!profile) {
          if(message.author.bot) return;
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
  
      let amount = Math.floor(Math.random() * (1+1500-400) + 400)
  
      try {
      await eco.findOneAndUpdate(
          {
            userID: message.author.id,
          },
          {
            $inc: {
              coins: amount,
            },
          }
        );
      } catch (err) {
        console.log(err);
      }
      message.reply(`WOHOO! 🎅 Gave u **⏣ ${amount}**!`)
  
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
  
      inv.findOne({User: message.author.id}, async(err, data) => {
        if(data && !isEmpty(data.Inventory)) {
          if((data.Inventory["santasbag"] - amountToUse) >= 1) {
            data.Inventory["santasbag"] = data.Inventory["santasbag"] - amountToUse;
          } else {
            if(Object.keys(data.Inventory).length === 1) {
            await inventory.deleteOne({User: message.author.id})
            } else {
              delete data.Inventory["santasbag"]
            }
          }
          await inv.findOneAndUpdate(params, data)
        }
      })
      } else if(args.join(' ').toLocaleLowerCase() == 'spinner') {
        let inventory;
      try {
        inventory = await inv.findOne({
          User: message.author.id
        })
      } catch (e) {
        console.error(e)
      }
      if(!inventory || !inventory.Inventory.spinner) return message.reply(`❌ **You dont own this item!**`);
        let amountToUse;
      if(args[1]) {
        if(isNaN(amountToUse)) {
          if(args[0].toLowerCase() != 'all' && args[0].toLowerCase() != 'max') return message.reply(`❌ **Amount of spinner must be a number or \`all\`**`)
          else amountToUse = inventory.Inventory.spinner
        }
      } else {
        amountToUse = 1
      }
  
      let profile;
      try {
        profile = await multi.findOne({
          User: message.author.id,
        })
        if(!profile) {
          if(message.author.bot) return;
          profile = await multi.create({
            User: message.author.id,
            Multi: 0,
            
          })
          profile.save()
        }
      } catch (e) {
        console.error(e)
      }
  
      let amount = Math.floor(Math.random() * (1+15-4) + 4)
  
      try {
      await multi.findOneAndUpdate(
          {
            User: message.author.id,
          },
          {
            $inc: {
              Multi: amount,
            },
          }
        );
      } catch (err) {
        console.log(err);
      }
      message.reply(`**Your spinner span \`${amount}\` times and got you \`${amount}%\` multi!**`)
  
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
  
      inv.findOne({User: message.author.id}, async(err, data) => {
        if(data && !isEmpty(data.Inventory)) {
          if((data.Inventory["spinner"] - amountToUse) >= 1) {
            data.Inventory["spinner"] = data.Inventory["spinner"] - amountToUse;
          } else {
            if(Object.keys(data.Inventory).length === 1) {
            await inventory.deleteOne({User: message.author.id})
            } else {
              delete data.Inventory["spinner"]
            }
          }
          await inv.findOneAndUpdate(params, data)
        }
      })
      } else if(args.join(' ').toLocaleLowerCase() == 'xmaspresent') {
        let inventory;
      try {
        inventory = await inv.findOne({
          User: message.author.id
        })
      } catch (e) {
        console.error(e)
      }
      if(!inventory || !inventory.Inventory.xmaspresent) return message.reply(`❌ **You dont own this item!**`);
        let amountToUse;
      if(args[1]) {
        if(isNaN(amountToUse)) {
          if(args[0].toLowerCase() != 'all' && args[0].toLowerCase() != 'max') return message.reply(`❌ **Amount of spinner must be a number or \`all\`**`)
          else amountToUse = inventory.Inventory.xmaspresent
        }
      } else {
        amountToUse = 1
      }
  
      
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
  
      inv.findOne({User: message.author.id}, async(err, data) => {
        if(data && !isEmpty(data.Inventory)) {
          if((data.Inventory["xmaspresent"] - amountToUse) >= 1) {
            data.Inventory["xmaspresent"] = data.Inventory["xmaspresent"] - amountToUse;
          } else {
            if(Object.keys(data.Inventory).length === 1) {
            await inventory.deleteOne({User: message.author.id})
            } else {
              delete data.Inventory["xmaspresent"]
            }
          }
          await inv.findOneAndUpdate(params, data)
        }
      })
            
      } else {
        message.reply(`❌ **This item is not useable!**`)
      } 
  }
}
