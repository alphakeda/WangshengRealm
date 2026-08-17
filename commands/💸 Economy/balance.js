const { MessageEmbed } = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
let currency = require(`../../schemas/economy`) 
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "balance",
  category: "💸 Economy",
  aliases: ["bal", "wallet"],
  description: "Lets you check how much coins you have",
  usage: "balance [@USER]",
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
    
    const member = message.mentions.members.first() || message.guild.members.cache.find(member => member.user.username.toLowerCase() === args.join(" ").toLowerCase()) || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(member => member.displayName.toLowerCase() === args.join(" ").toLowerCase()) || message.member
    const usericon = member.user.displayAvatarURL;
    let profile; 
    try {
      profile = await currency.findOne({
        userID: member.id,
      })
      if(!profile) {
        
        if(member.user.bot) return message.reply(`Bots have more coins than you lol.`)
        profile = await currency.create({
          userID: member.id,
          coins: 500,
          bank: 0
        })
        profile.save()
      }

const pembed = new MessageEmbed()
      .setTitle(`${member.user.username} Balance`)
      .setDescription(`Wallet: **⏣ ${number(profile.coins)}**\nBank: **⏣ ${number(profile.bank)}**/**${number(profile.maxBank)}**`)
      .setColor("#F4C2C2")
      .setFooter(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
      message.reply({embeds: [pembed]})
    } catch (e) {
      console.error(e)
    } 
}} 
