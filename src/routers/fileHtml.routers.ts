import express, {Response, Request } from 'express'
import asyncHandler from 'express-async-handler'
import { idDto } from '../schemas/archiveUnzip.dto'
import { convertHtmlToPdf } from '../services/fileHtml.services'
import { SafeParseReturnType } from 'zod'

export const fileHtmlRouter = express()

fileHtmlRouter.route('/fileHtml/:id').post(asyncHandler(async (req: Request,res: Response) => {
    const result: SafeParseReturnType<{id: string}, {id: string}> = idDto.safeParse(req.params)
    if (!result.success){
        res.status(400).json({error: 'The request is missing an archive id'})
        return
    }
    const { id } = result.data;
    await convertHtmlToPdf(id)
}))