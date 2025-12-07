const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pastebin",
    aliases: ["past"],
    version: "0.1.7",
    author: "Azadx69x",
    countDown: 5,
    role: 2,
    shortDescription: { en: "Upload file and get raw link" },
    longDescription: { en: "Uploads file to Pastebin API and returns raw link" },
    category: "tools",
    guide: { en: "Use: pastebin <filename>" }
  },

  onStart: async function({ api, event, args }) {
    const fileName = args[0];
    if (!fileName) return api.sendMessage("File name dao 🐸❓", event.threadID);

    const cmdsRoot = path.join(process.cwd(), "scripts", "cmds");
    const pathsToCheck = [
      path.join(cmdsRoot, fileName),
      path.join(cmdsRoot, fileName + ".js"),
      path.join(cmdsRoot, "tools", fileName),
      path.join(cmdsRoot, "tools", fileName + ".js")
    ];

    let filePath;
    for (const p of pathsToCheck) if (fs.existsSync(p)) { filePath = p; break; }
    if (!filePath) return api.sendMessage("⚠️ File not found", event.threadID);

    let content;
    try { content = fs.readFileSync(filePath, "utf8"); } 
    catch (err) { console.log("File read error:", err); return api.sendMessage("File read failed 🚫", event.threadID); }

    const API_URL = "https://azadx69x-pastebin-api.onrender.com/azadx69x/create";

    try {
      const res = await axios.post(API_URL, { content }, { timeout: 15000 });
      console.log("API Response:", res.data);

      if (!res.data || res.data.status !== true) {
        return api.sendMessage(`API error ⁉️`, event.threadID);
      }
      
      api.sendMessage(res.data.raw, event.threadID);

    } catch (err) {
      console.log("Axios error:", err.response ? err.response.data : err.message);
      api.sendMessage("❌ API down Check console for details", event.threadID);
    }
  }
};
