export interface IGeoJsonMessage {
  /** Should be the same ID as the inject.id */
  id: string;
  /** Identifier of the map layer: layers with identical ID are overwritten */
  layerId?: string;
  /** Name of the map layer: may be used in legend */
  layerName?: string;
  /** Layer style name, determines visual appearance of map layer */
  layerStyle?: string;
  /** Layer description */
  layerDesc?: string;
  /** Link to the asset that holds the GeoJSON file */
  assetId?: number;
  /** Alias for the file */
  alias?: string;
  /** If defined, generates a NamedGeoJSON message with a map of key-value pairs */
  properties?: {
    [key: string]: boolean | string | number;
  };
  /** Other attributes that are attached to geojson message */
  [key: string]: boolean | string | number | undefined | Record<string, any>;
}
