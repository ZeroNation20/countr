module.exports = {
  description: "Quickly set up a counting channel. You only need to do this once.",
  usage: {},
  examples: {},
  aliases: [ "autosetup", "quicksetup", "configure" ],
  permissionRequired: 2, // 0 All, 1 Mods, 2 Admins, 3 Server Owner, 4 Bot Admin, 5 Bot Owner
  checkArgs: (args) => !args.length
};

module.exports.run = async (message, _, gdb) => {
  const { channel } = gdb.get();
  if (channel) {
    const overwrite = await new Promise(resolve => {
      message.channel.send("⚠️ This server has been set up before. If you continue, your old setup would no longer work. Are you sure you want to continue?\nType `yes` or `no` in chat.");
      message.channel.awaitMessages(m => m.author.id == message.author.id && ["yes", "no"].includes(m.content.toLowerCase()), { max: 1, time: 30000, errors: [ "time" ]})
        .then(collection => collection.first().content == "yes" ? resolve(true) : resolve(false))
        .catch(() => resolve(false));
    });
    if (!overwrite) return message.channel.send("✴️ New configuration canceled.");
  }

  if (!message.guild.me.hasPermission("MANAGE_CHANNELS")) return message.channel.send("❌ The bot is missing the `Manage Channels`-permission. Please fix the issue and retry.");

  const newChannel = await message.guild.channels.create("counting", {
    parent: message.channel.parent,
    rateLimitPerUser: 2,
    permissionOverwrites: [
      {
        id: message.client.user.id,
        allow: [
          "MANAGE_CHANNELS",
          "MANAGE_PERMISSIONS",
          "VIEW_CHANNEL",
          "SEND_MESSAGES",
          "MANAGE_MESSAGES",
          "EMBED_LINKS",
          "READ_MESSAGE_HISTORY",
          "MANAGE_WEBHOOKS"
        ]
      }
    ]
  });

  gdb.setMultiple({
    channel: newChannel.id,
    count: 0,
    user: "",
    message: message.id
  });

  return message.channel.send(`✅ ${newChannel} channel created! Happy counting!`);
};