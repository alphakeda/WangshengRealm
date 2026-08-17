const randomPuppy = require('random-puppy');
const fs = require("fs")
const {
    MessageEmbed
} = require('discord.js')
const config = require(`${process.cwd()}/botconfig/config.json`)
const Discord = require('discord.js');
const booru = require('booru');

module.exports = {
    name: "r34",
    category: "🔞 NSFW",
    usage: "r34",
    aliases: ["rule34"],
    description: "Searches rule34",
    type: "anime",
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

      if(!args[0])
        return message.reply({embeds: [new MessageEmbed()
          .setColor(es.wrongcolor)
          .setFooter(client.getFooter(es))
          .setTitle('**❌ Provide a search query!**')
          .setDescription(`Usage: \`${prefix}r34 <query>\``)
        ]});
      
        var query = message.content.split(/\s+/g).slice(1).join(" ");
        booru.search('rule34', [query], {
                nsfw: true,
                limit: 1,
                random: true
            })
            .then(booru.commonfy)
            .then(images => {
                for (let image of images) {
                    return message.reply({embeds : [
        new MessageEmbed()
        .setColor(es.color)
        .setImage(image.common.file_url)
        .setDescription('If not showing image then it is deleted...')
        .setFooter(`Requested by: ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
    ]}).catch(() => {})
                }
            }).catch(err => {
                if (err.name === 'booruError') {
                    return message.reply(eval(client.la[ls]["cmds"]["nsfw"]["r34"]["variable5"]));
                } else {
                    return message.reply(eval(client.la[ls]["cmds"]["nsfw"]["r34"]["variable6"]));
                }
            })
    }
};