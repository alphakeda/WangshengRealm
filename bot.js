const { Client, GatewayIntentBits, EmbedBuilder, Collection } = require("discord.js");
const mongoose = require("mongoose");
const config = require("./botconfig/config.json");
const User = require("./models/User");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Welcome Logic
client.on("guildMemberAdd", async (member) => {
    const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === "welcome");
    if (!welcomeChannel) return;
    
    const embed = new EmbedBuilder()
        .setTitle("Welcome to the Realm!")
        .setDescription(`Hello ${member}, welcome to **${member.guild.name}**! You are our #${member.guild.memberCount} member.`)
        .setThumbnail(member.user.displayAvatarURL())
        .setColor("Gold")
        .setTimestamp();
        
    welcomeChannel.send({ embeds: [embed] });
});

// XP & Economy Handler
client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    let data = await User.findOne({ guildID: message.guild.id, userID: message.author.id });
    if (!data) data = await User.create({ guildID: message.guild.id, userID: message.author.id });

    // Ranking Logic
    const xpAdd = Math.floor(Math.random() * 10) + 5;
    data.xp += xpAdd;
    data.totalMessages += 1;
    
    const nextLevel = data.level * 150;
    if (data.xp >= nextLevel) {
        data.level++;
        message.reply(`🎉 **LEVEL UP!** You are now level **${data.level}**!`);
    }
    await data.save();

    // Command Logic
    if (!message.content.startsWith(config.prefix)) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    // --- Economy Commands ---
    if (cmd === "bal") {
        return message.reply(`💰 **Wallet:** $${data.money} | **Bank:** $${data.bank}`);
    }

    if (cmd === "work") {
        const timeout = 3600000; // 1 hour
        if (Date.now() - data.lastWork < timeout) return message.reply("You're tired! Wait an hour.");
        const earned = Math.floor(Math.random() * 200) + 50;
        data.money += earned;
        data.lastWork = Date.now();
        await data.save();
        return message.reply(`🔨 You worked and earned **$${earned}**!`);
    }

    if (cmd === "daily") {
        const timeout = 86400000; // 24 hours
        let lastDaily = data.lastDaily || 0;
        if (Date.now() - lastDaily < timeout) return message.reply("You already claimed your daily reward!");
        
        const reward = 1000;
        data.money += reward;
        data.lastDaily = Date.now();
        await data.save();
        return message.reply(`💸 You claimed your daily reward of **$${reward}**!`);
    }

    if (cmd === "beg") {
        const timeout = 60000; // 1 minute
        if (Date.now() - data.lastBeg < timeout) return message.reply("Stop begging so much, try again in a minute.");
        
        const amount = Math.floor(Math.random() * 50) + 10;
        data.money += amount;
        data.lastBeg = Date.now();
        await data.save();
        return message.reply(`🥺 A kind stranger gave you **$${amount}**.`);
    }

    if (cmd === "pay") {
        const target = message.mentions.members.first();
        const amount = parseInt(args[1]);
        if (!target || isNaN(amount) || amount <= 0) return message.reply("Usage: `!pay @user amount`.");
        if (data.money < amount) return message.reply("You don't have enough money!");

        let targetData = await User.findOne({ guildID: message.guild.id, userID: target.id });
        if (!targetData) targetData = await User.create({ guildID: message.guild.id, userID: target.id });

        data.money -= amount;
        targetData.money += amount;
        await data.save();
        await targetData.save();
        return message.reply(`✅ Sent **$${amount}** to ${target.user.tag}.`);
    }

    // --- Music Commands ---
    if (cmd === "play") {
        const channel = message.member.voice.channel;
        if (!channel) return message.reply("Join a VC first!");
        
        const player = client.manager.create({
            guild: message.guild.id, voiceChannel: channel.id, textChannel: message.channel.id, selfDeafen: true
        });

        if (player.state !== "CONNECTED") player.connect();
        const search = args.join(" ");
        const res = await client.manager.search(search, message.author);
        
        player.queue.add(res.tracks[0]);
        if (!player.playing && !player.paused && !player.queue.size) player.play();
        return message.reply(`🎵 Added **${res.tracks[0].title}** to the queue.`);
    }

    // --- Admin Commands ---
    if (cmd === "kick") {
        if (!message.member.permissions.has("KickMembers")) return message.reply("No perms!");
        const target = message.mentions.members.first();
        if (!target) return message.reply("Mention someone!");
        await target.kick();
        return message.reply(`✅ ${target.user.tag} has been kicked.`);
    }

    if (cmd === "ban") {
        if (!message.member.permissions.has("BanMembers")) return message.reply("You lack permissions.");
        const target = message.mentions.members.first();
        if (!target) return message.reply("Please mention a user to ban.");
        if (target.roles.highest.position >= message.member.roles.highest.position) return message.reply("You cannot ban someone with a higher or equal role.");
        
        await target.ban({ reason: args.slice(1).join(" ") || "No reason provided" });
        return message.reply(`🔨 **${target.user.tag}** has been banned.`);
    }

    if (cmd === "clear" || cmd === "purge") {
        if (!message.member.permissions.has("ManageMessages")) return message.reply("You lack permissions.");
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) return message.reply("Provide a number between 1 and 100.");
        
        await message.channel.bulkDelete(amount, true);
        const msg = await message.channel.send(`🧹 Deleted \`${amount}\` messages.`);
        setTimeout(() => msg.delete(), 3000); // Auto-delete the confirmation
    }

    // --- Ranking Commands ---
    if (cmd === "rank") {
        return message.reply(`📊 **Rank Info:** Level ${data.level} | XP: ${data.xp}/${data.level * 150}`);
    }
    // award XP every 5 minutes if they are in a voice channel
    setInterval(async () => {
        client.guilds.cache.forEach(async (guild) => {
            guild.channels.cache.filter(c => c.isVoiceBased()).forEach(async (channel) => {
                channel.members.forEach(async (member) => {
                    if (member.user.bot || member.voice.mute || member.voice.deaf) return;

                    let data = await User.findOne({ guildID: guild.id, userID: member.id });
                    if (data) {
                        data.xp += 10; // Award 10 XP
                        data.voiceXP += 10;
                        if (data.xp >= data.level * 150) {
                            data.level++;
                        }
                        await data.save();
                    }
                });
            });
        });
    }, 300000); // 300,000ms = 5 minutes

    if (cmd === "lb" || cmd === "leaderboard") {
        const topUsers = await User.find({ guildID: message.guild.id }).sort({ xp: -1 }).limit(10);
        
        const lbEmbed = new EmbedBuilder()
            .setTitle(`🏆 ${message.guild.name} Leaderboard`)
            .setColor("Gold")
            .setDescription(
                topUsers.map((user, index) => {
                    return `**${index + 1}.** <@${user.userID}> - Level \`${user.level}\` (${user.xp} XP)`;
                }).join("\n")
            )
            .setFooter({ text: "Keep chatting to climb the ranks!" });

        return message.channel.send({ embeds: [lbEmbed] });
    }
});

// Database & Manager Init
mongoose.connect(config.mongoURI).then(() => console.log("MongoDB Connected"));
require("./handlers/erela_manager")(client);
client.login(config.token);