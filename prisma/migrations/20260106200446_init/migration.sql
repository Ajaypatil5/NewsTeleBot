-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "datetime" TIMESTAMP(3) NOT NULL,
    "headline" TEXT NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "related" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);
