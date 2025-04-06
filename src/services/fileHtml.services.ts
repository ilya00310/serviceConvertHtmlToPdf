import html_to_pdf from 'html-pdf-node'
import fsp from 'fs/promises'
import { PrismaClient } from '@prisma/client'
import createError from 'http-errors'
import { FileHtmlTable } from '../schemas/fileHtml.type'

const prisma = new PrismaClient()

export const convertHtmlToPdf = async (id: string) => {
    const currentHtmlFile: FileHtmlTable = await prisma.fileHtml.findUnique({
        where: { id }
    }) as FileHtmlTable
    if (!currentHtmlFile) throw createError(400, 'Html file with current id do not exist')
        
}