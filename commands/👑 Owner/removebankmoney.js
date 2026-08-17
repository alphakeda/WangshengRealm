const {MessageEmbed} = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "removebankmoney",
  category: "👑 Owner",
  aliases: ["ecoremovebankmoney", "addbm"],
  description: "Adds Money to someone else!",
  usage: "removebankmoney <@USER> <Amount>",
  memberpermissions: [`ADMINISTRATOR`],
  type: "user",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    
    if (!config.ownerIDS.some(r => r.includes(message.author.id)))
        return message.channel.send({embeds :[new MessageEmbed()
          .setColor(es.wrongcolor)
          .setFooter(client.getFooter(es))
          .setTitle(eval(client.la[ls]["cmds"]["owner"]["changename"]["variable1"]))
          .setDescription(eval(client.la[ls]["cmds"]["owner"]["changename"]["variable2"]))
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
    //command
    var user  = message.author;
    var topay = message.mentions.members.filter(member=>member.guild.id == message.guild.id).first();
    if(!topay) 
    return message.channel.send({embeds : [new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(user.tag, user.displayAvatarURL({dynamic: true}))
        .setTitle("❌ **Mention a user to remove money bank!**")
        .setDescription(`Example: \`${prefix}removebankmoney <@keda テ#0216>\` 1000`)
    ]});
    topay = topay.user;
    let payamount = Number(args[1]);
    if(!payamount)
      return message.channel.send({embeds :[new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(user.tag, user.displayAvatarURL({dynamic: true}))
        .setTitle("❌ **Please enter a amount to remove money bank!**")
        .setDescription(`Example: \`${prefix}removebankmoney <@keda テ#0216>\` 1000`)
      ]});
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
    if(!client.economy.has(`${message.guild.id}-${topay.id}`, "bank"))
      client.economy.set(`${message.guild.id}-${topay.id}`, 0, "bank")
    //get the economy data 
    let data2 = client.economy.get(`${message.guild.id}-${topay.id}`)

    if(payamount <= 0)
    return message.channel.send({embeds :[new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(user.tag, user.displayAvatarURL({dynamic: true}))
        .setTitle(eval(client.la[ls]["cmds"]["owner"]["addmoney"]["variable8"]))
     ]} );
    
    client.economy.math(`${message.guild.id}-${topay.id}`, "-", payamount, "bank")
    data2 = client.economy.get(`${message.guild.id}-${topay.id}`)
    //return some message!
    return message.reply({embeds : [new MessageEmbed()
      .setColor(es.color)
      .setFooter(user.tag, user.displayAvatarURL({dynamic: true}))
      .setTitle(`**Removed money to \`${topay.username}\`'s bank successfully!**`)
      .setDescription(`👛 **\`${topay.username}\`** now has \`${Math.floor(data2.bank)} 💸\` in his/her bank`)
    ]});
  } catch (e) {
    console.log(String(e.stack).dim.bgRed)
    return message.channel.send({embeds : [new MessageEmbed()
      .setColor(es.wrongcolor)
      .setFooter(client.getFooter(es))
      .setTitle(client.la[ls].common.erroroccur)
      .setDescription(eval(client.la[ls]["cmds"]["owner"]["addmoney"]["variable11"]))
    ]});
  }
}
};

