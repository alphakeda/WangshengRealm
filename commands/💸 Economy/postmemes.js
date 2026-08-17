const Discord = require('discord.js');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "postmemes",
  category: "💸 Economy",
  aliases: ["pm", "postmeme"],
  description: "Post a meme!",
  usage: "postmemes",
  type: "info",
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
      name: "postmemes",
      timeout: "90",
      cooldownMsg: { 
        title: "❌ Slow Down!",
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
    let emo = require("../../emojis");
    let inventory = require('../../schemas/inv');
    let shop = require("../../economy/shop");
    let toTitleCase = require('../../function/toTitleCase')
    
    let inv;
    try {
      inv = await inventory.findOne({
        User: message.author.id,
      }).clone()
    } catch (e) {
      console.error(e)
    }

    if(!inv || !inv.Inventory.laptop) return message.reply(`❌ **You need a laptop to use this command!**`)

    const findShopItem = (search) => shop.find( ({ items }) => items === search );

    emojiImg = `https://cdn.discordapp.com/emojis/883668711020560384.png?size=4096`;

    let embed = new MessageEmbed()
    .setTitle(`Post a meme!`)
    .setDescription(`**Pick a meme to post!**\n*Click the button to choose.*`)
    .setFooter(`${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
    .setColor("F4C2C2")
    .setTimestamp()
    .setThumbnail(emojiImg)

    let createButton = (label) => {
      let id = label.toUpperCase()
      return new MessageButton()
      .setCustomId(id)
      .setLabel(label)
      .setStyle('SUCCESS')
    }

    let New = createButton("New")
    let Repost = createButton(`Repost`)
    let Copypasta = createButton('Copypasta')
    let Relatable = createButton('Relatable')
    let Intellectual = createButton('Intellectual')

    let row = new MessageActionRow()
    .addComponents(
      New, Repost, Copypasta, Relatable, Intellectual
    )

    let sentMsg = await message.reply({ embeds: [embed], components: [row]})

    let collector = sentMsg.createMessageComponentCollector({
      time: 30000
    })

    let disabledRow = new MessageActionRow()
    .addComponents(
      New.setStyle("SECONDARY").setDisabled(true),
      Repost.setStyle("SECONDARY").setDisabled(true), Copypasta.setStyle("SECONDARY").setDisabled(true), Relatable.setStyle("SECONDARY").setDisabled(true), Intellectual.setStyle("SECONDARY").setDisabled(true)
    )

    collector.on('collect', async i => {
      if(i.user.id !== message.author.id) return i.reply({
        content: 'this is not for you!',
        ephemeral: true
      })
      let result = async(label) => {
        let amount = Math.floor(Math.random() * (2 + 3500 - 900) + 1500)
        let chances = Math.floor(Math.random() * (20 - 1) + 1)
        console.log(chances)
        if(chances !== 10) {
          let resultArray = [
            `You posted a poggo meme!!!`,
            `Your meme was decent`,
            `You posted a decent meme!`,
            `Your meme wasnt bad!`,
            `everyone loves your meme!`,
            `your meme was very funny`
          ]
          
          let memegood = [
            `https://c.tenor.com/irVofgT8JBYAAAAS/cat-cute-cat.gif`,
            `https://c.tenor.com/rgNhzkA41qIAAAAS/catjam-cat-jamming.gif`,
            `https://c.tenor.com/UpTzOIi2z-sAAAAS/cat-the-cat.gif`
          ]

          let resultEmbed = new MessageEmbed()
          .setAuthor(`${message.author.username} posted a new meme!`)
          .setDescription(`${resultArray[Math.floor(Math.random() * resultArray.length)]}\nYou got **⏣ ${number(amount)}**`)
          .setFooter(label, message.author.displayAvatarURL({ dynamic: true }))
          .setColor("GREEN")
          .setThumbnail(`${memegood[Math.floor(Math.random() * memegood.length)]}`)
          .setTimestamp()
          i.update({embeds: [resultEmbed], components: [disabledRow]})
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
        } else {
          
          let memebad = [
            `https://c.tenor.com/UpTzOIi2z-sAAAAS/cat-the-cat.gif`,
            `https://c.tenor.com/NQfq1liFH-8AAAAS/byuntear-sad.gif`,
            `https://c.tenor.com/iBf8Got1R-gAAAAS/beluga-the-cat-hakosh1307.gif`
          ]

            let resultEmbed = new MessageEmbed()
            .setTitle(`You posted a trash meme`)
            .setDescription(`Your followers broke your laptop! Buy a new one`)
            .setFooter(label, message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setColor("RED")
            .setThumbnail(`${memebad[Math.floor(Math.random() * memebad.length)]}`)
            i.update({embeds: [resultEmbed], components: [disabledRow]})
            let params = {
              User: message.author.id
            }
            await inventory.findOne(params, async(err, data) => {
                if((data.Inventory["laptop"] - 1) >= 1) {
                  data.Inventory["laptop"] = data.Inventory["laptop"] - 1;
                } else {
                    if(Object.keys(data.Inventory).length === 1) {
                    await inventory.deleteOne(params)
                  } else {
                      delete data.Inventory["laptop"]
                    }
                }
                await inventory.findOneAndUpdate(params, data)
            }).clone()
          }
        }
          result(`${i.customId.toTitleCase()}`)
      },
    
    collector.on('end', async i => {
      if(!i.size) return sentMsg.edit({content: `Postmemes ended! No Interaction received...`, embeds: [embed], components: [disabledRow]})
    })
    
    )
  }
}