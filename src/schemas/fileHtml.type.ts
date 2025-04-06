import { Archive } from "./archive.dto.type"

export type FileHtmlTable = {
    id: string,
    archive: Archive
    archiveId: string,
    filename: string,
    isConversion: boolean
}