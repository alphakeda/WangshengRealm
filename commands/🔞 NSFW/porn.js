const client = require('nekos.life');
const Discord = require('discord.js')
const neko = new client();
const {
  MessageEmbed
} = require('discord.js')
const config = require(`${process.cwd()}/botconfig/config.json`)
var superagent = require('superagent');
module.exports = {
  name: "porn",
  category: "🔞 NSFW",
  usage: "porn",
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

    superagent.get('https://nekobot.xyz/api/image').query({
      type: 'pgif'
    }).end((err, response) => {
      message.reply({embeds : [
        new MessageEmbed()
        .setColor(es.color)
        .setImage(response.body.message)
        .setDescription('If not showing image then it is deleted...')
        .setFooter(`Requested by: ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
    ]}).catch(() => {})
    });
  }
};