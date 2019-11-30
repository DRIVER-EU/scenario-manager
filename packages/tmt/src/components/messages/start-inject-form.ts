import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput } from 'mithril-materialized';
import { getMessage, IInject, MessageType, IRequestStartInject } from 'trial-manager-models';
import { AppState } from '../../models';

export const StartInjectForm: FactoryComponent<{
  inject: IInject;
  disabled?: boolean;
  onChange?: () => void;
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
    view: ({ attrs: { inject, disabled } }) => {
      const si = getMessage(inject, MessageType.START_INJECT) as IRequestStartInject;

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
          },
        }),
        m(TextArea, {
          disabled,
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => (inject.description = v),
          label: 'Description',
          iconName: 'note',
        }),
      ];
    },
  };
};
