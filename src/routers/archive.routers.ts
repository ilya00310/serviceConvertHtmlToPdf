import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler'
import multer from 'multer'
import { archiveDto } from '../schemas/archive.dto.type';
import { addArchive, unzipArchive } from '../services/archive.services';
import { archiveUnzipDto } from '../schemas/archiveUnzip.dto';

export const archiveRouter = express.Router();
const upload = multer()

archiveRouter.route('/archive').post(upload.single('archive'),asyncHandler(async(req: Request, res: Response) => {
    const result = archiveDto.safeParse(req.file)
    if (!result.success){
        res.json({error: 'The request is missing an archive file'}).status(400)
        return
    }
    const archiveId = await addArchive(result.data)
    res.json({archiveId}).status(200)
})
)

archiveRouter.route('/archive/unzip/:id').post(asyncHandler(async(req: Request, res: Response) => {
    const result = archiveUnzipDto.safeParse(req.params)
    if (!result.success){
        res.json({error: 'The request is missing an archive id'}).status(400)
        return
    }
    const { id } = result.data
    const fileHtmlId: string =  await unzipArchive(id)
    res.json({fileHtmlId}).status(200)
}))