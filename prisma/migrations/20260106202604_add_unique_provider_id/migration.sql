/*
  Warnings:

  - A unique constraint covering the columns `[provider_id]` on the table `news` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "news_provider_id_key" ON "news"("provider_id");
