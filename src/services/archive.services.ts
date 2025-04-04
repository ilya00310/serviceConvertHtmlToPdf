import { Archive } from "../schemas/archive.dto";
import path from 'path'
import { existsSync } from "fs"
import createError from "http-errors"

enum format {
    archive = "archive",
    file = "file"
}
const getPath =  (filename: string, format: string) => path.join(process.cwd(),`${format}s`, filename)


export const addArchive = (archiveData: Archive) => {
const { originalname, buffer, size }= archiveData;
const currentFormat = format.archive;
const archivePath = getPath(originalname, currentFormat)
if (existsSync(archivePath)){
    throw createError(409, 'The archive already exists in the folder')
}
}