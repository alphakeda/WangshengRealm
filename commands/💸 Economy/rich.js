const {MessageEmbed, splitMessage} = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "rich",
  category: "💸 Economy",
  aliases: ["ecolb", "richest", "lb", "leaderboard"],
  description: "Shows the richest people in the server!",
  usage: "rich",
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
    const Color = `#F4C2C2`;
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
          bank: 0
        })
        profile.save()
      }
    } catch (e) {
      console.error(e)
    }

    let find = await eco.find()

    find = find.filter(value => message.guild.members.cache.get(value.userID)).sort((a, b) => {
      return b.coins - a.coins
    })

    let top;
    if(!isNaN(args[0])) {
      top = args[0]
    } else {
      if(args[0] !== 'all') {
      top = 10
      } else {
        top = find.length
      }
    }

    let mapped  = find.map((value, index) => {
      return `\`(#${index+1})\` **⏣ ${number(value.coins)}** | ${client.users.cache.get(value.userID).tag}`
    })

    let test = mapped.filter(value => {
      return value.includes(message.author.tag)
    })

    let place = Number(test.join().slice(3, 4))

    let desc = mapped.slice(0, top).join("\n").replace("\`(#1)\`", ` 🥇 `).replace("\`(#2)\`", ` 🥈 `).replace("\`(#3)\`", ` 🥉 `)

    let embed = new MessageEmbed()
    .setTitle(`**👑 Top ${top}** richest users in *${message.guild.name}*`)
    .setDescription(`\n\n${desc}`)
    .setColor(Color)
    .setThumbnail(message.guild.iconURL)
    .setTimestamp()

    message.reply({embeds: [embed]})

  }
}