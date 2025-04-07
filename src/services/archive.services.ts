import path from 'path'
import { existsSync } from "fs"
import createError from "http-errors"
import fs from 'fs'
import fsp from 'fs/promises'
import { PrismaClient } from "@prisma/client";
import { ArchiveTable } from "../schemas/archiveTable.type";
import unzipper from 'unzipper'
import { FileHtmlTable } from "../schemas/fileHtml.type";
import { Archive } from '../schemas/archive.dto.type'

export const maxArchiveSize: number = 2 * 1024 * 1024 * 1024;

const prisma = new PrismaClient()

export const enum Format {
    Archive = "archive",
    Resource = "resource"
}

export const enum FilenameHtml {
    index = 'index.html'
}

export const formatFolderName: Record<Format, string> = {
    [Format.Archive] : 'archives',
    [Format.Resource] : 'resources'
}



export const getPathDownloadsFile =  (filename: string, format: Format, folderNameResources?: string | undefined): string => { 
    const foldersPath: string = folderNameResources ? path.join(formatFolderName[format], folderNameResources) : formatFolderName[format]
    return path.join(process.cwd(),'downloads',foldersPath,filename)
}

const checkArchiveExtension = (archiveName: string) => {
    const [filename, fileExtension] = archiveName.split('.');
    if (fileExtension !== 'zip') throw createError(400, 'The extension does not match the zip archive')
    }

const addFileInFolder = async (filePath : string, buffer: Buffer) => {
 try {
    await fsp.writeFile(filePath, buffer)
}catch{
    throw createError(500, 'Archive was not added in the file system') 
}
}

const addArchiveInDb = async (archiveName: string): Promise<string> => {
    const { id } = await prisma.archive.create({
        data: { archiveName }
    })
    return id
}


export const removeItem = async(itemPath: string): Promise<void> =>  {
    try { 
     await fsp.rm(itemPath, {recursive: true})
    }catch(error) {
     if (error instanceof Error) throw new Error(`Error with delete file: ${error.message}`)
         else throw new Error(`Error with delete file: ${error}`)
    }
 }

export const addArchive = async (archiveData: Archive) => {
    const { originalname, buffer }= archiveData;
    const currentFormat: Format = Format.Archive;
    const currentArchivePath: string = getPathDownloadsFile(originalname, currentFormat)
    
    if (existsSync(currentArchivePath)) throw createError(409, 'The archive already exists in the folder')
    checkArchiveExtension(originalname)
    await addFileInFolder(currentArchivePath, buffer)
    
    try {
        return await addArchiveInDb(originalname)
    }catch{
        await removeItem(currentArchivePath)
        throw createError(500,'Archive was not added in the database')
    }
}

const extractZpi = (currentPathArchive: string, currentResourcePath: string): Promise<void> => {

    return new Promise((resolve, reject) =>{
        const readStream = fs.createReadStream(currentPathArchive)

        readStream.on('error', reject)

        readStream
        .pipe(unzipper.Extract({ path: currentResourcePath}))
        .on('error', reject)
        .on('finish', resolve)
    
    })
}


const errorHandlerAddFileHtmlInDb = async (filePath: string): Promise<void> => {
    try {
    await removeItem(filePath)
    }catch(error){
        if (error instanceof Error) throw createError(`Error with error handler: ${error.message}`)
            else throw createError(`Error with error handler: ${error}`)
    }
}
export const getFileNameWithoutExtension = (fileNameWithExtension: string): string => {
    const [fileName, extension] = fileNameWithExtension.split('.')
    return fileName
}
export const unzipArchive = async(id : string): Promise<string> => {
    const currentArchive: ArchiveTable | null= await prisma.archive.findUnique({
        where: { id }
    }) 
    if (!currentArchive) throw createError(400, 'Archive with current id do not exist')

        const currentArchiveFormat: Format = Format.Archive;
        const currentArchivePath: string = getPathDownloadsFile(currentArchive.archiveName, currentArchiveFormat)

        if (!existsSync(currentArchivePath)) throw createError(409, 'The archive do not exists in the folder')
            const nameNewFolderForUnzip = getFileNameWithoutExtension(currentArchive.archiveName)            
            const currentResourceFormat: Format = Format.Resource
            const currentResourcePath: string = await getPathDownloadsFile(nameNewFolderForUnzip, currentResourceFormat)

            if (existsSync(currentResourcePath)) throw createError(409, 'The resource folder already exist')

                await extractZpi(currentArchivePath, currentResourcePath)
            const currentHtmlFilename: FilenameHtml = FilenameHtml.index;
            const currentHtmlFilePath: string = path.join(currentResourcePath, currentHtmlFilename)
            
            if (!existsSync(currentHtmlFilePath)) throw createError(404, `Html file: ${currentHtmlFilePath} do not exist `)

          return prisma.$transaction(async (tx) => {
            try {
                    const newFileHtml: FileHtmlTable | null = await tx.fileHtml.create({
                        data: {
                            archiveId: id,
                            fileName: currentHtmlFilename,
                        }
                    }) 
                    const updateSuccessUnzippingInDb: ArchiveTable | null = await tx.archive.update({
                        where:{ id }, 
                        data:{ isUnzipping: true }
                    })
                    return newFileHtml.id
                }catch(transactionError){
                    await errorHandlerAddFileHtmlInDb(currentResourcePath)
                    if (transactionError instanceof Error) throw createError(500,`Transaction failed: ${transactionError.message}`)
                        else throw createError(500, `Transaction failed: ${transactionError}`)            
                }    
            })
}
