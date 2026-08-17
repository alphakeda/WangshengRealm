const Discord = require("discord.js");
const {MessageEmbed, MessageAttachment} = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
const canvacord = require("canvacord");
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const anime = require('anime-actions');
module.exports = {
  name: "a-wave",
  aliases: ["wave", "awave", "animewave", "anime-wave"],
  category: "😳 Anime-Emotions",
  description: "Shows an Emotion-Expression in an Anime style",
  usage: "a-wave",
  type: "mention",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    
    if(GuildSettings.ANIME === false && !config.ownerIDS.some(r => r.includes(message.author.id))){
        return message.reply({embeds : [new MessageEmbed()
        .setColor(es.wrongcolor).setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.disabled.title)
        .setDescription(require(`../../handlers/functions`).handlemsg(client.la[ls].common.disabled.description, {prefix: prefix}))
        ]});
    }
    //send new Message
    message.reply({embeds : [
        new MessageEmbed()
        .setColor(es.color)
        .setImage(await anime.wave())
        .setAuthor(`${message.author.username} waves${message.mentions.users.first() ? " to " + message.mentions.users.first().username : " him-/herself.."}`, message.author.displayAvatarURL({ dynamic: true }))
    ]}).catch(() => {})
      
  }
}

