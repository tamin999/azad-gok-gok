const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "anya",
    aliases: [],
    author: "kshitiz",
    version: "2.0",
    role: 0,
    shortDescription: {
      en: "Chat with Anya"
    },
    longDescription: {
      en: "Talk to Anya Forger without prefix"
    },
    category: "ai",
    guide: {
      en: "Just type: anya [text]"
    }
  },

  // Dummy onStart (required by your framework)
  onStart: async function () {
    return;
  },

  // Real noprefix handler
  onChat: async function ({ api, event, message }) {
    try {
      const { createReadStream, unlinkSync } = fs;
      const { resolve } = path;
      const { threadID, senderID, body } = event;

      if (!body) return;

      // Only trigger if message starts with "anya"
      if (!body.toLowerCase().startsWith("anya")) return;

      const getUserInfo = async (api, userID) => {
        try {
          const userInfo = await api.getUserInfo(userID);
          return userInfo[userID]?.firstName || "";
        } catch {
          return "";
        }
      };

      const [a, b] = ["Konichiwa", "senpai"];
      const k = await getUserInfo(api, senderID);
      const ranGreet = `${a} ${k} ${b}`;

      // Remove "anya" from message
      const chat = body.slice(4).trim();

      if (!chat) {
        return message.reply(ranGreet);
      }

      // Translate to Japanese
      const tranChat = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ja&dt=t&q=${encodeURIComponent(chat)}`
      );

      const l = tranChat.data[0][0][0]; // Translated text
      const m = resolve(__dirname, "cache", `${threadID}_${senderID}.wav`);

      // Call Voicevox API
      const n = await axios.get(
        `https://api.tts.quest/v3/voicevox/synthesis?text=${encodeURIComponent(l)}&speaker=3`
      );

      const o = n.data.mp3StreamingUrl;

      if (typeof global.utils.downloadFile !== "function") {
        throw new Error("global.utils.downloadFile is not defined");
      }

      await global.utils.downloadFile(o, m);

      const p = createReadStream(m);

      message.reply(
        {
          body: l,
          attachment: p
        },
        threadID,
        () => unlinkSync(m)
      );
    } catch (error) {
      console.error(error);
      message.reply("error");
    }
  }
};
