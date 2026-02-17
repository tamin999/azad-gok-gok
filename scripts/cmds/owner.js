const fs = require("fs").promises;
const fssync = require("fs");
const path = require("path");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "owner",
    version: "1.2",
    author: "Raihan | Azad 💥",
    category: "owner",
    guide: {
      en: "Use !owner or type Hinata Admin to view owner info."
    }
  },

  onStart: async function ({ api, event }) {
    // Ensure only one owner message per thread
    if (!this.sentThreads) this.sentThreads = {};
    if (this.sentThreads[event.threadID]) return;
    this.sentThreads[event.threadID] = true;

    const ownerInfo = {  
      name: "Tʌɱɩɱ Hʌwɭʌdeʀ",  
      gender: "𝙼𝚊𝚕𝚎",  
      bio: " 🌷",  
      nick: "Tʌɱɩɱ",  
      hobby: "gaming",  
      from: "Dhaka,Bangladesh",  
      age: "–",  
      status: "Student"  
    };  

    const sec = process.uptime();  
    const botUptime = `${Math.floor(sec / 86400)}d ${Math.floor(sec % 86400 / 3600)}h ${Math.floor(sec % 3600 / 60)}m`;  
    const now = moment().tz("Asia/Dhaka").format("h:mm A • dddd");  

    const body = `

🌸┌───────────────┐🌸
𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢
🌸└───────────────┘🌸

✧ Name ➝ ${ownerInfo.name}
✧ Gender ➝ ${ownerInfo.gender}
✧ From ➝ ${ownerInfo.from}
✧ Age ➝ ${ownerInfo.age}
✧ Hobby ➝ ${ownerInfo.hobby}
✧ Status ➝ ${ownerInfo.status}

━━━━━━━━━━━━━━

✦ Bot Name ➝ ${ownerInfo.bio}
✦ Admin ➝ ${ownerInfo.nick}

━━━━━━━━━━━━━━

✨ Uptime ➝ ${botUptime}
✨ Time ➝ ${now}

📝 Any problem? Talk to admin.
`;

    // Image URL  
    const imageUrl = "https://files.catbox.moe/12n172.jpg";  
    const imagePath = path.join(__dirname, "cache", "owner.jpg");  

    try {  
      // Download image  
      const response = await axios.get(imageUrl, { responseType: "stream" });  
      const writer = response.data.pipe(fssync.createWriteStream(imagePath));  
      await new Promise((resolve, reject) => {  
        writer.on("finish", resolve);  
        writer.on("error", reject);  
      });  

      const msg = await api.sendMessage({  
        body,  
        attachment: fssync.createReadStream(imagePath)  
      }, event.threadID);  

      this.lastOwnerMsgID = msg.messageID;  
      await fs.unlink(imagePath);  

    } catch (e) {  
      console.error("Error sending owner image:", e);  
      const msg = await api.sendMessage(body, event.threadID);  
      this.lastOwnerMsgID = msg.messageID;  
    }

  },

  onChat: async function ({ api, event }) {
    if (!event.body) return;
    const msg = event.body.toLowerCase().trim();

    if (msg === "!owner" || msg === "hinata admin") {  
      await this.onStart({ api, event });  
    }
  }
};
