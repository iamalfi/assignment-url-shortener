-- CreateTable
CREATE TABLE "url" (
    "id" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "click_count" INTEGER NOT NULL,
    "short_code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "url_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "url_short_code_key" ON "url"("short_code");
