const {MessageEmbed} = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "addbankmoney",
  category: "👑 Owner",
  aliases: ["ecoaddbankmoney", "addbm"],
  description: "Adds Money to someone else!",
  usage: "addbankmoney <@USER> <Amount>",
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
        
    try {
      //command
      const pingembed = new MessageEmbed()
        .setTitle(`❌ **Please ping a user!**`)
        .setDescription(`Example: \`${prefix}addbankmoney <@keda テ#0216> 100\``)
        .setColor(es.wrongcolor)
  
      const amountembed = new MessageEmbed()
        .setTitle(`❌ **Please enter a amount/number!**`)
        .setDescription(`Example: \`${prefix}addbankmoney <@keda テ#0216> 100\``)
        .setColor(es.wrongcolor)
  
      const target = message.mentions.users.first() || null
      if(!target) return message.reply({embeds: [pingembed]})
  
      args.shift()
      const amount = parseInt(args[0]) || null
      if(!amount || isNaN(amount)) return message.reply({embeds: [amountembed]})
          
      let user = await eco.findOne({ userID: target.id })
        await eco.findOneAndUpdate({
                userID: target.id,
              },
              {
               $inc: {
                bank: amount,
               },
        })
          user.save()
          return message.reply(`Done! Successfully added **⏣ ${amount}** to **${target}** bank!`)
      }catch (error) {
        console.log(error)
      }
    }
  }