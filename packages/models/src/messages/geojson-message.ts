export interface IGeoJsonMessage {
  /** Should be the same ID as the inject.id */
  id: string;
  /** Link to the asset that holds the GeoJSON file */
  assetId?: number;
  /** Alias for the file */
  alias?: string;
  /** Message subject id, to map to a  */
  subjectId?: string;
}

export interface INamedGeoJsonMessage extends IGeoJsonMessage {
  properties: {
    [key: string]: boolean | string | number;
  };
}
