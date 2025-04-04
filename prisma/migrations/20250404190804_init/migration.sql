-- CreateTable
CREATE TABLE "Archive" (
    "id" TEXT NOT NULL,
    "archiveName" TEXT NOT NULL,
    "successUnzipping" BOOLEAN,

    CONSTRAINT "Archive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "archiveId" TEXT NOT NULL,
    "successConversion" BOOLEAN NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_archiveId_fkey" FOREIGN KEY ("archiveId") REFERENCES "Archive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
