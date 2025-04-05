import express, {Response, Request } from 'express'
import asyncHandler from 'express-async-handler'


export const fileHtmlRouter = express()

fileHtmlRouter.route('/fileHtml').post(asyncHandler(async (req: Request,res: Response) => {

}))