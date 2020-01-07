import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput } from 'mithril-materialized';
import { getMessage, IInject, MessageType, IRequestStartInject, InjectKeys } from 'trial-manager-models';
import { AppState } from '../../models';

export const StartInjectForm: FactoryComponent<{
  inject: IInject;
  disabled?: boolean;
  onChange?: (inject: IInject, prop: InjectKeys) => void;
}> = () => {
  const setTitle = (inject: IInject, si: IRequestStartInject) => {
    inject.title = `Run inject ${si.inject}`;
  };

  return {
    oninit: ({ attrs: { inject }}) => {
      const si = getMessage(inject, MessageType.START_INJECT) as IRequestStartInject;
      si.guid = inject.id;
      si.owner = AppState.owner;
    },
    view: ({ attrs: { inject, disabled, onChange } }) => {
      const si = getMessage(inject, MessageType.START_INJECT) as IRequestStartInject;
      const update = (prop: keyof IInject | Array<keyof IInject> = 'message') => onChange && onChange(inject, prop);

      return [
        m(TextInput, {
          disabled,
          label: 'Inject',
          iconName: 'colorize',
          isMandatory: true,
          helperText: 'Name of the inject you want to run.',
          initialValue: si.inject,
          onchange: v => {
            si.inject = v;
            setTitle(inject, si);
            update(['title', 'message']);
          },
        }),
        m(TextArea, {
          disabled,
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => {
            inject.description = v;
            update('description');
          },
          label: 'Description',
          iconName: 'note',
        }),
      ];
    },
  };
};
