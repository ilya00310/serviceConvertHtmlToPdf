import {  PrismaClient } from "@prisma/client";
import createError from 'http-errors'
import { PdfConversionLogTable } from "../schemas/pdfConversionLog.type";

const prima = new PrismaClient()

export const createLog = async (fileHtmlName: string, wastedTime: string,wastedMemory: string, errorHandler: () => Promise<void>): Promise<string> => {
    try {
     const currentLog: PdfConversionLogTable = await prima.pdfConversionLog.create({
        data:{fileHtmlName, wastedTime: `${wastedTime} mc`, wastedMemory: `${wastedMemory} MB`}
    }) 
    return currentLog.id
}catch(error){
    if(errorHandler) await errorHandler()
        if (error instanceof Error) throw createError(500,`Error with initialize log: ${error.message}`)
            else throw createError(500,`Error with initialize log: ${error}`) 
}
}

export const getPdfConversionLogs = async (): Promise<PdfConversionLogTable[]> => await prima.pdfConversionLog.findMany()

export const getPdfConversionLog = async (id: string): Promise<PdfConversionLogTable | null > => await prima.pdfConversionLog.findUnique({
    where: { id }
})