const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const {MessageEmbed} = require("discord.js");
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "work",
  category: "💸 Economy",
  description: "Lets you work a job",
  usage: "work",
  type: "earn",
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {

    if (GuildSettings.ECONOMY === false && !config.ownerIDS.some(r => r.includes(message.author.id))) {
      return message.reply({embeds: [new MessageEmbed()
        .setColor(es.wrongcolor)
        .setFooter(client.getFooter(es))
        .setTitle(client.la[ls].common.disabled.title)
        .setDescription(require(`../../handlers/functions`).handlemsg(client.la[ls].common.disabled.description, {prefix: prefix}))
      ]});
    }
    
    //DEFINE COOLDOWN, TIMEOUT AND COMMAND INFO FOR MONGODB
    const prettyMilliseconds = require('pretty-ms');
    const cooldownSchema = require("../../schemas/cooldown");
    const eco = require('../../schemas/economy')

    let cooldown;
    let command = {
      name: "work",
      timeout: "60",
      cooldownMsg: { 
        title: "❌ You already worked a while ago!",
        description: `You can use this command again in **[timeleft]**`, 
        color: "RED"
      }
    }
    try {
      cooldown = await cooldownSchema.findOne({
        userID: message.author.id,
        commandName: command.name
      })

      if(!cooldown) {
        cooldown = await cooldownSchema.create({
          userID: message.author.id,
          commandName: command.name,
          cooldown: 0,
        })
        cooldown.save()
      }
    } catch (e) {
      console.error(e)
    }
    
    if(!cooldown || command.timeout * 1000 - (Date.now() - cooldown.cooldown) > 0) {
      let timecommand = prettyMilliseconds(command.timeout * 1000, { verbose: true, verbose :true })

        const timeleft = prettyMilliseconds(command.timeout * 1000 - (Date.now() - cooldown.cooldown), {verbose:true})

        let cooldownMessage =  command.cooldownMsg ? command.cooldownMsg.description : `> You can use this command every **${timecommand}**!\n> Try again in: **${timeleft}** `;

        let cooldownMsg = cooldownMessage.replace("[timeleft]", `${timeleft}`).replace("[cooldown]", `${timecommand}`).replace("[user]", `${message.author.username}`)

        let cooldownEmbed = new MessageEmbed()
        .setTitle(`${command.cooldownMsg ? command.cooldownMsg.title : "Slow Down!"}`)
        .setDescription(cooldownMsg)
        .setColor(`${command.cooldownMsg ? command.cooldownMsg.color : "RED"}`)
        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
        return message.reply({embeds: [cooldownEmbed]})
    } else {
      
      await cooldownSchema.findOneAndUpdate({
        userID: message.author.id,
        commandName: command.name
      }, {
        cooldown: Date.now()
      })
    }

    //COMMAND
    let number = require("../../function/numbers");

    let work = [
      'Programmer',
      'Builder',
      'Waiter',
      'Busboy',
      'Chief',
      'Mechanic', 
      "Prostitute", 
      "Stripper", 
      "Dancer",
      "Drawer",
      "Lawer",
      "Agent", 
      "Superman", 
      "Moderator", 
      "Gamer"
    ]
    
    let result = Math.floor((Math.random() * work.length));
    let amount = Math.floor(Math.random() * 3000) + 500 ;

    let profile;
    try {
      profile = await eco.findOne({
        userID: message.author.id,
      })
      if(!profile) {
        profile = await eco.create({
          userID: message.author.id,
          coins: 500,
          bank: 0
        })
        profile.save()
      }
    } catch (e) {
      console.error(e)
    }
    try {
    await eco.findOneAndUpdate(
        {
          userID: message.author.id,
        },
        {
          $inc: {
            coins: amount,
          },
        }
      );
    } catch (err) {
      console.log(err);
      }

    let embed = new MessageEmbed()
      .setTitle(`${message.author.username} worked!`)
      .setDescription(`You worked as a **` + work[Math.floor(Math.random() * work.length)] + `** and earned **⏣ ${number(amount)}**`)
      .setColor("GREEN")
    message.reply({embeds: [embed]})

  }
}