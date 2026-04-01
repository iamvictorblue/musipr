-- CreateTable
CREATE TABLE "EventReminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedMerchItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "merchItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedMerchItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventReminder_userId_eventId_key" ON "EventReminder"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedMerchItem_userId_merchItemId_key" ON "SavedMerchItem"("userId", "merchItemId");

-- AddForeignKey
ALTER TABLE "EventReminder" ADD CONSTRAINT "EventReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReminder" ADD CONSTRAINT "EventReminder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedMerchItem" ADD CONSTRAINT "SavedMerchItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedMerchItem" ADD CONSTRAINT "SavedMerchItem_merchItemId_fkey" FOREIGN KEY ("merchItemId") REFERENCES "MerchItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
