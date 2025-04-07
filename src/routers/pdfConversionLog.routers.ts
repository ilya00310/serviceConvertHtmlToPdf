import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler'
import { PdfConversionLogTable } from '../schemas/pdfConversionLog.type';
import createError from 'http-errors'
import { getPdfConversionLogs } from '../services/pdfConversionLog.services';

/**
 * @swagger
 * components:
 *  schemas:
 *      PdfConversionLog:
 *          type: object
 *          required:
 *              - fileHtmlName
 *          properties:
 *            id:
 *              type: string
 *              description: The auto-generated id of the log  
 *            fileHtmlName:
 *              type: string
 *              description: Html file name 
 *            wastedTime:
 *              type: string
 *              description: Wasted time
 *            wastedMemory:
 *              type: string
 *              description: wasted memory
 *          example:
 *              id: d123f_ds
 *              fileHtmlName: index.html
 *              wastedTime: 3821.30 mc
 *              wastedMemory: 510.16 MB
 *              createdAt: 2025-04-07 00:14:40.168
 */
export const pdfConversionLogRouter = express()

/**
 * @swagger
 * /appeals/filter:
 *   get:
 *     summary: Get pdf conversion logs
 *     responses:
 *       200:
 *         description: Pdf conversion logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PdfConversionLog'
 */
pdfConversionLogRouter.route('').get(asyncHandler(async (req: Request,res: Response) => {
    const pdfConversionLogs: PdfConversionLogTable[] = await getPdfConversionLogs()
    res.status(200).json(pdfConversionLogs)
}))