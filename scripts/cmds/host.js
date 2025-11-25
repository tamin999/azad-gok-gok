const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");
const si = require("systeminformation");

function formatUptime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${h}h ${m}m ${s}s`;
}

module.exports = {
  config: {
    name: "host",
    aliases: [],
    version: "5.0",
    author: "Azadx69x",//Author change korle tor marechudi 
    countDown: 5,
    role: 0,
    shortDescription: "Animated system dashboard GIF",
    longDescription: "circle dashboard with animated.",
    category: "system"
  },

  onStart: async function ({ api, event }) {
    try {
      const cpuInfo = await si.cpu();
      const tempInfo = await si.cpuTemperature().catch(() => ({}));
      const loadInfo = await si.currentLoad().catch(() => ({}));
      
      const cpuSpeedGHz = cpuInfo.speed || (os.cpus && os.cpus()[0] && (os.cpus()[0].speed/1000).toFixed(2)) || "0";
      const cpuSpeedText = Math.floor((parseFloat(cpuSpeedGHz) || 0) * 1000) + " MHz";
      const ramUsedGB = ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(1);
      const ramTotalGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);
      const tempMain = (tempInfo.main || 0).toFixed(0);
      
      const canvasWidth = 1600;
      const canvasHeight = 1500;
      const frameCount = 24;
      const delay = 80;
      const outputPath = path.join(__dirname, "cache", `host_panel_${Date.now()}.gif`);
      await fs.ensureDir(path.dirname(outputPath));

      const encoder = new GIFEncoder(canvasWidth, canvasHeight);
      const gifStream = fs.createWriteStream(outputPath);
      encoder.createReadStream().pipe(gifStream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(delay);
      encoder.setQuality(10);

      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");
      
      const ramPercent = Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100);
      const cpuPercent = Math.min(Math.round((loadInfo.currentLoad || 0)), 100);

      const dataTemplate = [
        { name: "CPU", color: "#00eaff", info: cpuSpeedText, pct: cpuPercent },
        { name: "RAM", color: "#79ff6f", info: `${ramUsedGB} / ${ramTotalGB} GB`, pct: ramPercent },
        { name: "Disk", color: "#ffd54f", info: "42% Used", pct: 42 },
        { name: "Net", color: "#ff57c8", info: "12 Mbps", pct: 12 },

        { name: "Render", color: "#42a5f5", info: "Active", pct: 88 },
        { name: "Railway", color: "#ff7043", info: "Stable", pct: 63 },
        { name: "Linux", color: "#7e57c2", info: os.platform(), pct: 54 },
        { name: "Node", color: "#29b6f6", info: process.version, pct: 77 },

        { name: "Cores", color: "#66bb6a", info: os.cpus().length + " Cores", pct: Math.min(os.cpus().length * 10, 100) },
        { name: "Uptime", color: "#ffee58", info: formatUptime(os.uptime()), pct: 100 },
        { name: "Memory", color: "#ff8a65", info: (os.freemem()/1024/1024/1024).toFixed(1) + " GB Free", pct: Math.min(ramPercent, 100) },
        { name: "Temp", color: "#ef5350", info: tempMain + "°C", pct: 35 }
      ];
      
      const grid = [];
      const xStart = 250, yStart = 350, gapX = 350, gapY = 350;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          grid.push({ x: xStart + c * gapX, y: yStart + r * gapY });
        }
      }
      
      for (let f = 0; f < frameCount; f++) {
        const hue = (f * 360 / frameCount) % 360;
        const glowColor = `hsl(${hue}, 100%, 65%)`;
        
        const bg = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        bg.addColorStop(0, "#07080b");
        bg.addColorStop(1, "#071022");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.ellipse(canvasWidth / 2, canvasHeight / 2 - 100, 700, 380, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "58px Sans";
        ctx.textAlign = "center";
        ctx.fillText("System Dashboard", canvasWidth / 2, 120);
        
        for (let i = 0; i < 12; i++) {
          const item = dataTemplate[i];
          const pos = grid[i];
          const percent = item.pct;
          const end = (percent / 100) * Math.PI * 2 - Math.PI / 2;
          
          const offsetHue = (hue + i * 28) % 360;
          const ringColor = `hsl(${offsetHue}, 95%, 60%)`;
          const soft = `hsla(${offsetHue}, 95%, 60%, 0.18)`;
          
          ctx.save();
          ctx.beginPath();
          ctx.fillStyle = soft;
          ctx.shadowColor = ringColor;
          ctx.shadowBlur = 40;
          ctx.arc(pos.x, pos.y, 140, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          
          ctx.beginPath();
          ctx.lineWidth = 18;
          ctx.strokeStyle = "rgba(255,255,255,0.08)";
          ctx.arc(pos.x, pos.y, 120, 0, Math.PI * 2);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.lineWidth = 18;
          ctx.strokeStyle = ringColor;
          ctx.lineCap = "round";
          ctx.arc(pos.x, pos.y, 120, -Math.PI / 2, end);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.fillStyle = "rgba(8,12,18,0.6)";
          ctx.arc(pos.x, pos.y, 98, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = "#ffffff";
          ctx.font = "28px Sans";
          ctx.textAlign = "center";
          ctx.fillText(item.name, pos.x, pos.y - 28);
          
          ctx.font = "34px Sans";
          ctx.fillStyle = "#bdeaff";
          ctx.fillText(percent + "%", pos.x, pos.y + 6);
          
          ctx.font = "22px Sans";
          ctx.fillStyle = "#E5E7EB";
          ctx.fillText(item.info, pos.x, pos.y + 44);
        }
        
        ctx.textAlign = "right";
        ctx.fillStyle = "#ccc";
        ctx.font = "14px Sans";
        const now = new Date();
        ctx.fillText(now.toLocaleDateString("en-GB"), canvasWidth - 24, 34);
        ctx.fillText(now.toLocaleTimeString("en-GB"), canvasWidth - 24, 58);

        ctx.textAlign = "left";
        ctx.fillStyle = "#ccc";
        ctx.fillText(`OS: ${os.platform()} (${os.arch()})`, 24, 34);
        ctx.fillText(`Host: ${cpuInfo.manufacturer} ${cpuInfo.brand}`, 24, 58);
        
        encoder.addFrame(ctx);
      }

      encoder.finish();
      
      await new Promise((resolve) => gifStream.on("finish", resolve));
      
      await api.sendMessage(
        {
          body: "✔ Host Dashboard",
          attachment: fs.createReadStream(outputPath)
        },
        event.threadID,
        event.messageID
      );
      
      setTimeout(() => {
        fs.unlink(outputPath).catch(() => {});
      }, 5000);

    } catch (err) {
      console.error("HOST ERROR:", err);
      api.sendMessage("❌ Failed to generate dashboard : " + (err.message || err), event.threadID);
    }
  }
};
