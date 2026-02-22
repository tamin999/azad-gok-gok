const fs = require("fs-extra");

module.exports = {
  config: {
    name: "restart",
    version: "1.3",
    author: "NTKhang",
    countDown: 5,
    role: 2,
    description: {
      vi: "Khởi động lại bot",
      en: "Restart bot"
    },
    category: "Owner",
    guide: {
      vi: "   {pn}: Khởi động lại bot",
      en: "   {pn}: Restart bot"
    }
  },

  langs: {
    vi: {
      restartting: "🔄 | Đang khởi động lại bot..."
    },
    en: {
      restartting: "🔄 | Restarting bot..."
    }
  },

  onStart: async function ({ api, message, event, getLang }) {
    const { threadID } = event;
    const pathFile = `${__dirname}/tmp/restart.txt`;

    const startTime = Date.now();
    fs.ensureDirSync(`${__dirname}/tmp`);
    fs.writeFileSync(pathFile, `${threadID} ${startTime}`);

    await message.reply(getLang("restartting"));

    setTimeout(() => {
      process.exit(2);
    }, 1000);
  },

  onLoad: async function ({ api }) {
    const pathFile = `${__dirname}/tmp/restart.txt`;

    if (fs.existsSync(pathFile)) {
      try {
        const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
        console.log(`[RESTART] Found restart request for thread ${tid}`);

        const sendRestartMessage = () => {
          const restartTime = ((Date.now() - Number(time)) / 1000).toFixed(2);

          api.sendMessage(
            `✅ Bot restarted successfully!\n⏰ Time: ${restartTime}s`,
            tid,
            (err) => {
              if (err) {
                console.error("[RESTART] Error sending message:", err.message);

                setTimeout(() => {
                  console.log("[RESTART] Retrying...");
                  api.sendMessage(
                    `✅ Bot restarted successfully!\n⏰ Time: ${restartTime}s`,
                    tid,
                    (retryErr) => {
                      if (!retryErr)
                        console.log("[RESTART] ✓ Message sent successfully on retry");
                      else
                        console.error("[RESTART] ✗ Retry failed:", retryErr.message);
                    }
                  );
                }, 3000);
              } else {
                console.log("[RESTART] ✓ Message sent successfully");
              }

              try {
                fs.unlinkSync(pathFile);
                console.log("[RESTART] ✓ Cleanup completed");
              } catch (e) {
                console.error("[RESTART] Cleanup error:", e.message);
              }
            }
          );
        };

        setTimeout(sendRestartMessage, 8000);
      } catch (err) {
        console.error("[RESTART] Error in onLoad:", err.message);
      }
    }
  }
};
