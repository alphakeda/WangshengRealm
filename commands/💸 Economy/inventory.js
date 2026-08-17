const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "inventory",
  category: "💸 Economy",
  aliases: ["inv", "bag"],
  description: "Inspect your inventory!",
  usage: "inventory [@USER]",
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
    let emo = require("../../emojis");
    let { pagination } = require("../../function/pagination");
    let number = require("../../function/numbers");
    const eco = require('../../schemas/economy');
    let shop = require("../../economy/shop");
    let inv = require('../../schemas/inv');
    let toTitleCase = require('../../function/toTitleCase')

    let member = message.mentions.members.first() || message.member;

    let inventory;
    try {
      inventory = await inv.findOne({
        User: member.id
      })
      if(!inventory) return message.reply(`**${member.user.username}'s inventory is empty!**`);
    } catch (e) {
      console.error(e)
    }

    function isEmpty(obj) {
    for(var prop in obj) {
    if(Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
      }
    }

      return JSON.stringify(obj) === JSON.stringify({});
    }

    let shopItem;
    let mapped;

    const findShopItem = (search) => shop.find( ({ items }) => items === search );

    for (const [key, value] of Object.entries(inventory.Inventory)) {
      shopItem = shop.find(value => value.items == key)
      mapped = Object.keys(inventory.Inventory).map(key => {
        return `${findShopItem(key).emoji} | **${key.toTitleCase()}** \`(${number(inventory.Inventory[key])})\` — ${findShopItem(key).rarity.toTitleCase()}\n${emo.line}**Type:** ${findShopItem(key). type.toTitleCase()}`
      })
    }

    let worth = Object.keys(inventory.Inventory).reduce((currentWorth, item) => {
      return findShopItem(item).price.buy * inventory.Inventory[item] + currentWorth
    }, 0)

    function formatCount(count = 0, withAbbr = false, decimals = 2) {
      const COUNT_ABBRS = [ '', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y' ];
        const i     = 0 === count ? count : Math.floor(Math.log(count) / Math.log(1000));
        let result  = parseFloat((count / Math.pow(1000, i)).toFixed(decimals));
        if(withAbbr) {
            result += `${COUNT_ABBRS[i]}`; 
        }
        return result;
    }

    let pageMax = 3

    let embed = new MessageEmbed()
    .setAuthor(`${member.user.username}'s inventory`, member.user.displayAvatarURL({dynamic:true}))
    
    .setDescription(`> ${message.author.id !== inventory.User ? `**${member.user.username}'s owned items**` : "**Owned Items:**"}\n${mapped.slice(0, pageMax).join("\n\n")}`)
    .setColor("F4C2C2")
    .setFooter(`${Object.keys(inventory.Inventory).length} items`)

    let embeds = [embed]

    Object.keys(inventory.Inventory).forEach((value, index) => {
      let indx = Math.floor((index++) + 1)
      let start = Math.floor(indx * pageMax)
      let end = Math.floor(start * 2)
      if(Object.keys(inventory.Inventory).length > (indx * pageMax)) {
        embeds.push(new MessageEmbed()
    .setAuthor(`${member.user.username}'s inventory`, member.user.displayAvatarURL({ dynamic:true }))
    
    .setDescription(`> ${message.author.id !== inventory.User ? `**${member.user.username}'s owned items**` : "**Owned Items:**"}\n${mapped.slice(start, end).join("\n\n")}`)
    .setColor("F4C2C2")
    .setFooter(`${Object.keys(inventory.Inventory).length} items`)
      )
      }
    })

    pagination({
      author: message.author,
      channel: message.channel,
      embeds: embeds,
      message, message,
      time: 60000,
      fastSkip: true
    })
  }
   
}
