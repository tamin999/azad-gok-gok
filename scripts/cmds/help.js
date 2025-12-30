const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

function fancyText(text) {
  const map = {
    a:"𝗮",b:"𝗯",c:"𝗰",d:"𝗱",e:"𝗲",f:"𝗳",g:"𝗴",h:"𝗵",i:"𝗶",j:"𝗷",
    k:"𝗸",l:"𝗹",m:"𝗺",n:"𝗻",o:"𝗼",p:"𝗽",q:"𝗾",r:"𝗿",s:"𝘀",t:"𝘁",
    u:"𝘂",v:"𝘃",w:"𝘄",x:"𝘅",y:"𝘆",z:"𝘇",
    A:"𝗔",B:"𝗕",C:"𝗖",D:"𝗗",E:"𝗘",F:"𝗙",G:"𝗚",H:"𝗛",I:"𝗜",J:"𝗝",
    K:"𝗞",L:"𝗟",M:"𝗠",N:"𝗡",O:"𝗢",P:"𝗣",Q:"𝗤",R:"𝗥",S:"𝗦",T:"𝗧",
    U:"𝗨",V:"𝗩",W:"𝗪",X:"𝗫",Y:"𝗬",Z:"𝗭"
  };
  return text.split("").map(c => map[c] || c).join("");
}

const commandEmoji = (cmd) => {
  const map = {admin:"👑", adminonly:"🛡️", adduser:"➕", adboxonly:"📦", callad:"📢", ignoreonlyad:"👀", ignoreonlyadbox:"📵", antichangeinfobox:"🛑", antiout:"🚷", all:"🗂️", album:"🎞️", anime:"🎌", anisearch:"🔍", autodl:"📥", autodownload:"📥", autosetname:"🔤", baby:"👶", backupdata:"💾", badwords:"🚫", balance:"💰", ban:"🚫", bank:"🏦", blackmarket:"🛒", botnick:"🤖", boxinfo:"📦", bully:"😈", busy:"⏳", buttslap:"🍑", candycrush:"🍬", caption:"✍️", catbox:"📤", cdp:"📋", cmd:"📜", cmdstore3:"🏪", count:"🔢", customrankcard:"🎴", daily:"🪙", delete:"🗑️", dirim:"💬", dog:"🐶", drive:"📁", duck:"🦆", edit:"🖌️", emojimix:"😀", emojireply:"💬", eval:"🧠", event:"🧪", fackchat:"💬", fastx:"🚀", ffvideo:"🎥", fight:"✊", file:"📂", filter:"🎚️", filteruser:"🚫", flag:"🏳️", font:"🔠", fun:"🎉", gali:"🤬", gay:"🌈", gc:"👥", gemini:"🤖", gf:"🍽️", goatstor:"🏪", goiadmin:"🛂", grouptag:"🏷️", guessnumber:"🎯", hanime:"🔥", help:"❓", hgen:"🧬", hijack:"🕵️", host:"🌐", hot:"🔥", hubble:"🔭", imgbb:"🖼️", imgur:"🖼️", intro:"📌", islamicvideo:"🕌", jail:"🚔", join:"🔔", jsontomongodb:"🔄", jsontosqlite:"🔄", kick:"🥾", leave:"🚪", liner:"📝", loadconfig:"⚙️", love:"❤️", mark:"📛", memberlist:"📋", myinfo:"🙋", nb:"🆕", nezuko:"🌸", niji:"🎨", notification:"🔔", out:"🚶", owner:"👁️", pair:"💞", pair2:"💞", pastebin:"💾", pending:"⏳", ping:"⏱️", poli:"🤖", prefix:"🔣", prompt:"🧠", quiz:"❓", rank:"🏆", rankup:"⬆️", rate:"⭐", rbg:"🖼️", refresh:"🔄", restart:"♻️", rps:"✊", rules:"📜", sakura:"🌸", say:"🗣️", sdxl:"🎨", segs:"🔞", set:"⚙️", setalias:"🔗", setavt:"🖼️", setlang:"🌐", setleave:"👋", setname:"📛", setrankup:"⬆️", setrole:"🎭", setwelcome:"👋", shell:"💻", shizuka:"🧑‍🎤", shortcut:"⚡", shortmsg:"✉️", slap:"👋", slot:"🎰", son:"👨‍👦", spin:"🎲", spygc:"🕵️", systempanel:"🖥️", tag:"🏷️", theme:"🎨", thread:"🧵", tid:"🆔", tiktok:"🎵", time:"⏰", toilet:"🚽", top:"🏆", topexp:"📈", translate:"🌍", trash:"🗑️", trigger:"🎯", ttt:"❌", uid:"🆔", unsend:"🗑️", up:"📈", up3:"📈", up4:"📈", update:"🔄", uptime:"⏳", user:"👤", wanted:"🎯", warn:"⚠️", weather:"🌦️", wl:"📜", youtube:"▶️"};
  return map[cmd] || "📝";
};

module.exports = {
  config: {
    name: "help",
    version: "1.0",
    author: "Azadx69x",
    role: 0,
    countDown: 5,
    description: { en: "Show command list or command details" },
    category: "Info"
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);
    const input = args[0]?.toLowerCase();

    let cmd = null;
    
    if (input) {
      if (commands.has(input)) {
        cmd = commands.get(input);
      } else if (aliases.has(input)) {
        cmd = commands.get(aliases.get(input));
      } else {
        return message.reply(
`╔════════════════════╗
║ ❌ Command Not Found
║ 🔍 "${input}"
║ 📌 Use ${prefix}help to see all commands
╚════════════════════╝`
        );
      }
    }
    
    if (cmd) {
      const cfg = cmd.config;
      const desc = typeof cfg.description === "string" ? cfg.description : cfg.description?.en || "No description";
      const usage = typeof cfg.guide?.en === "string" ? cfg.guide.en.replace(/\{pn\}/g, prefix + cfg.name) : `${prefix}${cfg.name}`;

      return message.reply(
`╔══════════════════╗
║ ${commandEmoji(cfg.name)} Name: ${prefix}${cfg.name}
║ 🗂️ Category: ${cfg.category || "Uncategorized"}
║ 📄 Description: ${desc}
║ ⚙️ Version: ${cfg.version || "1.0"}
║ ⏳ Cooldown: ${cfg.countDown || 1}s
║ 🔒 Role: ${cfg.role === 0 ? "All" : cfg.role === 1 ? "Admin" : "Owner"}
║ 👑 Author: ${cfg.author || "Unknown"}
║ 📘 Usage: ${usage}
╚══════════════════╝`
      );
    }
    
    const categories = {};
    for (const [, c] of commands) {
      if (c.config.role > role) continue;
      const cat = c.config.category || "Uncategorized";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(c.config.name);
    }

    let msg = `╔══════════════════╗
║    🏷️ X69X_Help_Menu
╚══════════════════╝\n\n`;

    for (const cat of Object.keys(categories).sort()) {
      msg += `╔══════════════════╗
║ 🗂️ ${cat.toUpperCase()}\n`;
      for (const name of categories[cat]) {
        msg += `║ ${commandEmoji(name)} ${fancyText(name)}\n`;
      }
      msg += `╚══════════════════╝\n\n`;
    }

    msg += `╔══════════════════╗
║ 🗂️ Total Commands: ${commands.size}
║ 📌 Prefix: ${prefix}
║ 👤 Developer: Azadx69x
║ 💡 Use ${prefix}help <command>
╚══════════════════╝`;

    return message.reply(msg);
  }

 
