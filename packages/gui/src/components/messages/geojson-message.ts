import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select, Switch } from 'mithril-materialized';
import { IInject, InjectType } from '../../models';
import { getMessage } from '../../utils';
import { ScenarioSvc } from '../../services';

export interface IGeoJsonMessage {
  /** Should be the same ID as the inject.id */
  id: string;
  /** Link to the asset that holds the GeoJSON file */
  assetId?: number;
}

export const GeoJsonMessageForm: FactoryComponent<{ inject: IInject }> = () => {
  const scenario = ScenarioSvc.getCurrent();
  const assets = scenario ? scenario.assets || [] : [];
  const options = assets
    .filter(a => a.mimetype === 'application/json' || a.filename.indexOf('json') >= 0)
    .map(a => ({ id: a.id, label: a.alias || a.filename }));

  return {
    view: ({ attrs: { inject } }) => {
      const pm = getMessage(inject, InjectType.GEOJSON_MESSAGE) as IGeoJsonMessage;

      return [
        m(TextInput, {
          id: 'title',
          initialValue: inject.title,
          onchange: (v: string) => {
            inject.title = v;
          },
          label: 'Title',
          iconName: 'title',
        }),
        m(TextArea, {
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => (inject.description = v),
          label: 'Description',
          iconName: 'description',
        }),
        m(Select, {
          iconName: 'file',
          placeholder: 'Select a geojson file',
          checkedId: pm.assetId,
          options,
          onchange: (v: unknown) => {
            pm.assetId = +(v as number);
          },
        }),
      ];
    },
  };
};
