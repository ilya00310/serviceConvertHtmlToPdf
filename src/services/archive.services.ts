import { Archive } from "../schemas/archive.dto.type";
import path from 'path'
import { existsSync } from "fs"
import createError from "http-errors"
import fs from 'fs'
import fsp from 'fs/promises'
import { PrismaClient } from "@prisma/client";
import { ArchiveTable } from "../schemas/archiveTable.type";
import unzipper from 'unzipper'

const prisma = new PrismaClient()

const enum Format {
    Archive = "archive",
    Resource = "resource"
}

const enum FilenameHtml {
    index = 'index.html'
}

const formatFolderName: Record<Format, string> = {
    [Format.Archive] : 'archives',
    [Format.Resource] : 'resources'
}


const maxArchiveSize = 2 * 1024 * 1024 * 1024;

const getPathDownloadsFile =  (filename: string, format: Format): string => { 
    const folder: string = formatFolderName[format]
    return path.join(process.cwd(),'downloads',folder, filename)
}

const checkItemMaxSize = (size: number, maxSize: number) => {
    if (size > maxSize) throw createError(400, `Size exceeds maximum limit: ${maxSize}`)
}

const checkArchiveExtension = (archiveName: string) => {
    const [filename, fileExtension] = archiveName.split('.');
    if (fileExtension !== 'zip') throw createError(400, 'The extension doesn\'t match the zip archive')
    }

const addFileInFolder = async (filePath : string, buffer: Buffer) => {
 try {
    await fsp.writeFile(filePath, buffer)
}catch{
    throw createError(500, 'Archive wasn\'t added in the file system') 
}
}

const addArchiveInDb = async (archiveName: string): Promise<string> => {
    const { id } = await prisma.archive.create({
        data: { archiveName }
    })
    return id
}

const deleteFile = async (filePath: string) => await fsp.rm(filePath);

export const addArchive = async (archiveData: Archive) => {
    const { originalname, buffer, size }= archiveData;
    const currentFormat: Format = Format.Archive;
    const currentArchivePath = getPathDownloadsFile(originalname, currentFormat)
    
    if (existsSync(currentArchivePath)) throw createError(409, 'The archive already exists in the folder')
        checkItemMaxSize(size, maxArchiveSize)
    checkArchiveExtension(originalname)
    await addFileInFolder(currentArchivePath, buffer)
    
    try {
        const archiveId: string = await addArchiveInDb(originalname)
        return archiveId
    }catch{
        await deleteFile(currentArchivePath)
        throw createError(500,'Archive wasn\'t added in the database')
    }
}

const extractZpi = (currentPathArchive: string, pathNewResource: string): Promise<void> => {

    return new Promise((resolve, reject) =>{
        const readStream = fs.createReadStream(currentPathArchive)

        readStream.on('error', reject)

        readStream
        .pipe(unzipper.Extract({ path: pathNewResource}))
        .on('error', reject)
        .on('finish', resolve)
    
    })
}
const addFileHtmlInDb = async (currentHtmlFilename: string, archiveId: string ): Promise<string> => {
        const newFile = await prisma.fileHtml.create({
            data: {
                archiveId,
                filename: currentHtmlFilename,
            }
        })
        return newFile.id
}

const removeItem = async(itemPath: string) => await fsp.rm(itemPath, {recursive: true})

const errorHandlerAddFileHtmlInDb = async (fileHtmlPath: string) => {
    await removeItem(fileHtmlPath)
}

export const unzipArchive = async(id : string): Promise<string> => {
    const currentArchive: ArchiveTable = await prisma.archive.findFirst({
        where: { id }
    }) as ArchiveTable

    if (!currentArchive) throw createError(400, 'Archive with current id don\'t exist')
        const currentArchiveFormat: Format = Format.Archive;
        const currentArchivePath = await getPathDownloadsFile(currentArchive.archiveName, currentArchiveFormat)

        if (!existsSync(currentArchivePath)) throw createError(409, 'The archive don\t exists in the folder')
            const currentResourceFormat = Format.Resource
            const currentResourcePath = await getPathDownloadsFile(currentArchive.archiveName, currentResourceFormat)

            if (existsSync(currentResourcePath)) throw createError(409, 'The resource folder already exist')
                await extractZpi(currentArchivePath, currentResourcePath)
            const currentHtmlFilename = FilenameHtml.index;
            const currentHtmlFilePath = path.join(currentResourcePath, currentHtmlFilename)
            
            if (!existsSync(currentHtmlFilePath)) throw createError(404, `Html file: ${currentHtmlFilePath} don\'t exist `)
                try {
                const fileHtmlId =  await addFileHtmlInDb(currentHtmlFilename,  id)
                return fileHtmlId
                }catch{
                    await errorHandlerAddFileHtmlInDb(currentHtmlFilePath)
                    throw createError(500, 'Html File wasn\'t added in the database')            
                }
}
