var {
  Manager
} = require("erela.js");
var {
  Permissions
} = require("discord.js");
var Spotify = require("erela.js-spotify");
var AppleMusic = require("erela.js-apple");
var Deezer = require("erela.js-deezer");
var Facebook = require("erela.js-facebook");
var config = require(`${process.cwd()}/botconfig/config.json`);
var settings = require(`${process.cwd()}/botconfig/settings.json`);

clientID = process.env.clientID || config.spotify.clientID,
  clientSecret = process.env.clientSecret || config.spotify.clientSecret;
module.exports = (client) => {
  if ((!clientID || clientID.length < 5) || (!clientSecret || clientSecret.length < 5)) {
    client.manager = new Manager({
      nodes: collect(config.clientsettings.nodes),
      plugins: [
        new Deezer(),
        new Facebook(),
        new AppleMusic(),
      ],
      send(id, payload) {
        var guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
    });
  } else {
    client.manager = new Manager({
      nodes: collect(config.clientsettings.nodes),
      plugins: [
        new Spotify({
          clientID, //get a clientID from there: https://developer.spotify.com/dashboard
          clientSecret
        }),
        new Deezer(),
        new Facebook(),
        new AppleMusic(),
      ],
      send(id, payload) {
        var guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
    });
  }
  //require the other events
  require("./node_events")(client)
  require("./events")(client)
  require("./musicsystem")(client)
  require("./client_events")(client)

  //Log information
  console.log(`Erela client is now established!`.brightGreen);

};
function collect(node) {
    return node.map(x => {
        
      if (!x.host) throw new RangeError('"host" must be provided');
      if (!x.password) throw new RangeError('"password" must be provided');
      if (typeof x.port !== 'number') throw new RangeError('"port" must be a number');
      if (typeof x.secure !== 'boolean') throw new RangeError('Secure must be a boolean');

      return {
          host: x.host ? x.host : 'n1.lavalink.milrato.com',
          password: x.password ? x.password : 'discord.gg/milrato',
          port: x.port && !isNaN(x.port) ? Number(x.port) : 10350,
          identifier: x.identifier || x.host,
          retryAmount: x.retryAmount ? Number(x.retryAmount) : 120,
          retryDelay: x.retryDelay ? Number(x.retryDelay) : 15000,
          secure: x.secure ? x.secure : false
      };
    });
}