import m from 'mithril';
import { TextArea, TextInput } from 'mithril-materialized';
import { MeiosisComponent } from '../../services';
import { getInject } from '../../utils';

/**
 * Default message form with a title and description.
 */
export const DefaultMessageForm: MeiosisComponent = () => ({
  view: ({
    attrs: {
      state,
      actions: { updateInject },
    },
  }) => {
    const { mode } = state.app;
    const isExecuting = mode === 'execute';
    const { trial, scenarioId } = isExecuting && state.exe.trial.id ? state.exe : state.app;
    const inject = getInject(trial, scenarioId);
    const disabled = isExecuting;
    return (
      inject && [
        m(TextInput, {
          disabled,
          id: 'title',
          initialValue: inject.title,
          onchange: (v: string) => {
            inject.title = v;
            updateInject(inject);
            // if (onChange) {
            //   onChange(inject, 'title');
            // }
          },
          label: 'Title',
          iconName: 'title',
        }),
        m(TextArea, {
          disabled,
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => {
            inject.description = v;
            updateInject(inject);
            // if (onChange) {
            //   onChange(inject, 'description');
            // }
          },
          label: 'Description',
          iconName: 'note',
        }),
      ]
    );
  },
});
