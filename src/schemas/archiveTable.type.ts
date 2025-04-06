import { FileHtml } from "./fileHtml.type"

export type ArchiveTable = {
    id: string,
    archiveName: string,
    isUnzipping: boolean,
    file?: FileHtml | null
}