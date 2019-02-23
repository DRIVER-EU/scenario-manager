import m, { FactoryComponent, Attributes } from 'mithril';
import { TextInput, FileInput } from 'mithril-materialized';
import { eatSpaces } from '../../utils';
import { IAsset } from 'trial-manager-models';
import { TrialSvc } from '../../services';

export interface IUploadAsset extends Attributes {
  /** Text to show as placeholder of the FileInput */
  placeholder?: string;
  /** What kind of files are accepted, e.g. ['.json', '.geojson'] */
  accept: string[];
  /** Callback function: When a file is uploaded, call this method to inform the user of the component. */
  assetUploaded: (a: IAsset) => void;
}

export const UploadAsset: FactoryComponent<IUploadAsset> = () => {
  const uploadAsset = async (files: FileList, assetUploaded: (a: IAsset) => void) => {
    const { alias } = state;
    if (!files || files.length === 0 || !alias) {
      return;
    }
    const asset = { alias } as IAsset;
    const result = await TrialSvc.saveAsset(asset, files);
    if (result) {
      assetUploaded(result);
    }
  };

  const state = {
    alias: '',
  };

  return {
    view: ({ attrs: { assetUploaded, accept, placeholder }}) => {
      const { alias } = state;

      return [
        m(TextInput, {
          id: 'alias',
          initialValue: alias,
          onchange: (v: string) => {
            state.alias = v.replace(/\s/g, '');
          },
          label: 'Alias',
          placeholder: 'No spaces allowed',
          iconName: 'title',
          className: 'col s12 m6',
        }),
        m(FileInput, {
          disabled: !alias,
          placeholder,
          accept,
          onchange: (files: FileList) => uploadAsset(files, assetUploaded),
          class: 'col s12 m6',
        }),
      ];
    },
  };
};
