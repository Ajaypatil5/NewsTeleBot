// routes/users.js
import express from "express";
import { newsCron } from "../services/telegram/newsCron.service.js";
import { sendMessage } from "../services/telegram/telegramMessageSender.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  return res.json(await newsCron(req));
});

router.get("/send", async (req, res) => {
  const result = await sendMessage(req, res);
  return res.json({ success: true });
});

export default router;
