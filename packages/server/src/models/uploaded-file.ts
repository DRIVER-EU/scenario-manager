export interface IUploadedFile {
  alias?: string;
  fieldname: string;
  mimetype: string;
  originalname: string;
  size: number;
  encoding: string;
  buffer: Buffer;
}
