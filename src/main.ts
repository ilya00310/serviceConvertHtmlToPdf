import express from 'express'
import dotenv from "dotenv";
import { archiveRouter } from './routers/archive.routers';
import { fileHtmlRouter } from './routers/fileHtml.routers';
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use('/api/archive',archiveRouter)
app.use('/api/fileHtml', fileHtmlRouter)

app.listen(port, () => {
    console.log(`App listen ${port}`)
})