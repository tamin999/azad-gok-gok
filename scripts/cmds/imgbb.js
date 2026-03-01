const axios = require("axios");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "imgbb",
    aliases: ["i"],
    version: "2.0",
    author: "Azadx69x (Edited)",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Convert an image to image URL" },
    longDescription: { en: "Upload image to Imgbb by replying to a photo or sending it directly" },
    category: "tools",
    guide: { en: "{pn} reply to an image or send an image directly" }
  },

  onStart: async function ({ api, event }) {
    try {
      // Get attachment from reply or direct send
      const attachment =
        event.messageReply?.attachments?.[0] ||
        event.attachments?.[0];

      if (!attachment || attachment.type !== "photo") {
        return api.sendMessage(
          "⚠️ Please reply to a valid image.",
          event.threadID,
          event.messageID
        );
      }

      const imageUrl = attachment.url;
      if (!imageUrl) {
        return api.sendMessage(
          "⚠️ Unable to fetch image URL.",
          event.threadID,
          event.messageID
        );
      }

      // Download image
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer"
      });

      const imageBuffer = Buffer.from(imageResponse.data);

      // Prepare form data
      const form = new FormData();
      form.append("key", "YOUR_IMGBB_API_KEY"); // 🔐 Put your API key here
      form.append("image", imageBuffer.toString("base64"));

      // Upload to imgbb
      const response = await axios.post(
        "https://api.imgbb.com/1/upload",
        form,
        { headers: form.getHeaders() }
      );

      if (!response.data.success) {
        return api.sendMessage(
          "❌ Upload failed. Try again later.",
          event.threadID,
          event.messageID
        );
      }

      const result = response.data.data;

      return api.sendMessage(
        `✅ Image Uploaded Successfully!\n\n🔗 ${result.url}`,
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error("IMGBB ERROR:", err.message);
      return api.sendMessage(
        "❌ Failed to upload image to Imgbb.",
        event.threadID,
        event.messageID
      );
    }
  }
};
