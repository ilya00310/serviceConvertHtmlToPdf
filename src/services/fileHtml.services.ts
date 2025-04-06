import fsp from 'fs/promises'
import { PrismaClient } from '@prisma/client'
import createError from 'http-errors'
import { FileHtmlTable } from '../schemas/fileHtml.type'
import { getPathDownloadsFile, Format, FilenameHtml, formatFolderName, getFileNameWithoutExtension, removeItem } from './archive.services'
import { ArchiveTable } from '../schemas/archiveTable.type'
import { existsSync } from 'fs'
import puppeteer from 'puppeteer'
import path from 'path'

const prisma = new PrismaClient()

const enum Extension {
    Pdf = '.pdf'
}

const getArchiveNameWithoutExtension = async(archiveId: string): Promise<string> => {
    const currentArchive: ArchiveTable = await prisma.archive.findUnique({
        where: {
            id: archiveId
        }
    }) as ArchiveTable
        if (!currentArchive) throw createError(404, 'Archive with current id do not exist')
        return getFileNameWithoutExtension(currentArchive.archiveName)
}

const generatePDF = async (htmlFilePath: string, outputPath: string): Promise<void> => {
    try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox'], 
    });
  
    const page = await browser.newPage();
  
    const fileUrl = `file://${htmlFilePath}`;
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
    data: { filename: nameNewFile, isConversion: true },
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
    data: { filename: nameNewFile, isConversion: false },
    })
}catch(error) {
    if (error instanceof Error) throw createError(500,`Error with update unsuccess conversion: ${error.message}`)
        else throw createError(500, `Error with update unsuccess conversion: ${error}`) 
}
   }

   const errorHandlerAfterGeneratePdf = async (currentPdfPath: string,nameHtmlFile: string, id: string ) => {
    try {
    const currentFileHtml: FileHtmlTable = await prisma.fileHtml.findUnique({ where: { id } }) as FileHtmlTable
    if (currentFileHtml.isConversion === true) await updateUnsuccessConversionInDb(id, nameHtmlFile)
    await fsp.rm(currentPdfPath, {recursive: true})
    }catch(error) {
        if (error instanceof Error) throw new Error(`Error with error handler after generate pdf: ${error.message}`)
            else throw new Error(`Error with error handler after generate pdf: ${error}`) 
    }
}


export const convertHtmlToPdf = async (id: string): Promise<void> => {
    const currentHtmlFile: FileHtmlTable = await prisma.fileHtml.findUnique({
        where: { id }
    }) as FileHtmlTable

    if (!currentHtmlFile) throw createError(404, 'Html file with current id do not exist')
        
    const currentResourceFormat: Format = Format.Resource
    const ArchiveNameHtml: string = await getArchiveNameWithoutExtension(currentHtmlFile.archiveId)
    const currentHtmlPath: string = await getPathDownloadsFile(currentHtmlFile.filename, currentResourceFormat,ArchiveNameHtml)

    if (!existsSync(currentHtmlPath)) throw createError(409, 'The html file do not exists in the folder')

        const newFileExtension: Extension = Extension.Pdf
        const nameNewPdfFile: string = changeExtensionFile(currentHtmlFile.filename, newFileExtension)
        const currentNewPdfPath: string = await getPathDownloadsFile(nameNewPdfFile, currentResourceFormat, ArchiveNameHtml)

        if (existsSync(currentNewPdfPath)) throw createError(400, 'The pdf file already exists in the folder')

            await generatePDF(currentHtmlPath,currentNewPdfPath)                
            try {
                await updateSuccessConversionInDb(id, nameNewPdfFile)
                await removeItem(currentHtmlPath)
            }catch(error){

                await errorHandlerAfterGeneratePdf(currentNewPdfPath, currentHtmlFile.filename,id )
                if (error instanceof Error) throw createError(500,`Error after generate pdf: ${error.message}`)
                    else throw createError(500, `Error after generate pdf: ${error}`)  
            }
}