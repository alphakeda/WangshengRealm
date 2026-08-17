const Discord = require('discord.js');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "football",
  category: "💸 Economy",
  aliases: ["soccer", "ball"],
  description: "Earn coins by scoring a goal!",
  usage: "football",
  type: "game",
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
      name: "football",
      timeout: "50",
      cooldownMsg: { 
        title: "❌ You already played football a while ago!",
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

    let profile; 
    try {
      profile = await eco.findOne({
        userID: message.author.id,
      })
      if(!profile) {
        if(message.author.bot) return;
        profile = await eco.create({
          userID: message.author.id,
          coins: 500,
          bank: 0,
          maxBank: 1000
        })
        profile.save()
      }
    } catch (e) {
      console.error(e)
    }
     
    const positions = {
      LEFT: `🥅🥅🥅\n🕴_ _\n\n_ _     ⚽`,
      MIDDLE: `🥅🥅🥅\n_ _     🕴\n\n_ _     ⚽`,
      RIGHT: `🥅🥅🥅\n_ _           🕴\n\n_ _     ⚽`
    }

    let randomized = Math.floor(Math.random() * Object.keys(positions).length);
    let gameEnded = false;
    let randomPos = positions[Object.keys(positions)[randomized]];

    let leftbutton = new MessageButton()
    .setCustomId('LEFT')
    .setLabel('Left')
    .setStyle('SECONDARY')

    let middlebutton = new MessageButton()
    .setCustomId('MIDDLE')
    .setLabel('Middle')
    .setStyle('SECONDARY')

    let rightbutton = new MessageButton()
    .setCustomId('RIGHT')
    .setLabel('Right')
    .setStyle('SECONDARY')

    const row = new MessageActionRow()
    .addComponents(
      leftbutton.setDisabled(false).setStyle("DANGER"),
      middlebutton.setDisabled(false).setStyle("DANGER"),
      rightbutton.setDisabled(false).setStyle("DANGER")
    )

    let sentMsg = await message.reply({content: `Hit the Goal!\n${positions.MIDDLE}`, components: [row]})


    function update() {
			randomized = Math.floor(Math.random() * Object.keys(positions).length);
			randomPos = positions[Object.keys(positions)[randomized]];
		}
    
    setInterval(() => {
      if(gameEnded == false) return update()
    }, 100)


    let amount = Math.floor(Math.random() * 1000) + 250

    let embedWin = new MessageEmbed()
    .setTitle(`You Won!`)
    .setDescription(`${message.author.username} you won **⏣ ${number(amount)}** `)
    .setColor("GREEN")
    .setFooter(message.author.username, message.author.displayAvatarURL({dynamic:true}))
    .setTimestamp()

    let embedLoose = new MessageEmbed()
    .setTitle(`You Lost!`)
    .setDescription(`${message.author.username} you lost the football game! Try again... `)
    .setColor("RED")
    .setFooter(message.author.username, message.author.displayAvatarURL({dynamic:true}))
    .setTimestamp()

    const collector = message.channel.createMessageComponentCollector({ max:1, time: 15000 })

    let disabledrow = new MessageActionRow()
    .addComponents(
      leftbutton.setDisabled(true).setStyle("DANGER"),
      middlebutton.setDisabled(true).setStyle("DANGER"),
      rightbutton.setDisabled(true).setStyle("DANGER")
    )
    
    collector.on('collect', async i => {
      
      if(i.user.id !== message.author.id) return i.reply({content: `This is not your game! Start one by typing **${prefix}football**`, ephemeral: true})

      if(i.customId !== Object.keys(positions)[randomized]) {
        gameEnded = true;
        await i.update({ content: `**GOAL!**\n${randomPos}`, components: [disabledrow] })
          
        message.reply({ embeds: [embedWin], components: [], content: " " })
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
      } else if(i.customId == Object.keys(positions)[randomized]) {
        gameEnded = true;
        await i.update({ content: `Caught the ball!\n${randomPos}`, components: [disabledrow] })
        message.reply({ embeds: [embedLoose], components: [], content: " " })
      }
    })

    collector.on('end', async i => {
      if(!i.size) return sentMsg.edit({content: `Football Ended! No Interaction received...\n${positions.MIDDLE}`, components: [disabledrow]})
    })
  }
}