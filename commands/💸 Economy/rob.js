const {MessageEmbed} = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "rob",
  category: "💸 Economy",
  aliases: ["steal"],
  description: "Rob Money from a Specific User, you can Ping him, add his ID / Username, it will be a random amount!",
  usage: "rob @USER",
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

    //DEFINE COOLDOWN, TIMEOUT AND COMMAND INFO FOR MONGODB
    const prettyMilliseconds = require('pretty-ms');
    const cooldownSchema = require("../../schemas/cooldown");
    const eco = require('../../schemas/economy')

    let cooldown;
    let command = {
      name: "rob",
      timeout: "90",
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
    const inventorySchema = require("../../schemas/inv");
    let number = require("../../function/numbers")
    
    let member = message.mentions.members.first()

    if(!member) return message.reply(`❌ **You didn't mention a user to rob!**`)

    if(member.id == message.member.id) return message.reply(`❌ **You can't rob yourself!**`)
    if(member.user.bot) return message.reply(`❌ **You can't rob bots!**`)
     
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

    let victim;
    try {
      victim = await eco.findOne({
        userID: member.id,
      })
      if(!victim) {
        if(message.author.bot) return;
        victim = await eco.create({
          userID: member.id,
          coins: 500,
          bank: 0,
          maxBank: 500
        })
        victim.save()
      }
    } catch (e) {
      console.error(e)
    }

    let victimInv;
    try {
      victimInv = await inventorySchema.findOne({
        User: member.id
      })
    } catch (e) {
      console.error(e)
    }

    if(victimInv && victimInv.Inventory["padlock"]) {
      let amount;
      if(profile.coins < 10000) {
        amount = Math.floor(Math.random() * (1 + 7500 - 4999) + 4999)
      } else {
        amount = 7000
      }
      message.reply(`**Imagine trying to rob a person with padlock**`)

      function isEmpty(obj) {
        for(var prop in obj) {
         if(Object.prototype.hasOwnProperty.call(obj, prop)) {
          return false;
          }
       }

        return JSON.stringify(obj) === JSON.stringify({});
      }
      let params = {
        User: member.id
      }
      inventorySchema.findOne(params, async(err, data) => {
      if(data) {
        if((data.Inventory["padlock"] - 1) >= 1) {
          data.Inventory["padlock"] = data.Inventory["padlock"] - 1;
        } else {
          if(Object.keys(data.Inventory).length === 1) {
          await inventorySchema.deleteOne(params)
          } else {
            delete data.Inventory["padlock"]
          }
        }
        await inventorySchema.findOneAndUpdate(params, data)
      }
      }).clone()
    } else {

    if(profile.coins < 5000) return message.channel.send(`❌ You need atleast **⏣ 5,000** to rob someone!`)

    if(victim.coins < 5000) return message.channel.send(`❌ **You cant rob broke people!**`)

    let chances = Math.floor(Math.random() * 2)

    if(chances !== 1) {
      let amount;
      if(profile.coins > 10000) {
        amount = Math.floor(Math.random() * (1 + 5500 - 5000) + 5000)
      } else {
        amount = 5000
      }
      message.reply(`👮 You were caught! You paid **⏣ ${amount}**`)
      await eco.findOneAndUpdate({
        userID: message.author.id,
      }, {
        $inc: {
          coins: -amount
        }
      })
      await eco.findOneAndUpdate({
        userID: member.id
      }, {
        $inc: {
          coins: amount
        }
      })
    } else {
      let rate = Math.floor(Math.random() * 10)
      let amount;
      if(rate == 3) {
        amount = Math.floor(Math.random() * (1+  Math.floor(victim.coins/1.3) -  Math.floor(victim.coins/4)) +  Math.floor(victim.coins/4))
      } else {
        if(rate == 4) {
        amount = Math.floor(Math.random() * (1+ (victim.coins/12) - (victim.coins/15)) + (victim.coins/15))
        } else {
          amount = Math.floor(Math.random() * (1+ (victim.coins/65) - (victim.coins/40)) + (victim.coins/40))
        }
      }

      function between(min, max, subject) {
        if(subject > min && subject < max) {
          return true
        } else {
          return false
        }
      }

      let desc;

      if(between(Math.floor(victim.coins/4), Math.floor(victim.coins/1.3), amount)) {
        desc = `You stole a **BIG portion** from \`${member.user.username}\` and got **⏣ ${number(amount)}**`
      } else if(between(Math.floor(victim.coins/15), Math.floor(victim.coins/12), amount)) {
        desc = `You stole a **GOOD amount** from \`${member.user.username}\` and got **⏣ ${number(amount)}**`
      } else {
        desc = `You stole a **TINY amount** from \`${member.user.username}\` and got **⏣ ${number(amount)}**`
      }
      await eco.findOneAndUpdate({
        userID: message.author.id,
      }, {
        $inc: {
          coins: amount
        }
      })
      await eco.findOneAndUpdate({
        userID: member.id
      }, {
        $inc: {
          coins: -amount
        }
      })
      message.reply({content: desc})
      }
    }
  }
}