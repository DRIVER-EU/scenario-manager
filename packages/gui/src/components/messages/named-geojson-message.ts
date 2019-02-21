import m, { FactoryComponent } from 'mithril';
import { IInject, MessageType, INamedGeoJsonMessage } from 'trial-manager-models';
import { GeoJsonMessageForm } from './geojson-message';
import { MapEditor } from '../ui/map-editor';
import { getMessage } from '../../utils';

export const NamedGeoJsonMessageForm: FactoryComponent<{ inject: IInject }> = () => {

  return {
    view: ({ attrs: { inject } }) => {
      const pm = getMessage(inject, MessageType.NAMED_GEOJSON_MESSAGE) as INamedGeoJsonMessage;
      if (!pm.properties) {
        pm.properties = {};
      }

      return [
        // m(GeoJsonMessageForm, { inject }),
        m(MapEditor, { header: 'Properties', disallowArrays: true, properties: pm.properties }),
      ];
    },
  };
};
