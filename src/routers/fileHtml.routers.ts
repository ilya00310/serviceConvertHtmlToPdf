import express, {Response, Request } from 'express'
import asyncHandler from 'express-async-handler'
import { idDto } from '../schemas/archiveUnzip.dto'
import { convertHtmlToPdf } from '../services/fileHtml.services'
import { SafeParseReturnType } from 'zod'

/**
 * @swagger
 * components:
 *  schemas:
 *      FileHtml:
 *          type: object
 *          required:
 *              - archiveId
 *              - filename
 *              - isConversion
 *          properties:
 *            id:
 *              type: string
 *              description: The auto-generated id of the file html    
 *            archiveId:
 *              type: string
 *              description: File archive id
 *            filename:
 *              type: string
 *              description: Name of the current file
 *            isConversion:
 *              type: boolean
 *              description: Success of the conversion
 *          example:
 *              id: d123f_ds
 *              archiveId: dasda_32das
 *              filename: index.html
 *              isConversion: false
 */
export const fileHtmlRouter = express()
/**
 * @swagger
 * /api/fileHtml/conversion/{id}:
 *   post:
 *     summary: Conversion file html
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *         description: Id for conversion file html
 *     responses:
 *       200:
 *         description: Removal success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 */
fileHtmlRouter.route('/conversion/:id').post(asyncHandler(async (req: Request,res: Response) => {
    const result: SafeParseReturnType<{id: string}, {id: string}> = idDto.safeParse(req.params)
    if (!result.success){
        res.status(400).json({error: 'The request is missing an archive id'})
        return
    }
    const { id } = result.data;
    await convertHtmlToPdf(id)
    res.status(200).json({success: true})
}))