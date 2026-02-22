const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair4",
    author: "SA IF",
    countDown: 5,
    role: 0,
    category: "love",
    shortDescription: {
      en: "Pair two users with a love percentage and picture",
    },
  },

  onStart: async function ({ api, event, usersData }) {
    let pathImg = __dirname + "/cache/background.png";
    let pathAvt1 = __dirname + "/cache/Avtmot.png";
    let pathAvt2 = __dirname + "/cache/Avthai.png";

    const id1 = event.senderID;
    const name1 = (await usersData.getName(id1)) || "User1"; // Get sender's name
    const ThreadInfo = await api.getThreadInfo(event.threadID);
    const all = ThreadInfo.userInfo;

    let gender1;
    for (const c of all) {
      if (c.id == id1) gender1 = c.gender;
    }

    const botID = api.getCurrentUserID();
    let candidates = [];

    if (gender1 === "FEMALE") {
      for (const u of all) {
        if (u.gender === "MALE" && u.id !== id1 && u.id !== botID) candidates.push(u.id);
      }
    } else if (gender1 === "MALE") {
      for (const u of all) {
        if (u.gender === "FEMALE" && u.id !== id1 && u.id !== botID) candidates.push(u.id);
      }
    } else {
      for (const u of all) {
        if (u.id !== id1 && u.id !== botID) candidates.push(u.id);
      }
    }

    if (candidates.length === 0) {
      return api.sendMessage("Sorry, no matching users found to pair with you.", event.threadID);
    }

    const id2 = candidates[Math.floor(Math.random() * candidates.length)];
    const name2 = (await usersData.getName(id2)) || "User2"; // Get partner's name

    const lovePercent = Math.floor(Math.random() * 100) + 1;

    const backgrounds = [
      "https://i.postimg.cc/wjJ29HRB/background1.png",
      "https://i.postimg.cc/zf4Pnshv/background2.png",
      "https://i.postimg.cc/5tXRQ46D/background3.png",
    ];
    const bgUrl = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    // Download images
    const avatar1 = await axios.get(`https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" });
    fs.writeFileSync(pathAvt1, Buffer.from(avatar1.data, "utf-8"));

    const avatar2 = await axios.get(`https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" });
    fs.writeFileSync(pathAvt2, Buffer.from(avatar2.data, "utf-8"));

    const background = await axios.get(bgUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(pathImg, Buffer.from(background.data, "utf-8"));

    // Compose image with canvas
    const baseImage = await loadImage(pathImg);
    const baseAvt1 = await loadImage(pathAvt1);
    const baseAvt2 = await loadImage(pathAvt2);

    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseAvt1, 100, 150, 300, 300);
    ctx.drawImage(baseAvt2, 900, 150, 300, 300);

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    // Clean up temp avatar files
    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    // Send message with attachment
    return api.sendMessage(
      {
        body: `🤍🎀 Congratulations ${name1} successfully paired with ${name2}\nThe odds are ${lovePercent}%`,
        mentions: [
          { tag: name1, id: id1 },
          { tag: name2, id: id2 },
        ],
        attachment: fs.createReadStream(pathImg),
      },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  },
};
