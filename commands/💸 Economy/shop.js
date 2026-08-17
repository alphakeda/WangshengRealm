const Discord = require('discord.js');
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "shop",
  category: "💸 Economy",
  aliases: ["store"],
  description: "Shows the Store",
  usage: "shop",
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

    //COMMAND
    const eco = require('../../schemas/economy');
    let items = require("../../economy/shop");
    let inv = require('../../schemas/inv');
    let toTitleCase = require('../../function/toTitleCase');
    const {pagination } = require("../../function/pagination");
    let number = require("../../function/numbers");
    let emo = require("../../emojis")
    
    let inventory;
    try {
      inventory = await inv.findOne({
        User: message.author.id
      })
    } catch (e) {
      console.error(e)
    }

    if(args[0]) {
    let mentionedItem = args.join(" ").replace(" ", "").toLowerCase()
    let owned;
    if(inventory) {
      if(inventory.Inventory[mentionedItem]) {
        owned = inventory.Inventory[mentionedItem]
      } else {
        owned = 0
      }
    } else {
      owned = 0
    }
      const findShopItem = (search) => items.find( ({ items }) => items.toLowerCase() === search );

      let item = findShopItem(mentionedItem)

      if(!item) return message.reply(`I can't find item named ${mentionedItem} uhm!`)

      const emoji = Discord.Util.parseEmoji(item.emoji);
      let emojiImg;
      emojiImg = `https://cdn.discordapp.com/emojis/883668711020560384.png?size=4096`;

      let embed = new MessageEmbed()
      .setThumbnail(emojiImg)
      .setTitle(`${item.items.toTitleCase()} \`(${owned !== 0 ? number(owned) : owned} Owned)\``)
      .setDescription(`${item.desc}`)
      .addField(`BUY:`, `\`\`\`yaml\n${item.price.buy !== 0 ? `⏣ ${number(item.price.buy)}` : "..."} \`\`\``, true)
      .addField(`SELL:`, `\`\`\`yaml\n${item.price.sell !== 0 ? `⏣ ${number(item.price.sell)}` : "..."} \`\`\``, true)
      .setColor(item.rarity == 'common' ? '#303136' : item.rarity == 'uncommon' ? 'GREEN' : item.rarity == 'rare' ? 'BLUE' : item.rarity == 'epic' ? 'PURPLE' : item.rarity == 'legendary' ? 'ORANGE' : '#F4c2c2')
      .setFooter(`Item Rarity: ${item.rarity.toTitleCase()}`)

      let buy = new MessageButton()
      .setLabel(`BUY ⏣ ${number(item.price.buy)}`)
      .setCustomId(`BUY`)
      .setStyle('PRIMARY')
      .setEmoji(`${item.emoji}`)
      let sell = new MessageButton()
      .setLabel(`Sell ⏣ ${number(item.price.sell)}`)
      .setCustomId(`SELL`)
      .setStyle('DANGER')
      .setEmoji(`${item.emoji}`)
      let row = new MessageActionRow()
      .addComponents(
        buy
      )
      let disabledrow = new MessageActionRow()
      .addComponents(
        buy.setDisabled(true)
      )

      
      let sentMsg = await message.reply({embeds: [embed], components: [item.price.buy !== 0 ? row : disabledrow]})      
      const collector = sentMsg.createMessageComponentCollector({
        time: 60000
      })

      collector.on('collect', async i => {
        if(i.customId == 'BUY') {
        let amountToBuy = 1
        let profile;
    try {
      profile = await eco.findOne({
        userID: i.user.id,
      })
      if(!profile) {
        if(member.user.bot) return;
        profile = await eco.create({
          userID: i.user.id,
          coins: 500,
          bank: 0
        })
        profile.save()
      }
    } catch (e) {
      console.error(e)
    }

    let itemToBuy = args[0].toLowerCase()

    const itemPrice = items.find((val) => (val.items.toLowerCase()) === itemToBuy).price.buy * amountToBuy

    const userBalance = profile.coins;
    if(userBalance < itemPrice) return i.reply({content: `❌ **You dont have enough coins to buy this!**`, ephemeral: true})

    const params = {
      User: i.user.id
    }

    function isEmpty(obj) {
  for(var prop in obj) {
    if(Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
      }
    }

      return JSON.stringify(obj) === JSON.stringify({});
    }

    inv.findOne(params, async(err, data) => {
      if(data && !isEmpty(data.Inventory)) {
        const hasItem = Object.keys(data.Inventory).includes(itemToBuy)
        if(!hasItem) {
          data.Inventory[itemToBuy] = amountToBuy;
        } else {
          data.Inventory[itemToBuy] = data.Inventory[itemToBuy] + amountToBuy;
        }
        await inv.findOneAndUpdate(params, data)
      } else {
        new inv({
          User: i.user.id,
          Inventory: {[itemToBuy]: amountToBuy}
        }).save()
      }
      i.reply({content: `You bought **${amountToBuy} ${itemToBuy}** for **⏣ ${number(itemPrice)}**! Woah!`, ephemeral: true})
      try {
    await eco.findOneAndUpdate(
        {
          userID: i.user.id,
        },
        {
          $inc: {
            coins: -itemPrice,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
    })
        } 
        if(i.customId == 'SELL') {
          
        }
      })

      collector.on('end', async () => {
        sentMsg.edit({components: [disabledrow]}).catch()
      })
    } else {
     
    if(items.length === 0) return message.reply(`**❌ There's currently nothing for sale!**`)


    items = items.filter(val => val.price.buy !== 0).sort((a, b) => a.price.buy - b.price.buy)

    let pageMax = 3

    const shopList = items.map((v, i) => {
      let price = v.price.buy
      return `${v.emoji} | **${v.items.toTitleCase()}** — \`⏣${v.price.buy}\`\n${emo.line}${v.desc}`
    })

    function formatCount(count, withAbbr = false, decimals = 2) {
      const COUNT_ABBRS = [ '', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y' ];
        const i     = 0 === count ? count : Math.floor(Math.log(count) / Math.log(1000));
        let result  = parseFloat((count / Math.pow(1000, i)).toFixed(decimals));
        if(withAbbr) {
            result += `${COUNT_ABBRS[i]}`; 
        }
        return result;
    }
    emojiImg = `https://cdn.discordapp.com/emojis/883668711020560384.png?size=4096`;

    let embed = new MessageEmbed()
    .setAuthor(`SHOP`)
    .setTitle(`> __Shop Items:__`)
    .setThumbnail(emojiImg)
    .setDescription(`\n${shopList.slice(0, pageMax).join("\n\n")}`)
    .setColor("FFFFF0")

    let embeds = [embed]

    items.forEach((value, ind) => {
      let indx = Math.floor((ind++) + 1)
      let start = Math.floor(indx * pageMax)
      let end = Math.floor(start * 2)
      if(items.length > (indx * pageMax)) {
        embeds.push(new MessageEmbed()
    .setAuthor(`SHOP`)
    .setTitle(`> __Shop Items:__`)
    .setThumbnail(emojiImg)
    .setDescription(`\n${shopList.slice(start, end).join("\n\n")}`)
    .setColor("FFFFF0"))
      }
    })

    function abbreviateNumber(value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ["", "K", "M", "B","T"];
        var suffixNum = Math.floor( (""+value).length/3 );
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
            if (dotLessShortValue.length <= 2) { break; }
        }
        if (shortValue % 1 != 0)  shortValue = shortValue.toFixed(1);
        newValue = shortValue+suffixes[suffixNum];
    }
    return newValue;
    }

    pagination({
      author: message.author,
      channel: message.channel,
      embeds: embeds,
      message, message,
      time: 60000,
      fastSkip: true,
      resetTimerOnClick: true
    })
    
    }
  }
}