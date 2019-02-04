export interface IAsset {
  id: number;
  /** Internally used alias, can be used as a user-friendly reference to the file */
  alias?: string;
  /** Original filename of the file. */
  filename: string;
  /** Mime type of the file, e.g. image/png */
  mimetype: string;
  /** For uploading the data to the server */
  data?: Blob;
  /** URL to the file on the server */
  url?: string;
}
