-- CreateTable
CREATE TABLE "Archive" (
    "id" TEXT NOT NULL,
    "archiveName" TEXT NOT NULL,
    "isUnzipping" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Archive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileHtml" (
    "id" TEXT NOT NULL,
    "archiveId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "isConversion" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FileHtml_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileHtml_archiveId_key" ON "FileHtml"("archiveId");

-- AddForeignKey
ALTER TABLE "FileHtml" ADD CONSTRAINT "FileHtml_archiveId_fkey" FOREIGN KEY ("archiveId") REFERENCES "Archive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
