import axios from "axios";
import prisma from "../../../../libs/prisma.js";

export async function newsCron(req) {
  try {
    const apiResponse = await axios.get(
      `https://finnhub.io/api/v1/news?category=general&token=${process.env.API_KEY}`
    );
    console.log(apiResponse.data);

    await Promise.all(
      apiResponse.data.map(async (news) => {
        const existingNews = await prisma.news.findFirst({
          where: {
            provider_id: news.id,
          },
        });

        if (existingNews) {
          await prisma.news.update({
            where: {
              id: existingNews.id,
            },
            data: {
              category: news.category,
              datetime: new Date(news.datetime * 1000),
              headline: news.headline,
              image: news.image,
              related: news.related,
              source: news.source,
              summary: news.summary,
              url: news.url,
            },
          });
        } else {
          await prisma.news.create({
            data: {
              category: news.category,
              datetime: new Date(news.datetime * 1000),
              headline: news.headline,
              provider_id: news.id,
              image: news.image,
              related: news.related,
              source: news.source,
              summary: news.summary,
              url: news.url,
            },
          });
        }
      })
    );

    return { success: true };
  } catch (error) {
    console.log("Error in newsCron:", error);
    throw error;
  }
}
