var {
  MessageEmbed
} = require(`discord.js`);
var Discord = require(`discord.js`);
var config = require(`../../botconfig/config.json`);
var ee = require(`../../botconfig/embed.json`);
var emoji = require(`../../botconfig/emojis.json`);
const fs = require('fs');
var {
  dbEnsure,
  isValidURL
} = require(`../../handlers/functions`);

const {
  databasing,
  CheckGuild
} = require(`../../handlers/functions`); //Loading all needed functions

module.exports = {
  name: `setupguild`,
  category: `👑 Owner`,
  type: "info",
  aliases: [`sg`],
  description: `Tries to forcefully setup up the database for the guild again.`,
  usage: `setupguild`,
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    
    
    if (!config.ownerIDS.includes(message.author?.id))
      return message.channel.send({embeds : [new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(client.getFooter(es))
        .setTitle(eval(client.la[ls]["cmds"]["owner"]["cmdreload"]["variable1"]))
      ]});
    try {
      if (!args[0])
        return message.channel.send({embeds :[new MessageEmbed()
          .setColor(es.wrongcolor)
          .setFooter(client.getFooter(es))
          .setTitle("❌ Please provide a valid Guild ID!")
        ]});

      let key = args[0];

      if (isNaN(key))
        return message.channel.send({embeds :[new MessageEmbed()
          .setColor(es.wrongcolor)
          .setFooter(client.getFooter(es))
          .setTitle("❌ Please provide a valid Guild ID!")
        ]});
      let database = await client.database.get(key);
      if(database || !database) {
        client.checking[key] = true;
        console.log("First-Time-Setting: ", key)
        // ensure 
        client.database.set(key, true);
        await databasing(client, key);
        console.log("First-Time-Setting: DONE ", key)
        client.checking[key] = false
      } else {
        client.checking[key] = false; // set it to false, just to be sure
      }
      message.reply({embeds : [new MessageEmbed()
        .setColor(es.color)
        .setFooter(client.getFooter(es))
        .setTitle(`✅ Successfully setted up the \`${key}\` Guild!`)
      ]});
    } catch (e) {
      
      let keyerror = args[0];

      console.log(String(e.stack).dim.bgRed)
      return message.channel.send({embeds : [new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(client.getFooter(es))
        .setTitle(`❌ Failed to setup \`${keyerror}\` Guild!`)
        .setDescription("Something went wrong while setting up.")
      ]});
    }
  },
};
