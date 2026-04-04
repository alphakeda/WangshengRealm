const { Manager } = require("erela.js");
const { EmbedBuilder } = require("discord.js");
const config = require("../botconfig/config.json");

module.exports = (client) => {
    client.manager = new Manager({
        nodes: config.nodes,
        send(id, payload) {
            const guild = client.guilds.cache.get(id);
            if (guild) guild.shard.send(payload);
        },
    })
    .on("nodeConnect", (node) => console.log(`[LAVALINK] Node ${node.options.identifier} connected.`))
    .on("trackStart", async (player, track) => {
        const channel = client.channels.cache.get(player.textChannel);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle("🎶 Currently Playing")
            .setDescription(`**[${track.title}](${track.uri})**`)
            .setThumbnail(track.displayThumbnail("maxresdefault"))
            .addFields(
                { name: "Duration", value: `\`${format(track.duration)}\``, inline: true },
                { name: "Requested By", value: `${track.requester}`, inline: true }
            )
            .setColor("Blurple")
            .setFooter({ text: `Queue Length: ${player.queue.length} songs` });

        // Logic to update the "Player Message" in a dedicated channel
        if (config.musicChannelID === channel.id) {
            const lastMsg = player.get("last_msg");
            if (lastMsg) {
                try {
                    const msg = await channel.messages.fetch(lastMsg);
                    await msg.edit({ embeds: [embed] });
                } catch (e) {
                    const msg = await channel.send({ embeds: [embed] });
                    player.set("last_msg", msg.id);
                }
            } else {
                const msg = await channel.send({ embeds: [embed] });
                player.set("last_msg", msg.id);
            }
        } else {
            channel.send({ embeds: [embed] });
        }
    });

    client.on("raw", (d) => client.manager.updateVoiceState(d));
};

function format(millis) {
    const h = Math.floor(millis / 3600000), m = Math.floor(millis / 60000) % 60, s = Math.floor(millis / 1000) % 60;
    return [h, m, s].map(v => v < 10 ? "0" + v : v).filter((v, i) => v !== "00" || i > 0).join(":");
}