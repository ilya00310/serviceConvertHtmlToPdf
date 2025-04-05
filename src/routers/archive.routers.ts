import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler'
import { archiveDto } from '../schemas/archive.dto.type';
import { addArchive, unzipArchive } from '../services/archive.services';
import { idDto } from '../schemas/archiveUnzip.dto';
import { upload } from '../services/archive.services';
import { SafeParseReturnType } from 'zod';
import { Archive } from '@prisma/client';
export const archiveRouter = express.Router();


archiveRouter.route('').post(upload.single('archive'),asyncHandler(async(req: Request, res: Response) => {
    const result = archiveDto.safeParse(req.file)
    if (!result.success){
        res.status(400).json({error: 'The request is missing an archive file'})
        return
    }
    console.log(result.data)
    const archiveId = await addArchive(result.data)
    res.json({archiveId}).status(200)
})
)

archiveRouter.route('/unzip/:id').post(asyncHandler(async(req: Request, res: Response) => {
    const result: SafeParseReturnType<{id: string}, {id: string}> = idDto.safeParse(req.params)
    if (!result.success){
        res.status(400).json({error: 'The request is missing an archive id'})
        return
    }
    const { id } = result.data
    const fileHtmlId: string =  await unzipArchive(id)
    res.json({fileHtmlId}).status(200)
}))