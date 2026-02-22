const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "botadminwelcome",
    eventType: ["log:subscribe"],
    version: "3.0",
    author: "Raihan Fiba",
    description: "Welcome bot admin + mention who added"
  },
  onStart: async function () {},
  onEvent: async function ({ event, api }) {
    const { threadID, logMessageData, author } = event;
    const botAdmins = ["61582686388613", ""]; // Your bot admin IDs

    if (!logMessageData || !logMessageData.addedParticipants) return;

    const threadInfo = await api.getThreadInfo(threadID);
    const groupName = threadInfo.threadName || "this group";
    const memberCount = threadInfo.participantIDs.length;
    const adminIDs = threadInfo.adminIDs.map(i => i.id);

    // Get admin names
    let adminNames = [];
    const userInfo = await api.getUserInfo(adminIDs);
    for (const id of adminIDs) {
      adminNames.push(userInfo[id].name);
    }
    const adminList = adminNames.join(", ");

    // Get who added
    const adderInfo = await api.getUserInfo(author);
    const adderName = adderInfo[author]?.name || "Someone";

    for (const participant of logMessageData.addedParticipants) {
      if (botAdmins.includes(participant.userFbId)) {
        const time = moment().tz("Asia/Dhaka").format("dddd, hh:mm A");

        const body = `🎀 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐌𝐘 𝐎𝐖𝐍𝐄𝐑 🎀\n\n` +
                     `👑 𝐍𝐚𝐦𝐞: ${participant.fullName}\n` +
                     `💬 𝐆𝐫𝐨𝐮𝐩: ${groupName}\n` +
                     `👥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${memberCount}\n` +
                     `⏰ 𝐓𝐢𝐦𝐞: ${time}\n` +
                     `🔑 𝐀𝐝𝐦𝐢𝐧𝐬: ${adminList}\n\n` +
                     `🙏 𝐓𝐡𝐚𝐧𝐤𝐬 𝐭𝐨: ${adderName} 𝐟𝐨𝐫 𝐚𝐝𝐝𝐢𝐧𝐠 𝐦𝐲 𝐨𝐰𝐧𝐞𝐫!`;

        await api.sendMessage(
          {
            body,
            mentions: [
              { tag: participant.fullName, id: participant.userFbId },
              { tag: adderName, id: author }
            ],
            attachment: await global.utils.getStreamFromURL("https://tinyurl.com/2c4fqu35")
          },
          threadID
        );
      }
    }
  }
};
