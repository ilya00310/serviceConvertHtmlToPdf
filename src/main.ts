import express from 'express'
import dotenv from "dotenv";
import { archiveRouter } from './routers/archive.routers';
import { fileHtmlRouter } from './routers/fileHtml.routers';
import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUI from 'swagger-ui-express'
import { pdfConversionLogRouter } from './routers/pdfConversionLog.routers';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'service-convert-html-to-pdf',
            version: '1.0.0',
            description: 'API documentations',
        },
        servers: [ { url: process.env.SERVER_URL } ],
    },
    apis: ['./src/routers/archive.routers.ts','./src/routers/fileHtml.routers.ts','./src/routers/pdfConversionLog.routers.ts']
}
const swaggerDocs = swaggerJsDoc(swaggerOptions)

app.use('/api/archive',archiveRouter)
app.use('/api/fileHtml', fileHtmlRouter)
app.use('/api/pdfConversionLog', pdfConversionLogRouter)
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));


app.listen(port, () => {
    console.log(`App listen ${port}`)
})