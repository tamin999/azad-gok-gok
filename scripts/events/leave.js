const axios = require("axios");

module.exports = {
  config: {
    name: "leave",
    version: "2.2",
    author: "Arijit",
    category: "events"
  },

  onStart: async ({ threadsData, message, event, api, usersData }) => {
    // ✅ কাজ করবে শুধু যখন কেউ লিভ নেবে
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    if (!threadData?.settings?.sendLeaveMessage) return;

    const { leftParticipantFbId } = event.logMessageData;

    // যদি বট নিজে লিভ নেয়, তখন কোনো মেসেজ পাঠাবে না
    if (leftParticipantFbId == api.getCurrentUserID()) return;

    const userName = await usersData.getName(leftParticipantFbId);

    // ✅ শুধুমাত্র সে নিজে লিভ নিলে কাজ করবে, কিক করলে কাজ করবে না
    const isSelfLeave = leftParticipantFbId == event.author;
    if (!isSelfLeave) return;

    const text = `👉 ${userName} গ্রুপে থাকার যোগ্যতা নেই দেখে লিভ নিয়েছে 🤣`;

    // ✅ তোমার GIF লিঙ্ক
    const gifUrl = "https://i.postimg.cc/DZLhjf5r/VID-20250826-WA0002.gif";

    let gifStream = null;
    try {
      const response = await axios.get(gifUrl, { responseType: "stream" });
      gifStream = response.data;
    } catch (e) {
      console.error("GIF download error:", e.message);
    }

    const form = {
      body: text,
      mentions: [{ tag: userName, id: leftParticipantFbId }],
      attachment: gifStream || undefined
    };

    await message.send(form);

    if (!gifStream) {
      await message.send("⚠ GIF ডাউনলোড করা যায়নি। লিঙ্ক ঠিক আছে কিনা দেখে নাও।");
    }
  }
};
