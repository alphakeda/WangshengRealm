const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "search",
  category: "💸 Economy",
  description: "Search some places and hopefully get some money!",
  usage: "search",
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
      name: "search",
      timeout: "50",
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
     
    const locations = [
      {
        name: "car",
        messages: ["You found [amount] in your car! 🚙", "You left [amount] in your car!", "You checked in your car and found [amount]", "You found [amount] under your car seat", "You searched your car and found [amount]!", "You found [amount] somewhere in the car", "You searched and found [amount] in the car"]
      },
      {
        name: "grass",
        messages: ["You found [amount] in the grass!", "You found [amount], I wonder if the dog shat these out", "You searched the grass and found [amount]!", "You found [amount] somewhere in the grass", "You searched and found [amount] in the grass"]
      },
      {
        name: "bathroom",
        messages: ["You searched the bathroom and found [amount]", "You found [amount] in your bathroom! What were You doing in there?", "You found [amount] in your bathtub xD", "You found [amount] in your sink!", "You found [amount] somewhere in the bathroom", "You searched and found [amount] in the bathroom"]
      },
      {
        name: "dumpster",
        messages: ["someone left [amount] in the dumpster", "You found [amount] in the dumpster", "You found [amount] somewhere in the dumpster", "You searched in the dumpster and found [amount]!", "You searched and found [amount] in the dumpster"]
      },
      {
        name: "sewer",
        messages: ["You searched the sewer and found [amount]", "You found [amount] in the sewer!", "You searched and found [amount] in the sewer"]
      },
      {
        name: "park",
        messages: ["You searched the park and found [amount]", "You found [amount] in the park!", "You searched and found [amount] in the park", "someone left [amount] in the park!"]
      },
      {
        name: "carpet",
        messages: ["You searched the carpet and found [amount]", "You found [amount] under the carpet!", "You searched and found [amount] under the carpet", "someone left [amount] under the carpet, I wonder how long its been there"]
      },
      {
        name: "pocket",
        messages: ["You searched your pocket and found [amount]", "You found [amount] in the your pocket!", "You searched and found [amount] in your pocket"]
      },
      {
        name: "washer",
        messages: ["You searched the washer and found [amount]", "You found [amount] in the washer!", "You searched and found [amount] in the washer", "someone left [amount] in the washer"]
      },
      {
        name: "coat",
        messages: ["You searched the coat and found [amount]", "You found [amount] in the coat!", "You searched and found [amount] in the coat", "You found [amount], wonder how long that's been there!"]
      }
    ];

    const chosenLocations = locations.sort(() => Math.random() - Math.random()).slice(0, 3);

    let search1 = new MessageButton()
    .setCustomId(`${chosenLocations[0].name}`)
    .setStyle(`PRIMARY`)
    .setLabel(`${chosenLocations[0].name}`)

    let search2 = new MessageButton()
    .setCustomId(`${chosenLocations[1].name}`)
    .setStyle(`PRIMARY`)
    .setLabel(`${chosenLocations[1].name}`)

    let search3 = new MessageButton()
    .setCustomId(`${chosenLocations[2].name}`)
    .setStyle(`PRIMARY`)
    .setLabel(`${chosenLocations[2].name}`)

    let searchRow = new MessageActionRow()
    .addComponents(
      search1, search2, search3
    )

    let disabled1 = new MessageButton()
    .setCustomId(`${chosenLocations[0].name}`)
    .setStyle(`PRIMARY`)
    .setLabel(`${chosenLocations[0].name}`)
    .setDisabled(true)

    let disabled2 = new MessageButton()
    .setCustomId(`${chosenLocations[1].name}`)
    .setStyle(`PRIMARY`)
    .setLabel(`${chosenLocations[1].name}`)
    .setDisabled(true)
    
    let disabled3 = new MessageButton()
    .setCustomId(`${chosenLocations[2].name}`)
    .setStyle(`PRIMARY`)
    .setLabel(`${chosenLocations[2].name}`)
    .setDisabled(true)
    
    let disabledrow = new MessageActionRow()
    .addComponents(
      disabled1, disabled2, disabled3
    )

    let sentMsg = await message.reply({content: `**${message.author.username},** where do you want to search?\n*pick an option below to start searching that location!*`, components: [searchRow]})

    let collector = sentMsg.createMessageComponentCollector({
      time: 30000,
      max: 1
    })

    let amount = Math.floor(Math.random() * (1500 - 500 + 1) + 500);

    collector.on('collect', async i => {
      let sendEmbed = async (location) =>  {
        let embed = new MessageEmbed()
        .setTitle(`${message.author.username} searched the ${location.name}!`)
        .setDescription(location.messages[Math.floor(Math.random() * location.messages.length)].replace("[amount]", `**⏣ ${number(amount)}**`))
        .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor("GREEN")
        i.update({embeds: [embed], components: [], content: " "})
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
      }
      if(i.user.id !== message.author.id) return i.reply({
        content: "❌ **You can't interact with this!**",
        ephemeral: true
      })
      if(i.customId == chosenLocations[0].name) return sendEmbed(chosenLocations[0])
      if(i.customId == chosenLocations[1].name) return sendEmbed(chosenLocations[1])
      if(i.customId == chosenLocations[2].name) return sendEmbed(chosenLocations[2])
    })
  collector.on('end', async i => {
      if(!i.size) return sentMsg.edit({content: `Search ended! No Interaction received...`, components: [disabledrow]})
  })
  }
}
