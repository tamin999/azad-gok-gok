const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require("path");

module.exports = {
  config: {
    name: "pair5",
    author: 'Arijit',
    category: "love"
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      // Unicode bold converter
      function toBoldUnicode(name) {
        const boldAlphabet = {
          "a": "𝐚", "b": "𝐛", "c": "𝐜", "d": "𝐝", "e": "𝐞", "f": "𝐟", "g": "𝐠", "h": "𝐡", "i": "𝐢", "j": "𝐣",
          "k": "𝐤", "l": "𝐥", "m": "𝐦", "n": "𝐧", "o": "𝐨", "p": "𝐩", "q": "𝐪", "r": "𝐫", "s": "𝐬", "t": "𝐭",
          "u": "𝐮", "v": "𝐯", "w": "𝐰", "x": "𝐱", "y": "𝐲", "z": "𝐳", "A": "𝐀", "B": "𝐁", "C": "𝐂", "D": "𝐃",
          "E": "𝐄", "F": "𝐅", "G": "𝐆", "H": "𝐇", "I": "𝐈", "J": "𝐉", "K": "𝐊", "L": "𝐋", "M": "𝐌", "N": "𝐍",
          "O": "𝐎", "P": "𝐏", "Q": "𝐐", "R": "𝐑", "S": "𝐒", "T": "𝐓", "U": "𝐔", "V": "𝐕", "W": "𝐖", "X": "𝐗",
          "Y": "𝐘", "Z": "𝐙", "0": "0", "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8",
          "9": "9", " ": " ", "'": "'", ",": ",", ".": ".", "-": "-", "!": "!", "?": "?"
        };
        return name.split('').map(char => boldAlphabet[char] || char).join('');
      }

      const threadInfo = await api.getThreadInfo(event.threadID);
      const participants = threadInfo.participantIDs;

      let males = [];
      let females = [];

      for (let uid of participants) {
        try {
          const user = await usersData.get(uid);
          if (!user || !user.gender) continue;

          if (user.gender === 2) males.push(user);     // male
          else if (user.gender === 1) females.push(user); // female
        } catch (e) { continue; }
      }

      const sender = await usersData.get(event.senderID);
      if (!sender || !sender.gender) {
        return api.sendMessage("❌ Cannot detect your gender. Please update your profile.", event.threadID, event.messageID);
      }

      let male, female;
      if (sender.gender === 2) {
        male = sender;
        if (females.length === 0) {
          return api.sendMessage("❌ No female members found in this group to pair with you.", event.threadID, event.messageID);
        }
        female = females[Math.floor(Math.random() * females.length)];
      } else if (sender.gender === 1) {
        female = sender;
        if (males.length === 0) {
          return api.sendMessage("❌ No male members found in this group to pair with you.", event.threadID, event.messageID);
        }
        male = males[Math.floor(Math.random() * males.length)];
      } else {
        return api.sendMessage("❌ Unsupported gender type.", event.threadID, event.messageID);
      }

      const name1 = male.name;
      const name2 = female.name;

      const styledName1 = toBoldUnicode(name1);
      const styledName2 = toBoldUnicode(name2);

      const avatarURL1 = await usersData.getAvatarUrl(male.userID);
      const avatarURL2 = await usersData.getAvatarUrl(female.userID);

      // Love % randomizer
      const funnyValues = ["-99", "-100", "0", "101", "0.01", "99.99"];
      const normal = Math.floor(Math.random() * 100) + 1;
      const lovePercent = Math.random() < 0.2
        ? funnyValues[Math.floor(Math.random() * funnyValues.length)]
        : normal;

      // Canvas setup
      const width = 1365, height = 768;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      const background = await loadImage("https://files.catbox.moe/rfv1fa.jpg");
      const avatar1 = await loadImage(avatarURL1);
      const avatar2 = await loadImage(avatarURL2);

      ctx.drawImage(background, 0, 0, width, height);

      function drawCircleImage(img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2 + 3, 0, Math.PI * 2, true);
        ctx.lineWidth = 6;
        ctx.strokeStyle = "white";
        ctx.shadowColor = "white";
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      const avatarSize = 210;
      drawCircleImage(avatar1, 220, 95, avatarSize);
      drawCircleImage(avatar2, 920, 130, avatarSize);

      ctx.font = "bold 36px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "yellow";
      ctx.shadowColor = "black";
      ctx.shadowBlur = 8;
      ctx.fillText(styledName1, 220 + avatarSize / 2, 480);
      ctx.fillText(styledName2, 920 + avatarSize / 2, 480);

      ctx.font = "bold 42px Arial";
      ctx.fillStyle = "white";
      ctx.shadowColor = "blue";
      ctx.shadowBlur = 12;
      ctx.fillText(`${lovePercent}%`, width / 2, 330);
      ctx.shadowBlur = 0;

      const outputPath = path.join(__dirname, 'pair_output.png');
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on('finish', () => {
        const message =
`💞 𝐂𝐨𝐧𝐠𝐫𝐚𝐭𝐮𝐥𝐚𝐭𝐢𝐨𝐧𝐬 💞

• ${styledName1} 🎀
• ${styledName2} 🎀

💌 𝐖𝐢𝐬𝐡𝐢𝐧𝐠 𝐲𝐨𝐮 𝐛𝐨𝐭𝐡 𝐚 𝐥𝐢𝐟𝐞𝐭𝐢𝐦𝐞 𝐨𝐟 𝐥𝐨𝐯𝐞 𝐚𝐧𝐝 𝐥𝐚𝐮𝐠𝐡𝐭𝐞𝐫.💕 

𝐋𝐨𝐯𝐞 𝐩𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞 ${lovePercent}% 💘`;

        api.sendMessage({
          body: message,
          mentions: [
            { tag: name1, id: male.userID },
            { tag: name2, id: female.userID }
          ],
          attachment: fs.createReadStream(outputPath)
        }, event.threadID, () => fs.unlinkSync(outputPath), event.messageID);
      });

    } catch (error) {
      console.error(error);
      return api.sendMessage("❌ An error occurred: " + error.message, event.threadID, event.messageID);
    }
  }
};
