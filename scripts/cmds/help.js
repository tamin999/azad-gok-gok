const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

function fancyText(text) {
  const map = {
    'a': '𝖺', 'b': '𝖻', 'c': '𝖼', 'd': '𝖽', 'e': '𝖾', 'f': '𝖿', 'g': '𝗀', 'h': '𝗁', 'i': '𝗂',
    'j': '𝗃', 'k': '𝗄', 'l': '𝗅', 'm': '𝗆', 'n': '𝗇', 'o': '𝗈', 'p': '𝗉', 'q': '𝗊', 'r': '𝗋',
    's': '𝗌', 't': '𝗍', 'u': '𝗎', 'v': '𝗏', 'w': '𝗐', 'x': '𝗑', 'y': '𝗒', 'z': '𝗓',
    'A': '𝖠', 'B': '𝖡', 'C': '𝖢', 'D': '𝖣', 'E': '𝖤', 'F': '𝖥', 'G': '𝖦', 'H': '𝖧', 'I': '𝖨',
    'J': '𝖩', 'K': '𝖪', 'L': '𝖫', 'M': '𝖬', 'N': '𝖭', 'O': '𝖮', 'P': '𝖯', 'Q': '𝖰', 'R': '𝖱',
    'S': '𝖲', 'T': '𝖳', 'U': '𝖴', 'V': '𝖵', 'W': '𝖶', 'X': '𝖷', 'Y': '𝖸', 'Z': '𝖹'
  };
  return text.split("").map(c => map[c] || c).join("");
}

const categoryEmoji = (category) => {
  const emojiMap = {
    'info': '📚',
    'information': 'ℹ️',
    'system': '⚙️',
    'bot': '🤖',
    'admin': '👑',
    'administration': '👑',
    'owner': '👁️',
    'group': '👥',
    'groups': '👥',
    'fun': '🎮',
    'entertainment': '🎭',
    'game': '🎲',
    'games': '🎮',
    'media': '🎵',
    'music': '🎶',
    'audio': '🎵',
    'video': '🎬',
    'utility': '🔧',
    'tools': '🛠️',
    'economy': '💰',
    'money': '💸',
    'banking': '🏦',
    'image': '🖼️',
    'photo': '📸',
    'picture': '🖼️',
    'education': '🎓',
    'learning': '📚',
    'nsfw': '🔞',
    'adult': '🔞',
    'chat': '💬',
    'communication': '💬',
    'ai': '🤖',
    'artificial intelligence': '🧠',
    'search': '🔍',
    'productivity': '📈',
    'security': '🛡️',
    'privacy': '🔒',
    'misc': '📦',
    'miscellaneous': '📦',
    'other': '🎭',
    'action': '🎯',
    'interaction': '🤝',
    'creative': '🎨',
    'design': '✏️',
    'data': '📊',
    'analytics': '📈',
    'gaming': '🎮',
    'world': '🌍',
    'geography': '🗺️',
    'social': '📱',
    'social media': '📱',
    'food': '🍕',
    'drink': '🍹',
    'love': '💖',
    'romance': '💘',
    'friendship': '🤝',
    'family': '👨‍👩‍👧‍👦',
    'health': '🏥',
    'fitness': '💪',
    'sports': '⚽',
    'travel': '✈️',
    'shopping': '🛍️',
    'business': '💼',
    'work': '💼',
    'study': '📖',
    'book': '📚',
    'movie': '🎬',
    'tv': '📺',
    'anime': '🇯🇵',
    'manga': '📖',
    'comic': '📚',
    'cartoon': '🖼️',
    'art': '🎨',
    'drawing': '✏️',
    'painting': '🎨',
    'photography': '📷',
    'nature': '🌿',
    'animal': '🐶',
    'pet': '🐾',
    'car': '🚗',
    'vehicle': '🚗',
    'technology': '💻',
    'computer': '💻',
    'phone': '📱',
    'internet': '🌐',
    'web': '🌐',
    'network': '🔗',
    'science': '🔬',
    'math': '🧮',
    'physics': '⚛️',
    'chemistry': '🧪',
    'biology': '🧬',
    'history': '📜',
    'culture': '🎎',
    'religion': '🕌',
    'spiritual': '🙏',
    'weather': '🌤️',
    'time': '🕒',
    'date': '📅',
    'calendar': '📅',
    'reminder': '⏰',
    'alarm': '⏰',
    'timer': '⏱️',
    'stopwatch': '⏱️',
    'counter': '🔢',
    'default': '📁'
  };
  
  const cat = category.toLowerCase();
  
  if (emojiMap[cat]) {
    return emojiMap[cat];
  }
  
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (cat.includes(key) || key.includes(cat)) {
      return emoji;
    }
  }
  
  return emojiMap.default;
};

