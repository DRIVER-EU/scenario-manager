import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, UrlInput, Select } from 'mithril-materialized';
import { getMessage, IInject, MessageType, ILargeDataUpdate, DataType, InjectType } from 'trial-manager-models';
import { enumToOptions } from '../../utils';

/** Inform others about a large data message: note that it only sends a link, not the actual data! */
export const LargeDataUpdateMessageForm: FactoryComponent<{
  inject: IInject;
  onChange?: (inject: IInject) => void;
  disabled?: boolean;
}> = () => {
  const state = {
    options: enumToOptions(DataType).map(o => ({ id: o.id, label: o.label.replace('_', ' ').toUpperCase() })),
  };

  return {
    view: ({ attrs: { inject, disabled, onChange } }) => {
      const update = () => onChange && onChange(inject);

      const { options } = state;
      const pm = getMessage(inject, MessageType.LARGE_DATA_UPDATE) as ILargeDataUpdate;

      return m('.row', [
        m(
          '.col.s12',
          m(TextInput, {
            disabled,
            id: 'title',
            initialValue: pm.title || inject.title,
            onchange: (v: string) => (pm.title = inject.title = v),
            label: 'Title',
            iconName: 'title',
          })
        ),
        m(
          '.col.s12',
          m(TextArea, {
            disabled,
            id: 'desc',
            initialValue: pm.description || inject.description,
            onchange: (v: string) => (pm.description = inject.description = v),
            label: 'Description',
            iconName: 'note',
          })
        ),
        m(
          '.col.s12.m9',
          m(UrlInput, {
            disabled,
            id: 'url',
            initialValue: pm.url,
            onchange: (v: string) => (pm.url = v),
            label: 'URL of the data source',
            placeholder: 'http(s)://...',
            iconName: 'link',
          })
        ),
        m(
          '.col.s12.m3',
          m(Select, {
            disabled,
            placeholder: 'Pick one',
            id: 'data_type',
            checkedId: pm.dataType,
            onchange: (v: Array<string | number>) => {
              pm.dataType = (v instanceof Array ? (v.length > 0 ? v[0] : undefined) : v) as DataType;
              update();
            },
            label: 'Data type',
            options,
          })
        ),
      ]);
    },
  };
};
