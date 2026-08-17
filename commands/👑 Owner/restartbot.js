const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`${process.cwd()}/botconfig/config.json`);
const { exec } = require("child_process");
module.exports = {
  name: `restartbot`,
  category: `👑 Owner`,
  type: "bot",
  aliases: [`rb`],
  description: `Restart's the bot.`,
  usage: `restartbot`,
  run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    
    if (!config.adminIDS.includes(message.author.id))
      return message.channel.send({
        embeds: [new MessageEmbed()
          .setColor(es.wrongcolor)
          .setFooter(client.user.username, client.user.displayAvatarURL())
          .setTitle('**Your not an Owner/Manager of the Bot!**')
        ]
      })
    message.reply({
      embeds: [new MessageEmbed()
        .setColor(es.color).setThumbnail(es.thumb ? es.footericon && (es.footericon.includes("http://") || es.footericon.includes("https://")) ? es.footericon : client.user.displayAvatarURL() : null)
        .setFooter(client.getFooter(es))
        .setTitle('**BOT CLIENT**')
        .setDescription('Restarting the bot within __5 secs__...')
      ]
    });
    setTimeout(async function(){
    await client.destroy();
    exec('kill 1')
}, 5000);
  }
};