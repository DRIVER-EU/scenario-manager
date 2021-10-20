import m from 'mithril';
import { TextArea, TextInput, UrlInput, Select } from 'mithril-materialized';
import { getMessage, MessageType, ILargeDataUpdate, DataType } from '../../../../models';
import { MessageComponent } from '../../services';
import { enumToOptions, getActiveTrialInfo } from '../../utils';

/** Inform others about a large data message: note that it only sends a link, not the actual data! */
export const LargeDataUpdateMessageForm: MessageComponent = () => {
  const options = enumToOptions(DataType).map((o) => ({ id: o.id, label: o.label.replace('_', ' ').toUpperCase() }));

  return {
    view: ({
      attrs: {
        state,
        actions: { updateInject },
        options: { editing } = { editing: true },
      },
    }) => {
      const { inject } = getActiveTrialInfo(state);
      if (!inject) return;
      const disabled = !editing;
      const pm = getMessage(inject, MessageType.LARGE_DATA_UPDATE) as ILargeDataUpdate;

      return m('.row', [
        m(
          '.col.s12',
          m(TextInput, {
            disabled,
            id: 'title',
            initialValue: pm.title || inject.title,
            onchange: (v: string) => {
              pm.title = inject.title = v;
              updateInject(inject);
            },
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
            onchange: (v: string) => {
              pm.description = inject.description = v;
              updateInject(inject);
            },
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
            onchange: (v: string) => {
              pm.url = v;
              updateInject(inject);
            },
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
              updateInject(inject);
            },
            label: 'Data type',
            options,
          })
        ),
      ]);
    },
  };
};
