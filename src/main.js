import express from 'express'
import dotenv from "dotenv";
import { archiveRouter } from './routers/archive.routers.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use('',archiveRouter)

app.listen(port, () => {
    console.log(`App listen ${port}`)
})