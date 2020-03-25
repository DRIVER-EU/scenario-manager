export interface IGeoJsonMessage {
  /** Should be the same ID as the inject.id */
  id: string;
  /** Link to the asset that holds the GeoJSON file */
  assetId?: number;
  /** Alias for the file */
  alias?: string;
  /** Message subject id, to map to a  */
  subjectId?: string;
  /** If defined, generates a NamedGeoJSON message with a map of key-value pairs */
  properties?: {
    [key: string]: boolean | string | number;
  };
}
