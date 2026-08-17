const Discord = require('discord.js')
const {
      MessageEmbed
} = require('discord.js')
const config = require(`${process.cwd()}/botconfig/config.json`)

const CmdName = require("path").parse(__filename).name;
module.exports = {
      name: `${CmdName}`,
      category: "🔞 NSFW",
      usage: `${CmdName}`,
      type: "real",
      run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
            
            let files = require(`./db/${CmdName.replace("-db", "")}.json`);
            let link = files[Math.floor(Math.random() * files.length)];
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
            message.reply({embeds : [
        new MessageEmbed()
        .setColor(es.color)
        .setImage(await link)
        .setDescription('If not showing image then it is deleted...')
        .setFooter(`Requested by: ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
    ]}).catch(() => {})
      }
};