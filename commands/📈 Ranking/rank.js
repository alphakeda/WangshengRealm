//Here the command starts
const {
	MessageEmbed,
	MessageButton,
	MessageActionRow,
	MessageAttachment
  } = require('discord.js')
const config = require(`../../botconfig/config.json`)
var ee = require(`../../botconfig/embed.json`)
module.exports = {
	//definition
	name: "rank", //the name of the command 
	category: "📈 Ranking", //the category this will be listed at, for the help cmd
	aliases: [""], //every parameter can be an alias
	cooldown: 4, //this will set it to a 4 second cooldown
	usage: "rank [@User]", //this is for the help command for EACH cmd
  	description: "Shows the Rank of a User", //the description of the command
	type: "info",
	//running the command with the parameters: client, message, args, user, text, prefix
  	run: async (client, message, args, cmduser, text, prefix, player, es, ls, GuildSettings) => {
    
		if (GuildSettings.RANKING === false && !config.ownerIDS.some(r => r.includes(message.author.id))) {
			return message.reply({embeds: [new MessageEmbed()
				.setColor(es.wrongcolor)
				.setFooter(client.getFooter(es))
				.setTitle(client.la[ls].common.disabled.title)
				.setDescription(require(`../../handlers/functions`).handlemsg(client.la[ls].common.disabled.description, {prefix: prefix}))
			]});
		}
	}
}
//-CODED-BY-keda テ#0216-//