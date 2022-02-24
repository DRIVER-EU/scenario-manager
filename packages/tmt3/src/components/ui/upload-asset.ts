import m, { FactoryComponent, Attributes } from 'mithril';
import { TextInput, FileInput } from 'mithril-materialized';
import { IAsset } from 'trial-manager-models';

export interface IUploadAsset extends Attributes {
  /** Text to show as placeholder of the FileInput */
  placeholder?: string;
  /** What kind of files are accepted, e.g. ['.json', '.geojson'] */
  accept: string[];
  /** Service to save a new asset */
  createAsset: (a: IAsset, files: FileList) => Promise<void>;
  /** Callback */
  done?: () => void;
}

export const UploadAsset: FactoryComponent<IUploadAsset> = () => {
  let alias = '';

  return {
    view: ({ attrs: { createAsset, accept, placeholder, done } }) => {
      const uploadAsset = async (files: FileList) => {
        if (!files || files.length === 0 || !alias) {
          return;
        }
        const asset = { alias } as IAsset;
        await createAsset(asset, files);
        alias = '';
        done && done();
      };

      return [
        m(TextInput, {
          id: 'alias',
          initialValue: alias,
          onchange: (v: string) => {
            alias = v.replace(/\s/g, '');
          },
          label: 'Alias',
          placeholder: 'No spaces allowed',
          iconName: 'title',
          className: 'col s12 m6',
        }),
        m(FileInput, {
          disabled: !alias,
          placeholder: !alias ? 'Please, first provide an alias!' : placeholder,
          accept,
          onchange: (files: FileList) => uploadAsset(files),
          class: 'col s12 m6',
        }),
      ];
    },
  };
};
