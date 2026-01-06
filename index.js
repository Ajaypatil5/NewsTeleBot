import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import router from "./src/app/routes/cronRoutes.routes.js";
import { newsCron } from "./src/app/services/telegram/newsCron.service.js";
import { sendMessage } from "./src/app/services/telegram/telegramMessageSender.service.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use('/tele', router);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* -------------------- Cron Jobs -------------------- */

cron.schedule("0 */2 * * *", async () => {
  console.log("[CRON] 📰 News fetch started at", new Date().toISOString());
  
  try {
    await newsCron({});
    console.log("[CRON] ✅ News fetch completed");
  } catch (err) {
    console.error("[CRON] ❌ News fetch failed:", err.message);
  }
});


cron.schedule("0 */3 * * *", async () => {
  console.log(
    "[CRON] 📤 Sending news messages started at", new Date().toISOString()
  );
  try {
    // Create mock req/res objects for the cron
    const mockReq = {};
    const mockRes = {
      json: (data) => {
        console.log("[CRON] ✅", data.message);
        return data;
      },
      status: (code) => ({
        json: (data) => {
          console.error("[CRON] ❌", data);
          return data;
        },
      }),
    };

    await sendMessage(mockReq, mockRes);
  } catch (err) {
    console.error("[CRON] ❌ Message sending failed:", err.message);
  }
});

/* -------------------- Server Bootstrap -------------------- */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📅 News fetch cron: Every 2 hours`);
  console.log(`📤 Send messages cron: 9 AM, 3 PM, 9 PM daily`);
});