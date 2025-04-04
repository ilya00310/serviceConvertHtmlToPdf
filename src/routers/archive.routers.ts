import express, { Request, Response, Express } from 'express';
import asyncHandler from 'express-async-handler'
import createError from 'http-errors';
import multer from 'multer'
import { archiveDto } from '../schemas/archive.dto';
import { addArchive } from '../services/archive.services';

export const archiveRouter = express.Router();
const upload = multer()

archiveRouter.route('/archive').post(upload.single('archive'),asyncHandler(async(req: Request, res: Response) => {
    const result = archiveDto.safeParse(req.file)
    if (!result.success){
        res.json({error: 'The request is missing an archive file'}).status(400)
        return
    }
    const archiveId = await addArchive(result.data)
    // res.json({id: archiveId}).status(200)

})
)