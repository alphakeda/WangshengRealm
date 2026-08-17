const {MessageEmbed} = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "coinhelp",
  category: "💸 Economy",
  aliases: ["chelp"],
  description: "Shows Help for the Economy System!",
  usage: "coinhelp",
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

    try {
      var user = message.author
      const economycmds = [ 
        `work`, 
        `beg`,
        `fish`,
        `hunt`,
        `multi`,
        `use`,
        `postmemes`,
        `rob`,  
        `pay`, 
        `balance`, 
        `withdraw`, 
        `deposit`, 
        `daily`, 
        `shop`, 
        `buy`, 
        `sell`
      ]
      const gamblingcmds = [
        "dice",
        "football",
        "coinflip"
      ]
      const extracmds = [
        `rich`,
        `shop`, 
        `buy <Item> [Amount]`,
        `sell <Item> [Amount]`
      ]
      //return some message!
      return message.reply({embeds: [new MessageEmbed()
        .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
        .setFooter(user.tag, user.displayAvatarURL({dynamic: true}))
        .setTitle(eval(client.la[ls]["cmds"]["economy"]["ecohelp"]["variable1"]))
        .addField(eval(client.la[ls]["cmds"]["economy"]["ecohelp"]["variablex_2"]), eval(client.la[ls]["cmds"]["economy"]["ecohelp"]["variable2"]))
        .addField(eval(client.la[ls]["cmds"]["economy"]["ecohelp"]["variablex_3"]), eval(client.la[ls]["cmds"]["economy"]["ecohelp"]["variable3"]))
        .addField(eval(client.la[ls]["cmds"]["economy"]["ecohelp"]["variablex_4"]), eval(client.la[ls]["cmds"]["economy"]["ecohelp"]["variable4"]))
      ]});
  } catch (e) {
    console.log(String(e.stack).grey.bgRed)
    return message.reply({embeds: [new MessageEmbed()
      .setColor(es.wrongcolor)
      .setFooter(client.getFooter(es))
      .setTitle(client.la[ls].common.erroroccur)
      .setDescription(eval(client.la[ls]["cmds"]["economy"]["ecohelp"]["variable5"]))
    ]});
  }
}
};
