export interface IUploadedFile {
  fieldname: string;
  mimetype: string;
  originalname: string;
  size: number;
  encoding: string;
  buffer: Buffer;
}
