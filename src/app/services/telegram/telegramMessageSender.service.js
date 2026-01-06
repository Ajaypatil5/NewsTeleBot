import prisma from "../../../../libs/prisma.js";
import { newsQueue } from "../../queues/newsQueue.js";

export async function sendMessage(req, res) {
  try {
    const allNews = await prisma.news.findMany({
      where: {
        isSent: false,
      },
      orderBy: {
        datetime: "desc",
      },
    });

    if (allNews.length === 0) {
      return res.json({
        success: true,
        message: "No unsent news to process",
      });
    }

    console.log(`Found ${allNews.length} unsent news items`);

    // Add all news to queue
    allNews.forEach((news) => {
      newsQueue.push(news);
    });

    return res.json({
      success: true,
      message: `Added ${allNews.length} news items to queue`,
      totalNews: allNews.length,
      estimatedTime: `${Math.ceil(allNews.length / 10) * 5} minutes`,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
