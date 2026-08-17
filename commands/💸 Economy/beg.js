const { MessageEmbed } = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "beg",
  category: "💸 Economy",
  description: "earn your beg cash",
  usage: "beg",
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
    const eco = require('../../schemas/economy');

    let cooldown;
    let command = {
      name: "beg",
      timeout: "20",
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
    let number = require("../../function/numbers")

    let people = [
      "Taylor Swift",
      "Drake",
      "Justin Bieber",
      "Fisherman",
      "Your Mom",
      "Driver",
      "Police",
      "Leonardo da Vinci",
      "Robert Downey Jr.",
      'Dwayne Johnson',
      'Adele',
      'Olivia Rodrigo',
      'Travis Scott',
      'Cardi B',
      'Harry Styles',
      'Wangsheng Manager',
      'Dua Lipa',
      'Ed Sheeran',
      'Camila Cabello',
      'Shown Mendes',
      'Boba',
      'Scarlet Potato',
      'Rick Astley'
    ]
     
    let desc
    let colorr
    let chances = Math.floor(Math.random() * 5) >= 2 ? true : false
    if(chances == true) {
      let amount = Math.floor(Math.random() * (1+1500-400) + 400)
      colorr = "GREEN";
      desc = [
        `Here take **⏣ ${number(amount)}**`,
        `Aww u poor little beggar, take **⏣ ${number(amount)}**`,
        `Here take this **⏣ ${number(amount)}**`,
        `Here take this **⏣ ${number(amount)} coins**`,
        `You got **⏣ ${number(amount)} for begging**`,
        `Imagine begging and got **⏣ ${number(amount)}**`,
        `Woah u begged and got **⏣ ${number(amount)}**`,
        `You begged at despite being a stranger and got **⏣ ${number(amount)}**`,
        `You begged sincerely and got **⏣ ${number(amount)}**`
      ]
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
      let amount = Math.floor(Math.random() * (1+1500-400) + 400)
      colorr = "RED";
      desc = [
        `Imagine begging`,
        `Lmao u get nothing.`,
        `Ewww imagine begging for coins`,
        `"No."`,
        `You begged and you got nothing!`,
        `You got nothing from begging lol`,
        `Go get a life! stop begging`,
        `Ew beggars!! go away!!`,
        `Here take this **⏣ ${number(amount)}**.. Sike! you get nothing`,
        `Stop begging!!`,
        `Get a job and earn your own money`
      ]
    }

    let embed = new MessageEmbed()
    .setTitle(people[Math.floor(Math.random() * desc.length)])
    .setDescription(desc[Math.floor(Math.random() * desc.length)])
    .setColor(colorr)
    .setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
    message.reply({embeds: [embed]})
  }
}