import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler'
import { archiveDto } from '../schemas/archive.dto.type';
import { addArchive, unzipArchive } from '../services/archive.services';
import { archiveUnzipDto } from '../schemas/archiveUnzip.dto';
import { upload } from '../services/archive.services';
export const archiveRouter = express.Router();


archiveRouter.route('/archive').post(upload.single('archive'),asyncHandler(async(req: Request, res: Response) => {
    const result = archiveDto.safeParse(req.file)
    if (!result.success){
        res.status(400).json({error: 'The request is missing an archive file'})
        return
    }
    const archiveId = await addArchive(result.data)
    res.json({archiveId}).status(200)
})
)

archiveRouter.route('/archive/unzip/:id').post(asyncHandler(async(req: Request, res: Response) => {
    const result = archiveUnzipDto.safeParse(req.params)
    if (!result.success){
        res.status(400).json({error: 'The request is missing an archive id'})
        return
    }
    const { id } = result.data
    const fileHtmlId: string =  await unzipArchive(id)
    res.json({fileHtmlId}).status(200)
}))