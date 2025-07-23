module.exports.config = {
    name: "help",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "Perplexity AI (Adapted from Mirai Team)",
    description: "Shows all available commands or info about a specific command.",
    commandCategory: "system",
    usages: "[command name]",
    cooldowns: 5,
};

module.exports.run = async function({ api, event, args }) {
    const { commands } = global.client;
    const { threadID, messageID } = event;
    const command = commands.get((args[0] || "").toLowerCase());
    const prefix = global.config.PREFIX;

    // যদি কোনো নির্দিষ্ট কমান্ডের জন্য help চাওয়া হয়
    if (command) {
        const { name, version, hasPermssion, credits, description, commandCategory, usages, cooldowns } = command.config;
        
        let permText = "";
        if (hasPermssion === 1) permText = "Group Admin";
        else if (hasPermssion === 2) permText = "Bot Admin";
        else permText = "User";

        const helpMessage = `
━━ 『 Command Info 』 ━━
⦿ Name: ${name}
⦿ Description: ${description}
⦿ Category: ${commandCategory}
⦿ Version: ${version}
⦿ Usage: ${prefix}${name} ${usages}
⦿ Permission: ${permText}
⦿ Cooldown: ${cooldowns} seconds
⦿ Credits: ${credits}
        `;
        return api.sendMessage(helpMessage, threadID, messageID);
    }

    // যদি সব কমান্ডের তালিকা চাওয়া হয়
    const categories = {};
    for (const cmd of commands.values()) {
        const category = cmd.config.commandCategory || "No Category";
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(cmd.config.name);
    }

    let msg = `
🌸┌─────────────────┐🌸
      🌟│  Ayan bot 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬   │🌟
      🌸└─────────────────┘🌸

✨ 𝓣𝓸𝓽𝓪𝓵 𝓒𝓸𝓶𝓶𝓪𝓷𝓭𝓼: ${commands.size}
🦋 𝓟𝓻𝓮𝓯𝓲𝔁: [ ${prefix} ]
🎀𝐉𝐨𝐢𝐧 𝐨𝐮𝐫 𝐌𝐚𝐢𝐧 𝐠𝐜: [error]

      🌼═══════════════💌
`;

    const sortedCategories = Object.keys(categories).sort();

    for (const category of sortedCategories) {
        msg += `
🖤┌───【 ${category.toUpperCase()} 】───┐🦋
🎀 │ ${categories[category].join('  ✧  ')}
🌷└─────────────────┘🌸
`;
    }

    msg += "\n📌 Type " + `"${prefix}help [command name]"` + " to get details about a specific command.";

    return api.sendMessage(msg, threadID, messageID);
};
