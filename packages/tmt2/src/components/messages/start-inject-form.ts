import m from 'mithril';
import { TextArea, TextInput } from 'mithril-materialized';
import { getMessage, IInject, MessageType, IRequestStartInject } from '../../../../models';
import { MeiosisComponent } from '../../services';
import { getInject } from '../../utils';

export const StartInjectForm: MeiosisComponent = () => {
  const setTitle = (inject: IInject, si: IRequestStartInject) => {
    inject.title = `Run inject ${si.inject}`;
  };

  return {
    view: ({
      attrs: {
        state: {
          app: { trial, injectId, mode, owner },
        },
        actions: { updateInject },
      },
    }) => {
      const disabled = mode !== 'edit';
      const inject = getInject(trial, injectId);
      if (!inject) return;
      const si = getMessage(inject, MessageType.START_INJECT) as IRequestStartInject;
      si.id = inject.id;
      si.applicant = owner;

      return [
        m(TextInput, {
          disabled,
          label: 'Inject',
          iconName: 'colorize',
          isMandatory: true,
          helperText: 'Name of the inject you want to run.',
          initialValue: si.inject,
          onchange: (v) => {
            si.inject = v;
            setTitle(inject, si);
            updateInject(inject);
          },
        }),
        m(TextArea, {
          disabled,
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => {
            inject.description = v;
            updateInject(inject);
          },
          label: 'Description',
          iconName: 'note',
        }),
      ];
    },
  };
};
