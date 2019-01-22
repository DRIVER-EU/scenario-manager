export interface IAsset {
  id: number;
  alias?: string;
  filename: string;
  mimetype: string;
  data?: Blob;
}
