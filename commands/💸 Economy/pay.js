const {MessageEmbed} = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "pay",
  category: "💸 Economy",
  aliases: ["givemoney", "give"],
  description: "Pay or Give coins to someone else!",
  usage: "pay <@USER> <Amount>",
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
    
    //DEFINE COOLDOWN, TIMEOUT AND COMMAND INFO FOR MONGODB
    const prettyMilliseconds = require('pretty-ms');
    const cooldownSchema = require("../../schemas/cooldown");
    const eco = require('../../schemas/economy')

    let cooldown;
    let command = {
      name: "pay",
      timeout: "3600",
      cooldownMsg: { 
        title: "❌ Already payed someone else a while ago!",
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
    
    const payurself = new MessageEmbed()
      .setTitle(`❌ **You can't pay yourself!**`)
      .setDescription(`Example: \`${prefix}pay <@USER> 1000\``)
      .setColor(es.wrongcolor)

    const mentionuser = new MessageEmbed()
      .setTitle(`❌ **You didn't mention a user to pay!**`)
      .setDescription(`Example: \`${prefix}pay <@USER> 1000\``)
      .setColor(es.wrongcolor)
    
    const amountembed = new MessageEmbed()
      .setTitle(`❌ **Please enter a valid Amount / Number!**`)
      .setDescription(`Example: \`${prefix}pay <@USER> 1000\``)
      .setColor(es.wrongcolor)
    
    const inventorySchema = require("../../schemas/inv");
    let number = require("../../function/numbers")
    
    let member = message.mentions.members.first()

    if(!member) return message.reply({ embeds: [mentionuser] })

    if(member.id == message.member.id) return message.reply({ embeds: [payurself] })

    if(member.user.bot) return message.reply(`❌ **You can't pay bots!**`)
     
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

      message.reply(`**❌ You can't pay someone with a padlock!**`)

    } else {

    if(profile.coins < 1000) return message.reply(`❌ You need atleast **⏣ 1,000** to pay someone!`)

    if(profile.coins < args[1]) return message.reply(`❌ **You can't pay coins more than you have!**`)
    
    const amount = parseInt(args[1]) || null
    if(!amount || isNaN(amount)) return message.reply({ embeds: [amountembed] })

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

    const success = new MessageEmbed()
      .setTitle(`You successfully paid ${member.user.username} with **⏣ ${number(amount)}**!`)
      .setDescription(`Your wallet now is **⏣ ${number(profile.coins - amount)}**`)
      .setColor("GREEN")
      .setFooter(`Use ${prefix}coinhelp for more info!`, message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()

    message.reply({ embeds: [success] })
      
    }
  }
}