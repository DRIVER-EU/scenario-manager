import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select, FileInput } from 'mithril-materialized';
import { IInject, InjectType } from 'trial-manager-models';
import { getMessage, eatSpaces } from '../../utils';
import { TrialSvc } from '../../services';
import { IAsset } from 'trial-manager-models';

export interface IGeoJsonMessage {
  /** Should be the same ID as the inject.id */
  id: string;
  /** Link to the asset that holds the GeoJSON file */
  assetId?: number;
  /** Alias for the file */
  alias?: string;
}

export const GeoJsonMessageForm: FactoryComponent<{ inject: IInject }> = () => {
  const jsonExt = /json$/i;
  const uploadAsset = async (files: FileList, pm: IGeoJsonMessage) => {
    const { alias } = pm;
    if (!files || files.length === 0 || !alias) {
      return;
    }
    const asset = { alias } as IAsset;
    const result = await TrialSvc.saveAsset(asset, files);
    if (result) {
      pm.assetId = result.id;
    }
  };

  return {
    view: ({ attrs: { inject } }) => {
      const pm = getMessage(inject, InjectType.GEOJSON_MESSAGE) as IGeoJsonMessage;
      const assets = TrialSvc.assets;
      const options = assets
        .filter(a => a.mimetype === 'application/json' || jsonExt.test(a.filename))
        .map(a => ({ id: a.id, label: a.alias || a.filename }));

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
          iconName: 'short_text',
        }),
        m(Select, {
          iconName: 'file',
          placeholder: 'Select a geojson file',
          checkedId: pm.assetId,
          options,
          onchange: (v: unknown) => {
            const assetId = +(v as number);
            pm.assetId = assetId;
            const asset = assets.filter(a => a.id === assetId).shift();
            pm.alias = asset ? asset.alias : undefined;
          },
        }),
        m('h5', 'Upload a new GeoJSON file'),
        m(TextInput, {
          id: 'alias',
          initialValue: pm.alias,
          onkeydown: eatSpaces,
          onchange: (v: string) => {
            pm.alias = v;
          },
          label: 'Alias',
          placeholder: 'No spaces allowed',
          iconName: 'title',
          contentClass: 'col s12 m6',
        }),
        m(FileInput, {
          disabled: !pm.alias,
          placeholder: 'Upload a new GeoJSON file',
          onchange: (files: FileList) => uploadAsset(files, pm),
          accept: ['.json', '.geojson'],
          class: 'col s12 m6',
        }),
      ];
    },
  };
};
