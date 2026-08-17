const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const config = require(`${process.cwd()}/botconfig/config.json`);
var ee = require(`${process.cwd()}/botconfig/embed.json`);
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const { parseMilliseconds, duration, GetUser, nFormatter, ensure_economy_user } = require(`${process.cwd()}/handlers/functions`)
module.exports = {
  name: "multi",
  category: "💸 Economy",
  aliases: ["multi"],
  description: "Use spinner for more multi!",
  usage: "multi [@USER]",
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
    const multi = require("../../schemas/multi");
    
    const member = message.mentions.members.first() || message.guild.members.cache.find(member => member.user.username.toLowerCase() === args.join(" ").toLowerCase()) || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(member => member.displayName.toLowerCase() === args.join(" ").toLowerCase()) || message.member
    const usericon = member.user.avatarURL;

    let profile; 
    try {
      profile = await multi.findOne({
        User: member.id,
      })
      if(!profile) {
        
        if(member.user.bot) return;
        profile = await multi.create({
          User: member.id,
          Multi: 0,
          
        })
        profile.save()
      }
    }catch (e) {console.error(e)}


  const embed = new MessageEmbed()
    .setTitle(`${member.user.username}'s Multi`)
    .setDescription(`**Multi: \`${profile.Multi}%\` 🔘**`)
    .setFooter(`Use your spinner for more multi :)`)
  message.reply({embeds: [embed]})
  }    
}