import m from 'mithril';
import { TextArea, TextInput } from 'mithril-materialized';
import { getMessage, IInject, MessageType, IRequestStartInject } from 'trial-manager-models';
import { MessageComponent } from '../../services';
import { getActiveTrialInfo } from '../../utils';

export const StartInjectForm: MessageComponent = () => {
  const setTitle = (inject: IInject, si: IRequestStartInject) => {
    inject.title = `Start event: ${si.inject}`;
  };

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
      const si = getMessage(inject, MessageType.START_INJECT) as IRequestStartInject;
      si.id = inject.id;
      si.applicant = state.app.owner;
      if (!si.inject && inject.title) {
        si.inject = inject.title;
        setTitle(inject, si);
        updateInject(inject);
      }

      return [
        m(TextInput, {
          disabled,
          label: 'Event name',
          iconName: 'colorize',
          isMandatory: true,
          helperText: 'Name of the event / inject you want to run.',
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
