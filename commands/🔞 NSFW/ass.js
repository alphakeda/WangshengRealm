const Discord = require('discord.js')
const {
  MessageEmbed,
  MessageAttachment
} = require('discord.js')
const rp = require('request-promise-native');
const config = require(`${process.cwd()}/botconfig/config.json`)
module.exports = {
  name: "ass",
  category: "🔞 NSFW",
  description: "Sends ass",
  usage: "ass",
  type: "real",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    
    if (GuildSettings.NSFW === false && !config.ownerIDS.some(r => r.includes(message.author.id))) {
                  const x = new MessageEmbed()
                        .setColor(es.wrongcolor)
                        .setFooter(client.getFooter(es))
                        .setTitle(client.la[ls].common.disabled.title)
                        .setDescription(require(`../../handlers/functions`).handlemsg(client.la[ls].common.disabled.description, {
                              prefix: prefix
                        }))
                  return message.reply({
                        embeds: [x]
                  });
            }
    if (!message.channel.nsfw) return message.reply(eval(client.la[ls]["cmds"]["nsfw"]["anal"]["variable2"]))
    return rp.get('http://api.obutts.ru/butts/0/1/random').then(JSON.parse).then(function (res) {
      return message.reply({embeds : [
        new MessageEmbed()
        .setColor(es.color)
        .setImage('http://media.obutts.ru/' + res[0].preview)
        .setDescription('If not showing image then it is deleted...')
        .setFooter(`Requested by: ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
    ]}).catch(() => {})
    });
  }
};