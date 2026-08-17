var {
  MessageEmbed
} = require(`discord.js`);
var Discord = require(`discord.js`);
var config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
var emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const fs = require('fs');
var {
  databasing, isValidURL
} = require(`${process.cwd()}/handlers/functions`);
module.exports = {
  name: "resetbank",
  type: "info",
  category: "👑 Owner",
  aliases: ["resetb"],
  cooldown: 5,
  usage: "resetbank",
  description: "Reset's user bank!",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    
    if (!config.ownerIDS.some(r => r.includes(message.author.id)))
        return message.channel.send({embeds : [new MessageEmbed()
          .setColor(es.wrongcolor)
          .setFooter(client.getFooter(es))
          .setTitle(eval(client.la[ls]["cmds"]["owner"]["resetsettings"]["variable1"]))
          .setDescription(eval(client.la[ls]["cmds"]["owner"]["resetsettings"]["variable2"]))
        ]});
    
    if(!client.settings.get(message.guild.id, "ECONOMY")){
      return message.channel.send({embeds :[new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.disabled.title)
        .setDescription(require(`${process.cwd()}/handlers/functions`).handlemsg(client.la[ls].common.disabled.description, {prefix: prefix}))
      ]});
    }
    
    try {

          var user  = message.author;
    var topay = message.mentions.members.filter(member=>member.guild.id == message.guild.id).first();
    if(!topay) 
    return message.channel.send({embeds : [new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(user.tag, user.displayAvatarURL({dynamic: true}))
        .setTitle('❌ **Mention a user to reset bank!**')
        .setDescription(`Example: \`${prefix}resetbank <@keda テ#0216>\``)
    ]});
    topay = topay.user;
    if(user.bot || topay.bot) return message.reply({content : eval("❌ **That's not a user!**")})
    client.economy.ensure(`${message.guild.id}-${user.id}`, {
      user: user.id,
      work: 0,
      balance: 0,
      bank: 0,
      hourly: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      items: {
        yacht: 0, lamborghini: 0, car: 0, motorbike: 0,  bicycle: 0,
        nike: 0, tshirt: 0,
        mansion: 0, house: 0, dirthut: 0,
        pensil: 0, pen: 0, condom: 0, bottle: 0,
        fish: 0, hamster: 0, dog: 0, cat: 0,            
      }
    })
    client.economy.ensure(`${message.guild.id}-${topay.id}`, {
      user: user.id,
      work: 0,
      balance: 0,
      bank: 0,
      hourly: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      items: {
        yacht: 0, lamborghini: 0, car: 0, motorbike: 0,  bicycle: 0,
        nike: 0, tshirt: 0,
        mansion: 0, house: 0, dirthut: 0,
        pensil: 0, pen: 0, condom: 0, bottle: 0,
        fish: 0, hamster: 0, dog: 0, cat: 0,          
      }
    })
      client.economy.set(`${message.guild.id}-${topay.id}`, 0, "bank")
          //databasing(client, message.guild.id)
          return message.channel.send({embeds :[new MessageEmbed()
            .setColor(es.color)
            .setFooter(client.getFooter(es))
            .setTitle(`**Resetted \`${topay.username}\`'s bank successfully!**`)
          ]});

    } catch (e) {
      console.log(String(e.stack).dim.bgRed)
      return message.channel.send({embeds : [new MessageEmbed()
        .setColor(es.wrongcolor).setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.erroroccur)
        .setDescription(eval(client.la[ls]["cmds"]["owner"]["resetsettings"]["variable6"]))
      ]});
    }
  },
};

