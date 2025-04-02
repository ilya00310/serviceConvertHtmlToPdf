import express from 'express';

export const archiveRouter = express.Router();

archiveRouter.route('/archive').get((req, res) => {
    return res.json({success: true}).status(200)
})