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
    "fileName" TEXT NOT NULL,
    "isConversion" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FileHtml_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdfConversionLog" (
    "id" TEXT NOT NULL,
    "fileHtmlName" TEXT NOT NULL,
    "wastedTime" TEXT,
    "wastedMemory" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PdfConversionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileHtml_archiveId_key" ON "FileHtml"("archiveId");

-- CreateIndex
CREATE UNIQUE INDEX "FileHtml_fileName_key" ON "FileHtml"("fileName");

-- AddForeignKey
ALTER TABLE "FileHtml" ADD CONSTRAINT "FileHtml_archiveId_fkey" FOREIGN KEY ("archiveId") REFERENCES "Archive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdfConversionLog" ADD CONSTRAINT "PdfConversionLog_fileHtmlName_fkey" FOREIGN KEY ("fileHtmlName") REFERENCES "FileHtml"("fileName") ON DELETE RESTRICT ON UPDATE CASCADE;
