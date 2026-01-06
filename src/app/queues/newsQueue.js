import Queue from "better-queue";
import axios from "axios";
import prisma from "../../../libs/prisma.js"; // ✅ Correct

let messageCount = 0;
let batchStartTime = Date.now();

export const newsQueue = new Queue(
  async (news, cb) => {
    try {
      const now = Date.now();
      const timeSinceStart = now - batchStartTime;

      if (messageCount >= 10 && timeSinceStart < 5 * 60 * 1000) {
        const waitTime = 5 * 60 * 1000 - timeSinceStart;
        console.log(
          `⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        messageCount = 0;
        batchStartTime = Date.now();
      }

      const caption = `
        📰 *${escapeMarkdown(news.headline)}*
        📂 ${escapeMarkdown(news.category)} | 📅 ${new Date(
                news.datetime
            ).toLocaleDateString()}
        📰 Source: ${escapeMarkdown(news.source)}
        ${escapeMarkdown(news.summary)}
        🔗 [Read More](${news.url})
    `.trim();

      if (news.image) {
        await axios.get(
          `https://api.telegram.org/bot${process.env.BOT_KEY}/sendPhoto`,
          {
            params: {
              chat_id: process.env.CHAT_ID,
              photo: news.image,
              caption: caption,
              parse_mode: "Markdown",
            },
          }
        );
      } else {
        await axios.get(
          `https://api.telegram.org/bot${process.env.BOT_KEY}/sendMessage`,
          {
            params: {
              chat_id: process.env.CHAT_ID,
              text: caption,
              parse_mode: "Markdown",
              disable_web_page_preview: false,
            },
          }
        );
      }

      await prisma.news.update({
        where: { id: news.id },
        data: { isSent: true },
      });

      messageCount++;
      console.log(
        `✓ Sent: ${news.headline.substring(0, 50)}... (${messageCount}/5)`
      );

      if (messageCount === 10) {
        console.log("📦 Batch complete. Starting new batch in 5 minutes...");
      }

      cb(null, { success: true, newsId: news.id });
    } catch (error) {
      console.error(`✗ Failed to send news ${news.id}:`, error.message);
      cb(error);
    }
  },
  {
    concurrent: 1, // Process one at a time
    maxRetries: 3,
    retryDelay: 2000,
  }
);

function escapeMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/\_/g, "\\_")
    .replace(/\*/g, "\\*")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\~/g, "\\~")
    .replace(/\`/g, "\\`")
    .replace(/\>/g, "\\>")
    .replace(/\#/g, "\\#")
    .replace(/\+/g, "\\+")
    .replace(/\-/g, "\\-")
    .replace(/\=/g, "\\=")
    .replace(/\|/g, "\\|")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\./g, "\\.")
    .replace(/\!/g, "\\!");
}
