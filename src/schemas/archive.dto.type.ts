import z from 'zod'

export const archiveDto = z.object({
fieldname: z.string(),
originalname: z.string(),
encoding: z.string(),
mimetype: z.string(),
buffer: z.instanceof(Buffer),
size: z.number()
})

export type Archive = z.infer<typeof archiveDto>