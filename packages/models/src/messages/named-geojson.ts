import { FeatureCollection } from 'geojson';

export interface INamedGeoJSON {
  properties: { [key: string]: any };
  geojson: FeatureCollection;
}
