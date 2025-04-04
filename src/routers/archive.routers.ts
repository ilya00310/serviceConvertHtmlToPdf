import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler'

export const archiveRouter = express.Router();

archiveRouter.route('/archive').get(asyncHandler(async(req: Request, res: Response) => {
    res.json({success: true}).status(200)
})
)