const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const gifUrl = "https://files.catbox.moe/5z7z4t.gif"; 

module.exports = {
  config: {
    name: "help",
    version: "1.2",
    author: "Azadx69x",//author change korle tor marechudi 
    countDown: 5,
    role: 0,
    description: { en: "View command usage" },
    category: "info"
  },

  onStart: async function({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);
    const commandName = (args[0] || "").toLowerCase();
    const cmd = commands.get(commandName) || commands.get(aliases.get(commandName));

    function roleTextToString(role) {
      return role === 0 ? "🔓 All Users"
        : role === 1 ? "🛡 Group Admins"
        : "👑 Bot Admins";
    }

    async function getGifAttachment(url) {
      const filePath = path.join(__dirname, "temp_gif.gif");
      if (!fs.existsSync(filePath)) {
        const res = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, Buffer.from(res.data));
      }
      return [fs.createReadStream(filePath)];
    }

    const headerMsg = `💎 Total Commands: ${commands.size}
🔰 Prefix: '${prefix}'
👤 Developer: Az ad 👻🩸
💡 Tip: Type '${prefix}help <command>' for detailed info.\n\n`;

    if (cmd) {
      const cfg = cmd.config;
      const name = cfg.name;
      const desc = typeof cfg.description === "string" ? cfg.description : cfg.description?.en || "No description";
      const author = cfg.author || "Unknown";
      const guideBody = typeof cfg.guide?.en === "string" ? cfg.guide.en.replace(/\{pn\}/g, prefix + name) : "No usage info";
      const version = cfg.version || "1.0";
      const roleOfCommand = cfg.role || 0;
      const aliasesString = cfg.aliases ? cfg.aliases.join(", ") : "None";
      const cooldown = cfg.countDown || 1;
      const category = cfg.category || "Uncategorized";

      const msg = `${headerMsg}╭───⊙
│ 💠 Command: ${name}
│ 📝 Desc: ${desc}
│ 🗿 Author: ${author}
│ ⚙️ Guide: ${guideBody}
│ 🌀 Version: ${version}
│ 🔐 Role: ${roleTextToString(roleOfCommand)}
│ 🏷️ Aliases: ${aliasesString}
│ ⏱️ Cooldown: ${cooldown}s
│ 🗂️ Category: ${category}
╰──────────────⊙`;

      const attachments = await getGifAttachment(gifUrl);
      return message.reply({ body: msg, attachment: attachments });
    }

    const page = parseInt(args[0]) || 1;
    const numberOfOnePage = 10;

    const categories = {};
    for (const [, value] of commands) {
      if (value.config.role > 1 && role < value.config.role) continue;
      const cat = value.config.category || "Uncategorized";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({
        name: value.config.name,
        desc: typeof value.config.description === "string"
          ? value.config.description
          : value.config.description?.en || "No description",
        role: value.config.role || 0,
        aliases: value.config.aliases ? value.config.aliases.join(", ") : "None",
        cooldown: value.config.countDown || 1,
        version: value.config.version || "1.0"
      });
    }

    const categoryNames = Object.keys(categories).sort();
    const allCommands = [];
    for (const cat of categoryNames) {
      for (const cmd of categories[cat]) {
        allCommands.push({ ...cmd, category: cat });
      }
    }

    if (!allCommands.length) return message.reply("⚠️ No commands available.");

    const totalPage = Math.ceil(allCommands.length / numberOfOnePage);
    if (page < 1 || page > totalPage)
      return message.reply(`⚠️ Page ${page} does not exist. Only ${totalPage} pages.`);

    const start = (page - 1) * numberOfOnePage;
    const commandsToShow = allCommands.slice(start, start + numberOfOnePage);

    let msg = headerMsg;
    let lastCategory = "";

    for (const cmd of commandsToShow) {
      if (cmd.category !== lastCategory) {
        const emoji = cmd.category.toLowerCase().includes("music") ? "🎵"
          : cmd.category.toLowerCase().includes("info") ? "🛠"
          : "🌀";
        msg += `╭───⊙ ${emoji} ${cmd.category.toUpperCase()} ⭓\n`;
        lastCategory = cmd.category;
      }

      msg += `│ 💠 ${cmd.name}\n`;
      msg += `│ 📝 ${cmd.desc}\n`;
      msg += `│ 🔐 Role: ${roleTextToString(cmd.role)}\n`;
      msg += `│ 🏷️ Aliases: ${cmd.aliases}\n`;
      msg += `│ ⏱️ Cooldown: ${cmd.cooldown}s\n`;
      msg += `│ 🌀 Version: ${cmd.version}\n`;
      msg += `├──────────────⊙\n`;
    }

    msg += `│ 📄 Page: ${page}/${totalPage}\n`;
    msg += `│ 💬 Use ${prefix}help <page> to see more\n`;
    msg += `╰──────────────⊙`;

    const attachments = await getGifAttachment(gifUrl);
    return message.reply({ body: msg, attachment: attachments });
  }
};
