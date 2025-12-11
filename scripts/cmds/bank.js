const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

try {
    registerFont(path.join(__dirname, "assets", "font", "BebasNeue-Regular.ttf"), { family: "Bebas" });
} catch (e) { /* ignore if font not present */ }

const BANK_NAME = "Premium Digital Bank";
const CURRENCY_SYMBOL = "$";
const CARD_LOGO_TEXT = "Premium Wallet";
const CACHE_DIR = path.join(__dirname, "cache");
fs.mkdirSync(CACHE_DIR, { recursive: true });

module.exports = {
    config: {
        name: "bank",
        version: "4.1",
        author: "Azadx69",
        role: 0,
        shortDescription: "Full Banking System (cards, savings, statements)",
        longDescription: "Complete banking with ATM card generator (premium), transactions, savings, statements, and multi-card support.",
        category: "finance",
    },

    // ------------------- Utilities -------------------
    formatMoney(amount) {
        if (amount === undefined || amount === null || isNaN(Number(amount))) return `${CURRENCY_SYMBOL}0`;
        amount = Number(amount);
        const abs = Math.abs(amount);
        const scales = [
            { value: 1e15, suffix: 'Q' },
            { value: 1e12, suffix: 'T' },
            { value: 1e9, suffix: 'B' },
            { value: 1e6, suffix: 'M' },
            { value: 1e3, suffix: 'k' }
        ];
        for (let scale of scales) {
            if (abs >= scale.value) {
                let val = amount / scale.value;
                const text = (val % 1 === 0) ? `${val}${scale.suffix}` : `${val.toFixed(2)}${scale.suffix}`;
                return `${CURRENCY_SYMBOL}${text}`;
            }
        }
        return `${CURRENCY_SYMBOL}${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    },

    generateCardNumber() {
        return "5284 " +
            ("" + Math.floor(1000 + Math.random() * 9000)) + " " +
            ("" + Math.floor(1000 + Math.random() * 9000)) + " " +
            ("" + Math.floor(1000 + Math.random() * 9000));
    },

    generateCVV() { return Math.floor(100 + Math.random() * 900).toString(); },
    generatePIN() { return Math.floor(1000 + Math.random() * 9000).toString(); },

    getExpiry() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear() + 4;
        return `${month.toString().padStart(2, "0")}/${String(year).slice(-2)}`;
    },

    generateAccountNumber() {
        return Math.floor(1000000000 + Math.random() * 9000000000).toString();
    },

    generateTransactionId() {
        const t = Date.now().toString(36);
        const r = Math.floor(1000 + Math.random() * 9000).toString(36);
        return `TX-${t}-${r}`.toUpperCase();
    },

    nowISO() {
        return new Date().toISOString();
    },

    SYSTEM: {
        MIN_DEPOSIT: 1,
        MIN_WITHDRAW: 1,
        MIN_TRANSFER: 1,
        DAILY_TRANSFER_LIMIT: 50000,
        DAILY_WITHDRAW_LIMIT: 20000,
        MAX_CARDS_PER_USER: 3
    },

    // ------------------- Card Designs -------------------
    cardDesigns: {
        premium: {
            gradient: ["#0b0f14", "#1a1a1a", "#2b2b2b"],
            accent: "#d4af37",
            chipColor: "#b8860b",
            hologramColors: ["#c8a454", "#f4d68d"],
            textLight: "#ffffff",
            textMuted: "#cfcfcf"
        },
        blue: {
            gradient: ["#0f172a", "#03203c", "#08324b"],
            accent: "#66c0ff",
            chipColor: "#c0d8ff",
            hologramColors: ["#5ad1ff", "#8ee9ff"],
            textLight: "#ffffff",
            textMuted: "#c8d8e8"
        }
    },

    // ------------------- Card Image Generator -------------------
    async createRealCard(card, username = "User", balance = 0, transactions = [], designKey = "premium") {
        const width = 900, height = 560;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        const d = this.cardDesigns[designKey] || this.cardDesigns.premium;

        // Background Gradient
        const bg = ctx.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, d.gradient[0]);
        bg.addColorStop(0.5, d.gradient[1]);
        bg.addColorStop(1, d.gradient[2]);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        // Accent circles
        ctx.globalAlpha = 0.06;
        for (let i = 0; i < 90; i++) {
            ctx.beginPath();
            ctx.arc(40 + (i * 10) % width, (i * 7) % height, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = d.accent;
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Card logo
        ctx.font = "bold 36px Bebas, sans-serif";
        ctx.fillStyle = d.accent;
        ctx.textAlign = "right";
        ctx.fillText(CARD_LOGO_TEXT, width - 40, 70);

        // Chip
        const chipX = 60, chipY = 150, chipW = 140, chipH = 86;
        ctx.fillStyle = d.chipColor;
        roundRect(ctx, chipX, chipY, chipW, chipH, 8, true, false);

        // Embossed card number
        ctx.textAlign = "left";
        ctx.font = "48px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.fillText(card.number, 60, 340);
        ctx.fillStyle = d.textLight;
        ctx.fillText(card.number, 62, 336);

        // Username
        ctx.font = "28px sans-serif";
        ctx.fillStyle = d.textMuted;
        ctx.fillText(username.toUpperCase(), 60, 420);
        ctx.font = "18px sans-serif";
        ctx.fillText("CARDHOLDER", 60, 400);

        // Expiry
        ctx.textAlign = "right";
        ctx.font = "20px sans-serif";
        ctx.fillStyle = d.textMuted;
        ctx.fillText("VALID THRU", width - 60, 300);
        ctx.font = "36px monospace";
        ctx.fillStyle = d.textLight;
        ctx.fillText(card.expiry, width - 60, 340);

        // CVV
        ctx.font = "20px sans-serif";
        ctx.fillStyle = d.textMuted;
        ctx.fillText("CVV", width - 60, 400);
        ctx.font = "28px monospace";
        ctx.fillStyle = d.textLight;
        ctx.fillText("***", width - 60, 430);

        // Balance
        ctx.font = "24px sans-serif";
        ctx.fillStyle = d.accent;
        ctx.textAlign = "right";
        ctx.fillText(`Balance: ${this.formatMoney(balance)}`, width - 60, height - 40);

        // Last transaction
        if (transactions && transactions.length) {
            const lastTx = transactions[transactions.length - 1];
            const typeSymbol = lastTx.type === "sent" ? "➡️" : "⬅️";
            const amountText = `${this.formatMoney(lastTx.amount)}`;
            const info = `${typeSymbol} ${amountText} ${lastTx.type === "sent" ? "Sent" : "Received"}`;
            ctx.textAlign = "left";
            ctx.font = "20px sans-serif";
            ctx.fillStyle = d.textMuted;
            ctx.fillText(info, 60, height - 40);
        }

        // Hologram circles
        ctx.globalAlpha = 0.85;
        ctx.beginPath(); ctx.arc(width - 140, 90, 36, 0, Math.PI * 2); ctx.fillStyle = d.hologramColors[0]; ctx.fill();
        ctx.beginPath(); ctx.arc(width - 100, 90, 28, 0, Math.PI * 2); ctx.fillStyle = d.hologramColors[1]; ctx.fill();
        ctx.globalAlpha = 1;

        // Signature strip
        ctx.fillStyle = "rgba(255,255,255,0.06)";
        roundRect(ctx, 380, 480, 380, 38, 6, true, false);

        const filePath = path.join(CACHE_DIR, `${Date.now()}_card.png`);
        fs.writeFileSync(filePath, canvas.toBuffer("image/png"));
        return filePath;

        function roundRect(ctx, x, y, w, h, r, fill, stroke) {
            if (typeof r === 'undefined') r = 5;
            if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
            ctx.beginPath();
            ctx.moveTo(x + r.tl, y);
            ctx.lineTo(x + w - r.tr, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
            ctx.lineTo(x + w, y + h - r.br);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
            ctx.lineTo(x + r.bl, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
            ctx.lineTo(x, y + r.tl);
            ctx.quadraticCurveTo(x, y, x + r.tl, y);
            ctx.closePath();
            if (fill) ctx.fill();
            if (stroke) ctx.stroke();
        }
    },

    // ------------------- Languages -------------------
    langs: {
        en: {
            notRegistered: "❌ You don't have a bank account!\nUse: bank register to sign up",
            alreadyRegistered: "✅ You already have a bank account!",
            registered: `🎉 REGISTRATION SUCCESSFUL!\n\n🏦 ${BANK_NAME}\n📋 Account No: %1\n💰 Balance: ${CURRENCY_SYMBOL}0\n📅 Opened: %2\nWelcome to ${BANK_NAME}!`,
            balance: `💳 ACCOUNT INFORMATION\n\n🏦 ${BANK_NAME}\n👤 Holder: %1\n📋 Account: %2\n💰 Balance: %3\n💎 Savings: %4`,
            depositSuccess: "✅ Deposit successful!",
            withdrawSuccess: "✅ Withdrawal successful!",
            transferSuccess: "✅ Transfer successful!",
            invalidAmount: "❌ Invalid amount!",
            insufficientBalance: "❌ Insufficient bank balance!",
            insufficientWallet: "❌ Insufficient wallet balance!",
            minDeposit: `❌ Minimum deposit is ${CURRENCY_SYMBOL}${1}`,
            minWithdraw: `❌ Minimum withdrawal is ${CURRENCY_SYMBOL}${1}`,
            minTransfer: `❌ Minimum transfer is ${CURRENCY_SYMBOL}${1}`,
            dailyLimitReached: "❌ You've reached today's transaction limit!",
            noTransactions: "📭 No transactions yet!",
            noCard: "❌ You don't have an ATM card!\nUse: bank card apply <type>",
            cardApplied: "✅ Card application successful! Card ID: %1 | PIN: %2",
            cardActivated: "✅ Card has been activated!",
            cardBlocked: "✅ Card has been blocked!",
            pinChanged: "✅ PIN changed successfully!",
            invalidPin: "❌ PIN must be 4 digits!",
            savingsDeposited: "✅ Savings deposit successful!",
            savingsWithdrawn: "✅ Savings withdrawal successful!",
            noSavings: "❌ You have no savings!"
        }
    },

    // ------------------- Main Handler -------------------
    async onStart({ message, args, usersData, event }) {
        try {
            const uid = event.senderID;
            const action = (args[0] || "").toLowerCase();
            let userData = await usersData.get(uid);
            if (!userData.data) userData.data = {};
            if (!userData.data.bank) {
                userData.data.bank = {
                    accountNumber: this.generateAccountNumber(),
                    balance: 0,
                    savings: 0,
                    registered: false,
                    cards: [],
                    transactions: [],
                    totalDeposited: 0,
                    totalWithdrawn: 0,
                    totalTransferred: 0,
                    daily: { transferredToday: 0, withdrawnToday: 0, lastReset: this.nowISO() },
                    createdAt: this.nowISO()
                };
            }

            const saveUser = async () => await usersData.set(uid, { data: userData.data });
            const findCardById = (id) => userData.data.bank.cards.find(c => c.id === id);

            // ---------- REGISTER ----------
            if (action === "register") {
                if (userData.data.bank.registered) return message.reply(this.langs.en.alreadyRegistered);
                userData.data.bank.registered = true;
                userData.data.bank.createdAt = this.nowISO();
                await saveUser();
                return message.reply(this.langs.en.registered.replace("%1", userData.data.bank.accountNumber).replace("%2", userData.data.bank.createdAt));
            }

            if (!userData.data.bank.registered) return message.reply(this.langs.en.notRegistered);

            // ---------- BALANCE ----------
            if (action === "balance") {
                const balText = this.langs.en.balance
                    .replace("%1", userData.name || "User")
                    .replace("%2", userData.data.bank.accountNumber)
                    .replace("%3", this.formatMoney(userData.data.bank.balance))
                    .replace("%4", this.formatMoney(userData.data.bank.savings || 0));
                return message.reply(balText);
            }

            // ---------- CARD FIXED: show directly ----------
            if (action === "card") {
                const cards = userData.data.bank.cards || [];

                // If no cards, prompt to apply
                if (!cards.length) {
                    return message.reply("❌ You have no ATM card.\nUse: bank card apply <type> to get one.");
                }

                // Show cards directly
                let msg = `💳 YOUR CARDS\n━━━━━━━━━━━━━━━━━\n`;
                cards.forEach(c => {
                    msg += `• ID: ${c.id} | ${c.type.toUpperCase()} | ${c.number.slice(0, 4)} **** **** ${c.number.slice(-4)} | ${c.active ? "ACTIVE" : "INACTIVE"}\n`;
                });
                return message.reply(msg);
            }

            // ---------- FALLBACK ----------
            return message.reply("❌ Invalid command.\nUse: bank register | balance | card | deposit | withdraw | transfer | history | statement | savings");
        } catch (err) {
            console.error("BANK MODULE ERROR:", err);
            return message.reply("✨ Error ✨\n➤ Something went wrong!\nPlease try again later.");
        }
    }
};
