-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(510) NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" VARCHAR(510) NOT NULL,
    "fileUrl" VARCHAR(510) NOT NULL,
    "localization" TEXT NOT NULL,
    "eventLink" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneralEvent" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(510) NOT NULL,
    "description" VARCHAR(510) NOT NULL,
    "imageUrl" VARCHAR(510) NOT NULL,
    "localization" TEXT NOT NULL,
    "eventLink" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "GeneralEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