module.exports = {
  config: {
    name: "help",
    version: "2.4",
    author: "Azadx69x",
    role: 0,
    countDown: 5,
    description: { 
      en: "📚 Show command list or command details" 
    },
    category: "Info",
    guide: {
      en: "{pn} [command_name]"
    }
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
`┍━━━[ ❌ 𝗡𝗢𝗧 𝗙𝗢𝗨𝗡𝗗 ]━━━◊
┋➥ 🔍 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: "${input}"
┋➥ 📌 𝗨𝘀𝗲: ${prefix}𝗵𝗲𝗹𝗽
┋➥     𝗳𝗼𝗿 𝗮𝗹𝗹 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀
┕━━━━━━━━━━━━━━━━━━━━━◊`
        );
      }
    }
    
    if (cmd) {
      const cfg = cmd.config;
      const desc = typeof cfg.description === "string" ? cfg.description : cfg.description?.en || "❌ 𝗡𝗼 𝗱𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻";
      const usage = typeof cfg.guide?.en === "string" ? 
        cfg.guide.en.replace(/\{pn\}/g, prefix + cfg.name) : 
        `${prefix}${cfg.name}`;

      const aliasesList = cfg.aliases ? 
        cfg.aliases.map(a => `${prefix}${a}`).join(", ") : 
        "❌ 𝗡𝗼𝗻𝗲";

      const helpMessage = `┍━━━[ 📚 HINATA BOT 𝗛𝗘𝗟𝗣 ]━━━◊
┋➥ 📛 𝗡𝗮𝗺𝗲: ${prefix}${cfg.name}
┋➥ 🗂️ 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${categoryEmoji(cfg.category || "other")} ${cfg.category || "❌ 𝗨𝗻𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝗶𝘇𝗲𝗱"}
┋➥ 📄 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${desc}
┋➥ ⚙️ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${cfg.version || "1.0"}
┋➥ ⏳ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${cfg.countDown || 1}s
┋➥ 🔒 𝗥𝗼𝗹𝗲: ${cfg.role === 0 ? "👤 𝗔𝗹𝗹" : cfg.role === 1 ? "👑 𝗔𝗱𝗺𝗶𝗻" : "⚡ 𝗢𝘄𝗻𝗲𝗿"}
┋➥ 👑 𝗔𝘂𝘁𝗵𝗼𝗿: ${cfg.author || "❌ 𝗨𝗻𝗸𝗻𝗼𝘄𝗻"}
┋➥ 🔤 𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${aliasesList}
┍━━━[ 📘 𝗨𝗦𝗔𝗚𝗘 ]━━━◊
${usage.split('\n').map(line => `┋➥ ${line}`).join('\n')}
┍━━━[ 💡 𝗡𝗢𝗧𝗘𝗦 ]━━━◊
┋➥ <text> = Replaceable content
┋➥ [a|b] = Choose option a or b
┋➥ ( ) = Optional parameter
┋➥ {pn} = Bot prefix
┕━━━━━━━━━━━━━━━━━━━━━◊`;
        
      try {
        await message.reply({
          body: helpMessage,
          attachment: await global.utils.getStreamFromURL("https://i.ibb.co/5X9T2dDN/image0.gif")
        });
      } catch (error) {
        console.log("GIF attachment failed, sending text only:", error);
        await message.reply(helpMessage);
      }
      return;
    }
      
    const categories = {};
    for (const [, c] of commands) {
      if (c.config.role > role) continue;
      const cat = c.config.category || "Uncategorized";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(c.config.name);
    }

    let msg = `┍━━━[ 📚 HINATA 𝗕𝗢𝗧 𝗠𝗘𝗡𝗨  ]━━━◊\n`;
      
    const sortedCategories = Object.keys(categories).sort();
    
    for (const cat of sortedCategories) {
      const categoryName = fancyText(cat.toUpperCase());
      const commandsList = categories[cat].sort();
      
      msg += `┍━━━[ ${categoryEmoji(cat)} ${categoryName} ]━━━◊\n`;
        
      for (let i = 0; i < commandsList.length; i += 2) {
        const cmd1 = commandsList[i];
        const cmd2 = commandsList[i + 1];
        
        const line = cmd2 ? 
          `┋➥ ${cmd1.padEnd(15)} ${cmd2}` :
          `┋➥ ${cmd1}`;
        
        msg += line + "\n";
      }
      
      msg += "┕━━━━━━━━━━━━━━━━━━━━━━◊\n";
    }

    const totalCommands = Object.values(categories).flat().length;
    msg += `┍━━━[ 📊 𝗦𝗧𝗔𝗧𝗦 ]━━━◊
┋➥ 𝗧𝗼𝘁𝗮𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀: ${totalCommands}
┋➥ 𝗧𝗼𝘁𝗮𝗹 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝗶𝗲𝘀: ${sortedCategories.length}
┋➥ 𝗔𝗹𝗹 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝗶𝗻 𝗼𝗻𝗲 𝗽𝗮𝗴𝗲
┍━━━[ 🚀 𝗜𝗡𝗙𝗢 ]━━━◊
┋➥ 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 HINATA 𝗕𝗼𝘁!
┋➥ 𝗣𝗿𝗲𝗳𝗶𝘅: [ ${prefix} ]
┋➥ 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿: TAMIM
┋➥ 𝗨𝘀𝗲: ${prefix}𝗵𝗲𝗹𝗽 <𝗰𝗼𝗺𝗺𝗮𝗻𝗱>
┕━━━━━━━━━━━━━━━━━━━━━━◊`;
      
    try {
      await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL("https://i.ibb.co/5X9T2dDN/image0.gif")
      });
    } catch (error) {
      console.log("GIF attachment failed, sending text only:", error);
      await message.reply(msg);
    }
  }
};
