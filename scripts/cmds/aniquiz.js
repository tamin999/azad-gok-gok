const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const util = require("util");

const cacheDir = path.join(__dirname, "cache");
const userDataFile = path.join(__dirname, "anime.json");
const usageFile = path.join(__dirname, "usage.json");

const LIMIT = 20;
const WINDOW_MS = 7 * 60 * 60 * 1000; // 7 hours in milliseconds

async function loadUsage() {
  try {
    const raw = await fs.readFile(usageFile, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveUsage(data) {
  await fs.writeFile(usageFile, JSON.stringify(data, null, 2), "utf8");
}

module.exports = {
  config: {
    name: "aniquiz",
    aliases: ["animequiz"],
    version: "1.0",
    author: "Kshitiz",
    role: 0,
    shortDescription: "Guess the anime character",
    longDescription: "Guess the name of the anime character based on provided traits and tags.",
    category: "game",
    guide: {
      en: "{p}aniquiz"
    }
  },

  onStart: async function ({ event, message, usersData, api, args }) {
    try {
      if (!event || !message) return;

      // === Usage limit check ===
      const userId = event.senderID;
      const usageData = await loadUsage();

      let userUsage = usageData[userId];
      const now = Date.now();

      if (!userUsage) {
        // First use
        usageData[userId] = { count: 1, startTime: now };
      } else {
        if (now - userUsage.startTime > WINDOW_MS) {
          // Reset usage window
          usageData[userId] = { count: 1, startTime: now };
        } else {
          // Within usage window
          if (userUsage.count >= LIMIT) {
            return message.reply(
              `❌ You have reached the limit of ${LIMIT} uses in 7 hours. Please wait before using again.`
            );
          }
          usageData[userId].count++;
        }
      }
      await saveUsage(usageData);
      // === End usage limit check ===

      if (args.length === 1 && args[0].toLowerCase() === "top") {
        return await this.showTopPlayers({ message, usersData, api });
      }

      const characterData = await this.fetchCharacterData();
      if (!characterData || !characterData.data) {
        console.error("Failed to fetch character data.");
        return message.reply("❌ Error fetching character data. Please try again later.");
      }

      const { image, traits, tags, fullName, firstName } = characterData.data;

      const imageStream = await this.downloadImage(image);
      if (!imageStream) {
        console.error("Failed to download character image.");
        return message.reply("❌ Error downloading image.");
      }

      const quizPrompt = `
✨ 𝗚𝘂𝗲𝘀𝘀 𝘁𝗵𝗲 𝗮𝗻𝗶𝗺𝗲 𝗰𝗵𝗮𝗿𝗮𝗰𝘁𝗲𝗿! ✨
📝 𝗧𝗿𝗮𝗶𝘁𝘀: ${traits}
🏷️ 𝗧𝗮𝗴𝘀: ${tags}
      `;

      const replyMsg = { body: quizPrompt.trim(), attachment: imageStream };
      const sentMessage = await message.reply(replyMsg);

      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: this.config.name,
        messageID: sentMessage.messageID,
        correctAnswer: [fullName, firstName],
        senderID: event.senderID
      });

      setTimeout(() => api.unsendMessage(sentMessage.messageID).catch(() => {}), 15000);
    } catch (error) {
      console.error("Error in aniquiz onStart:", error);
      message.reply("❌ An error occurred while starting the quiz.");
    }
  },

  onReply: async function ({ message, event, Reply, api }) {
    try {
      if (!event || !message || !Reply) return;

      const userAnswer = event.body.trim().toLowerCase();
      const correctAnswers = Reply.correctAnswer.map(ans => ans.toLowerCase());

      if (event.senderID !== Reply.senderID) return;

      if (correctAnswers.includes(userAnswer)) {
        await this.addCoins(event.senderID, 1000);
        await message.reply("🎉🎊 Congratulations! Your answer is correct.\nYou earned 1000 coins.");
      } else {
        await message.reply(`❌ Sorry! Wrong answer.\nThe correct answer was:\n${Reply.correctAnswer.join(" or ")}`);
      }

      await api.unsendMessage(Reply.messageID).catch(() => {});
      await api.unsendMessage(event.messageID).catch(() => {});
    } catch (error) {
      console.error("Error handling aniquiz reply:", error);
    }
  },

  showTopPlayers: async function ({ message, usersData, api }) {
    try {
      const users = await this.getTopUsers(usersData, api);
      if (users.length === 0) {
        return message.reply("No players found.");
      }

      const topList = users
        .map((user, i) => `${i + 1}. ${user.username}: ${user.money} coins`)
        .join("\n");

      return message.reply(`🏆 Top 5 Anime Quiz Players 🏆\n${topList}`);
    } catch (error) {
      console.error("Error showing top players:", error);
      message.reply("❌ An error occurred while fetching top players.");
    }
  },

  fetchCharacterData: async function () {
    try {
      return await axios.get("https://animequiz-mu.vercel.app/kshitiz");
    } catch (error) {
      console.error("Error fetching anime character data:", error);
      return null;
    }
  },

  downloadImage: async function (url) {
    try {
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, "anime_character.jpg");

      const res = await axios.get(url, { responseType: "arraybuffer" });
      if (!res.data || res.data.length === 0) return null;

      await fs.writeFile(filePath, res.data, "binary");
      return fs.createReadStream(filePath);
    } catch (error) {
      console.error("Error downloading image:", error);
      return null;
    }
  },

  addCoins: async function (userId, amount) {
    let userData = await this.readUserData(userId);
    if (!userData) userData = { money: 0 };
    userData.money += amount;
    await this.saveUserData(userId, userData);
  },

  readUserData: async function (userId) {
    try {
      const data = await fs.readFile(userDataFile, "utf8");
      const users = JSON.parse(data);
      return users[userId] || null;
    } catch (error) {
      if (error.code === "ENOENT") {
        await fs.writeFile(userDataFile, "{}");
        return null;
      } else {
        console.error("Error reading user data:", error);
        return null;
      }
    }
  },

  saveUserData: async function (userId, data) {
    try {
      const users = await this.getAllUserData();
      users[userId] = { ...users[userId], ...data };
      await fs.writeFile(userDataFile, JSON.stringify(users, null, 2), "utf8");
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  },

  getAllUserData: async function () {
    try {
      const data = await fs.readFile(userDataFile, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading user data:", error);
      return {};
    }
  },

  getTopUsers: async function (usersData, api) {
    try {
      const allUsers = await this.getAllUserData();
      const userIds = Object.keys(allUsers);
      const topUsers = [];

      const getUserInfo = util.promisify(api.getUserInfo);

      await Promise.all(
        userIds.map(async (id) => {
          try {
            const userInfo = await getUserInfo(id);
            const username = userInfo[id]?.name;
            if (username) {
              topUsers.push({ username, money: allUsers[id].money });
            }
          } catch {
            // Ignore errors
          }
        })
      );

      topUsers.sort((a, b) => b.money - a.money);
      return topUsers.slice(0, 5);
    } catch (error) {
      console.error("Error fetching top users:", error);
      return [];
    }
  }
};
