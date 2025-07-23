const fs = require("fs");

module.exports = {
    name: "help",
    description: "View command information with an enhanced interface.",
    permission: 0,
    cooldown: 5,
    
    // দ্রষ্টব্য: এই কোডটি ধরে নিচ্ছে যে আপনার Mirai bot instance ('bot') এর মধ্যে নিম্নলিখিত বৈশিষ্ট্যগুলো আছে:
    // - bot.commands: একটি Map, যেখানে সব রেজিস্টার্ড কমান্ড আছে (key: কমান্ডের নাম, value: কমান্ড অবজেক্ট)।
    // - bot.aliases: একটি Map, যেখানে alias থেকে মূল কমান্ডের নাম পাওয়া যায়।
    // - bot.prefix: বটের বর্তমান প্রিফিক্স।
    // আপনার বটের কাঠামো অনুযায়ী এই অংশগুলো পরিবর্তন করতে হতে পারে।

    async execute(bot, event, args) {
        const { commands, aliases, prefix } = bot; // আপনার bot অবজেক্ট থেকে কমান্ড ও প্রিফিক্স নিন
        const commandName = args[0]?.toLowerCase();

        // ছবি URL (আপনার পছন্দের ব্যানার)
        const bannerUrl = "https://i.imgur.com/ukbnuXS.png"; // ব্যানার ইমেজ URL

        // 1. নির্দিষ্ট ক্যাটাগরির কমান্ড দেখানোর জন্য (help c <category>)
        if (commandName === 'c' && args[1]) {
            const categoryArg = args[1].toUpperCase();
            const commandsInCategory = [];

            for (const cmd of commands.values()) {
                const category = cmd.category?.toUpperCase() || "GENERAL";
                if (category === categoryArg) {
                    commandsInCategory.push(cmd.name);
                }
            }

            if (commandsInCategory.length === 0) {
                return bot.sendGroupMessage(event.groupId, [{ type: 'Plain', text: `❌ No commands found in category: ${categoryArg}` }]);
            }

            let replyMsg = "╔══════════◇◆◇══════════╗\n"
                         + "      BOT COMMAND LIST\n"
                         + "╠══════════◇◆◇══════════╣";
            replyMsg += `\n   ┌────── ${categoryArg} ──────┐\n`;

            commandsInCategory.sort().forEach(name => {
                replyMsg += `║ │ 🟢 ${name}\n`;
            });

            replyMsg += "║ └─────────────────┘\n"
                      + "╚══════════◇◆◇══════════╝\n\n";
            replyMsg += `📊 Total Commands in this category: ${commandsInCategory.length}`;

            return bot.sendGroupMessage(event.groupId, [{ type: 'Plain', text: replyMsg }]);
        }

        // 2. একটি নির্দিষ্ট কমান্ডের বিস্তারিত তথ্য দেখানোর জন্য (help <command>)
        if (commandName && commandName !== 'all') {
            const cmd = commands.get(commandName) || commands.get(aliases.get(commandName));
            if (!cmd) {
                return bot.sendGroupMessage(event.groupId, [{ type: 'Plain', text: `⚠️ Command '${commandName}' not found!` }]);
            }

            const roleText = (role => {
                switch (role) {
                    case 1: return "👑 Group Admins";
                    case 2: return "⚡ Bot Admins";
                    default: return "👥 All Users";
                }
            })(cmd.permission);

            const usage = (cmd.guide || cmd.usages || "No usage guide available.")
                .replace(/\{pn\}/g, `${prefix}${cmd.name}`);

            let replyMsg = "╔══════════◇◆◇══════════╗\n"
                         + "║           COMMAND INFORMATION      \n"
                         + "╠══════════◇◆◇══════════╣\n"
                         + `║ 🏷️ Name: ${cmd.name}\n`
                         + `║ 📝 Description: ${cmd.description || 'No description'}\n`
                         + `║ 📂 Category: ${cmd.category?.toUpperCase() || 'GENERAL'}\n`
                         + `║ 🔤 Aliases: ${cmd.aliases?.join(", ") || 'None'}\n`
                         + `║ 🔒 Permissions: ${roleText}\n`
                         + `║ ⏱️ Cooldown: ${cmd.cooldown || 1}s\n`
                         + `║ 👤 Author: ${cmd.author || 'Unknown'}\n`
                         + "╠══════════◇◆◇══════════╣\n"
                         + "║ 🛠️ USAGE GUIDE\n"
                         + ` ║ ${usage.split("\n").join("\n ║ ")}\n`
                         + "╚══════════◇◆◇══════════╝";

            return bot.sendGroupMessage(event.groupId, [{ type: 'Plain', text: replyMsg }]);
        }

        // 3. সব কমান্ড দেখানোর জন্য (help বা help all)
        const categories = new Map();
        for (const cmd of commands.values()) {
            const category = cmd.category?.toUpperCase() || "GENERAL";
            if (!categories.has(category)) {
                categories.set(category, []);
            }
            categories.get(category).push(cmd.name);
        }

        const sortedCategories = [...categories.keys()].sort();
        let replyMsg = "╔══════════◇◆◇══════════╗\n"
                     + "      BOT COMMAND LIST\n"
                     + "╠══════════◇◆◇══════════╣\n";
        
        let totalCommands = 0;

        for (const category of sortedCategories) {
            const commandsInCategory = categories.get(category).sort();
            totalCommands += commandsInCategory.length;

            replyMsg += `\n   ┌────── ${category} ──────┐\n`;
       
