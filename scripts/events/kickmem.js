const axios = require("axios");

module.exports = {
  config: {
    name: "kickmem",
    version: "3.1",
    author: "Arijit",
    category: "events"
  },

  onStart: async ({ threadsData, message, event, api, usersData }) => {
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    if (!threadData?.settings?.sendLeaveMessage) return;

    const { leftParticipantFbId } = event.logMessageData;
    if (leftParticipantFbId == api.getCurrentUserID()) return;

    const userName = await usersData.getName(leftParticipantFbId);

    // ✅ Kick detection (left != author)
    const isKicked = leftParticipantFbId != event.author;
    if (!isKicked) return;

    const text = `👉 ${userName} গ্রুপে থাকার যোগ্যতা নেই দেখে kick খেয়েছে 🤣`;

    // ✅ তোমার নতুন PostImage GIF লিঙ্ক
    const gifUrl = "https://i.postimg.cc/sDFQg1tr/VID-20250826-WA0001.gif";

    try {
      const response = await axios.get(gifUrl, { responseType: "stream" });

      await message.send({
        body: text,
        mentions: [{ tag: userName, id: leftParticipantFbId }],
        attachment: response.data
      });
    } catch (err) {
      console.error("Kickmem GIF fetch failed:", err.message);

      // ✅ Fallback: শুধু টেক্সট পাঠাবে যদি GIF লোড না হয়
      await message.send({
        body: text,
        mentions: [{ tag: userName, id: leftParticipantFbId }]
      });
    }
  }
};
