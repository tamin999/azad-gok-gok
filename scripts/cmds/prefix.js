const fs = require("fs-extra");
const { utils } = global;

module.exports = {
config: {
name: "prefix",
version: "1.9",
author: "Azadx69x",//author change korle tor marechudi 
countDown: 5,
role: 0,
description: "Change or check bot prefix in your chat or globally group",
category: "config",
guide: {
en: "   {pn} <new prefix>: change prefix in your chat\n"
+ "   Example: {pn} #\n"
+ "   {pn} <new prefix> -g: change prefix globally (admin only)\n"
+ "   Example: {pn} # -g\n"
+ "   {pn} reset: reset prefix in your chat",
vi: "   {pn} <new prefix>: change prefix in your chat\n"
+ "   Example: {pn} #\n"
+ "   {pn} <new prefix> -g: change prefix globally (admin only)\n"
+ "   Example: {pn} # -g\n"
+ "   {pn} reset: reset prefix in your chat"
}
},

langs: {
en: {
reset: "Prefix has been reset to default: %1",
onlyAdmin: "Only admin can change system-wide prefix",
confirmGlobal: "Please react to confirm system-wide prefix change",
confirmThisThread: "Please react to confirm thread prefix change",
successGlobal: "System-wide prefix changed to: %1",
successThisThread: "Thread prefix changed to: %1",
myPrefix: "🌐 System prefix: %1\n🛸 Thread prefix: %2"
},
vi: {
reset: "Đã reset prefix về mặc định: %1",
onlyAdmin: "Chỉ admin mới có thể thay đổi prefix toàn hệ thống",
confirmGlobal: "Vui lòng react để xác nhận thay đổi prefix toàn hệ thống",
confirmThisThread: "Vui lòng react để xác nhận thay đổi prefix nhóm chat",
successGlobal: "Đã thay đổi prefix toàn hệ thống: %1",
successThisThread: "Đã thay đổi prefix nhóm chat: %1",
myPrefix: "🌐 System prefix: %1\n🛸 Thread prefix: %2"
}
},

onStart: async function (ctx) {
try {
const { message, role, args, commandName, event, threadsData, getLang } = ctx;
if (!args[0]) return message.SyntaxError?.();

if (args[0] === "reset") {        
    await threadsData.set(event.threadID, null, "data.prefix");        
    return message.reply(getLang("reset", global.GoatBot.config.prefix));        
  }        

  const newPrefix = args[0];        
  const formSet = { commandName, author: event.senderID, newPrefix };        

  let confirmText = "";        
  if (args[1] === "-g") {        
    if (role < 2) return message.reply(getLang("onlyAdmin"));        
    formSet.setGlobal = true;        
    confirmText = getLang("confirmGlobal");        
  } else {        
    formSet.setGlobal = false;        
    confirmText = getLang("confirmThisThread");        
  }        

  let senderName = "User";        
  try {        
    const userInfo = await message.api.getUserInfo(event.senderID);        
    senderName = userInfo[event.senderID]?.name || "User";        
  } catch { }        

  const boxConfirm = `

╔════════════════════╗
🥷 Hey, ${senderName}❗
⏳ ${confirmText}
─────────────────────
🖥️ React to this message to confirm
╚════════════════════╝
`.trim();

return message.reply(boxConfirm, (err, info) => {        
    if (!global.GoatBot.onReaction) global.GoatBot.onReaction = new Map();        
    formSet.messageID = info.messageID;        
    global.GoatBot.onReaction.set(info.messageID, formSet);        
  });        
} catch (err) {        
  console.error("[prefix.js - onStart]", err);        
  ctx.message.reply("⚠️ Error occurred while running prefix command❗");        
}

},

onReaction: async function (ctx) {
try {
const { message, threadsData, event, Reaction, getLang } = ctx;
const { author, newPrefix, setGlobal, messageID } = Reaction;
if (event.userID !== author) return;

if (setGlobal) {        
    global.GoatBot.config.prefix = newPrefix;        
    try {        
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));        
    } catch (err) {        
      console.error("[prefix.js - write config]", err);        
    }        
    await message.reply(getLang("successGlobal", newPrefix));        
  } else {        
    await threadsData.set(event.threadID, newPrefix, "data.prefix");        
    await message.reply(getLang("successThisThread", newPrefix));        
  }        

  try {        
    await message.unsend(messageID);        
  } catch { }        
            
  if (global.GoatBot.onReaction.has(messageID)) global.GoatBot.onReaction.delete(messageID);        

} catch (err) {        
  console.error("[prefix.js - onReaction]", err);        
}

},

onChat: async function (ctx) {
try {
const { event, message, api } = ctx;
if (event.body && event.body.trim().toLowerCase() === "prefix") {
let senderName = "User";
try {
const userInfo = await api.getUserInfo(event.senderID);
senderName = userInfo[event.senderID]?.name || "User";
} catch { }

const threadPrefix = utils.getPrefix(event.threadID);        
const systemPrefix = global.GoatBot.config.prefix;        
const globalPrefix = systemPrefix;        
const chatPrefix = threadPrefix || systemPrefix;        

const uptime = process.uptime();        
const hours = Math.floor(uptime / 3600);        
const minutes = Math.floor((uptime % 3600) / 60);        
const seconds = Math.floor(uptime % 60);        
const uptimeText = `${hours}h ${minutes}m ${seconds}s`;        

const boxMessage = `

╔════════════════════╗
🕵️‍♀️ 𝐇𝐞𝐲 ${senderName}! 𝐑𝐞𝐚𝐝𝐲 𝐭𝐨 𝐮𝐬𝐞 𝐦𝐞❓
➥ 🌍 𝐆𝐥𝐨𝐛𝐚𝐥 𝐏𝐫𝐞𝐟𝐢𝐱: ${globalPrefix}
➥ 🛸 𝐓𝐡𝐢𝐬 𝐂𝐡𝐚𝐭 𝐏𝐫𝐞𝐟𝐢𝐱: ${chatPrefix}
➥ 🕒 𝐁𝐨𝐭 𝐔𝐩𝐭𝐢𝐦𝐞: ${uptimeText}
😺 𝐈'𝐦 𝙉𝙚𝙯𝙪𝙠𝙤 _𝐧𝐢𝐜𝐞 𝐭𝐨 𝐦𝐞𝐞𝐭 𝐲𝐨𝐮❗
╚════════════════════╝
`.trim();

return message.reply({  
      body: boxMessage,  
      attachment: await global.utils.getStreamFromURL("https://files.catbox.moe/hqpv6p.gif")  
    });        
  }        
} catch (err) {        
  console.error("[prefix.js - onChat]", err);        
}

}
};
