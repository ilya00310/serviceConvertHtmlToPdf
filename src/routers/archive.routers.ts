import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler'
import { archiveDto } from '../schemas/archive.dto.type';
import { addArchive, unzipArchive, maxArchiveSize } from '../services/archive.services';
import { idDto } from '../schemas/archiveUnzip.dto';
import { SafeParseReturnType } from 'zod';
import multer from 'multer'

 const upload: multer.Multer = multer({
    limits: {
        fileSize: maxArchiveSize
    }
})


/**
 * @swagger
 * components:
 *  schemas:
 *      Archive:
 *          type: object
 *          required:
 *              - archiveName
 *              - isUnzipping
 *          properties:
 *            id:
 *              type: string
 *              description: The auto-generated id of the archive    
 *            archiveName:
 *              type: string
 *              description: The name current archive
 *            isUnzipping:
 *              type: boolean
 *              description: Success of the unzipping
 *          example:
 *              id: d123f_ds
 *              archiveName: archiveOne
 *              isUnzipping: false
 */

export const archiveRouter = express.Router();

/**
 * @swagger
 * /api/archive:
 *   post:
 *     summary: Download zip archive
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: archive
 *         type: file
 *         required: true
 *         description: The archive to upload
 *     responses:
 *       200:
 *         description: Id new archive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 archiveId:
 *                   type: string
 *                   example: 's21323_dsa'
*/
archiveRouter.route('').post(upload.single('archive'),asyncHandler(async(req: Request, res: Response) => {
    const result = archiveDto.safeParse(req.file)
    if (!result.success){
        res.status(400).json({error: 'The request is missing an archive file'})
        return
    }
    const archiveId = await addArchive(result.data)
    res.json({archiveId}).status(200)
})
)


/**
 * @swagger
 * /api/archive/unzip/{id}:
 *   post:
 *     summary: Unzip archive
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *         description: Id for unzip archive
 *     responses:
 *       200:
 *         description: Id new file html
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fileHtmlId:
 *                   type: string
 *                   example: 's21323_dsa'
*/
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