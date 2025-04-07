import fsp from 'fs/promises'
import { PrismaClient } from '@prisma/client'
import createError from 'http-errors'
import { FileHtmlTable } from '../schemas/fileHtml.type'
import { getPathDownloadsFile, Format, getFileNameWithoutExtension, removeItem } from './archive.services'
import { ArchiveTable } from '../schemas/archiveTable.type'
import { existsSync } from 'fs'
import puppeteer, { Browser } from 'puppeteer'
import { performance } from 'perf_hooks'
import { createLog } from './pdfConversionLog.services'
import process from 'process'

const prisma = new PrismaClient()

const enum Extension {
    Pdf = '.pdf'
}

const getArchiveNameWithoutExtension = async(archiveId: string): Promise<string> => {
    const currentArchive: ArchiveTable | null = await prisma.archive.findUnique({
        where: {
            id: archiveId
        }
    }) 
        if (!currentArchive) throw createError(404, 'Archive with current id do not exist')
        return getFileNameWithoutExtension(currentArchive.archiveName)
}

const generatePDF = async (htmlFilePath: string, outputPath: string): Promise<void> => {
    try {
    const browser: Browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox'], 
    });
  
    const page = await browser.newPage();
  
    const fileUrl: string = `file://${htmlFilePath}`;
    await page.goto(fileUrl, {
      waitUntil: 'networkidle0',
    });
  
    await page.pdf({ 
      path: outputPath,
      format: 'A4',
    });

    await browser.close();
}catch(error) {
    if (error instanceof Error) throw createError(500,`Error with generate pdf: ${error.message}`)
        else throw createError(500, `Error with generate pdf: ${error}`)  
}
  };

  const changeExtensionFile = (currentFileName : string, newExtension: Extension): string => {
    const [filename, extension] = currentFileName.split('.');
    return `${filename}${newExtension}`
  }

  const updateSuccessConversionInDb = async(id: string, nameNewFile: string): Promise<void> => {
    try {
   await prisma.fileHtml.update({
    where: { id },
    data: { fileName: nameNewFile, isConversion: true },
    })
}catch(error) {
    if (error instanceof Error) throw createError(500,`Error with update success conversion: ${error.message}`)
        else throw createError(500, `Error with update success conversion: ${error}`) 
}
   }

   const updateUnsuccessConversionInDb = async(id: string, nameNewFile: string): Promise<void> => {
    try {
   await prisma.fileHtml.update({
    where: { id },
    data: { fileName: nameNewFile, isConversion: false },
    })
}catch(error) {
    if (error instanceof Error) throw createError(500,`Error with update unsuccess conversion: ${error.message}`)
        else throw createError(500, `Error with update unsuccess conversion: ${error}`) 
}
   }

   const errorHandlerAfterGeneratePdf = async (currentPdfPath: string,nameHtmlFile: string, id: string, logId: string ) => {
    try {
    const currentFileHtml: FileHtmlTable | null = await prisma.fileHtml.findUnique({ where: { id } }) 
    await prisma.pdfConversionLog.delete({where: {id: logId}})
    if (currentFileHtml && currentFileHtml.isConversion === true) await updateUnsuccessConversionInDb(id, nameHtmlFile)
    await fsp.rm(currentPdfPath, {recursive: true})
    }catch(error) {
        if (error instanceof Error) throw new Error(`Error with error handler after generate pdf: ${error.message}`)
            else throw new Error(`Error with error handler after generate pdf: ${error}`) 
    }
}


export const convertHtmlToPdf = async (id: string): Promise<void> => {
    const currentHtmlFile: FileHtmlTable | null = await prisma.fileHtml.findFirst({
        where: { id }
    }) 

    if (!currentHtmlFile) throw createError(404, 'Html file with current id do not exist')
        
    const currentResourceFormat: Format = Format.Resource
    const ArchiveNameHtml: string = await getArchiveNameWithoutExtension(currentHtmlFile.archiveId)
    const currentHtmlPath: string = await getPathDownloadsFile(currentHtmlFile.fileName, currentResourceFormat,ArchiveNameHtml)

    if (!existsSync(currentHtmlPath)) throw createError(409, 'The html file do not exists in the folder')

        const newFileExtension: Extension = Extension.Pdf   
        const nameNewPdfFile: string = changeExtensionFile(currentHtmlFile.fileName, newFileExtension)
        const currentNewPdfPath: string = await getPathDownloadsFile(nameNewPdfFile, currentResourceFormat, ArchiveNameHtml)

        if (existsSync(currentNewPdfPath)) throw createError(400, 'The pdf file already exists in the folder')
            
            const start: number = performance.now();
            const memoryBefore: NodeJS.MemoryUsage = process.memoryUsage(); 
            await generatePDF(currentHtmlPath,currentNewPdfPath)
            const { rss, external, heapUsed, arrayBuffers } = process.memoryUsage();
            const wastedTime: string = (performance.now() - start).toFixed(2);
            const wastedMemory: string = ((rss + external + heapUsed + arrayBuffers) / (1024 * 1024)).toFixed(2);
            const errorHandlerCreateLog = async (): Promise<void> =>  await fsp.rm(currentNewPdfPath)
            const logId: string = await createLog(currentHtmlFile.fileName,wastedTime,wastedMemory,errorHandlerCreateLog)
            
            try {
                await updateSuccessConversionInDb(id, nameNewPdfFile)
                await removeItem(currentHtmlPath)
            }catch(error){
                await errorHandlerAfterGeneratePdf(currentNewPdfPath, currentHtmlFile.fileName,id, logId )
                if (error instanceof Error) throw createError(500,`Error after generate pdf: ${error.message}`)
                    else throw createError(500, `Error after generate pdf: ${error}`)  
            }
}