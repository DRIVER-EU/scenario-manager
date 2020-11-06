import m from 'mithril';
import { TextArea, TextInput, Select, Switch } from 'mithril-materialized';
import { getMessage, IInject, MessageType, IPhaseMessage, Phase } from '../../../../models';
import { MeiosisComponent } from '../../services';
import { getInject } from '../../utils';

export const PhaseMessageForm: MeiosisComponent = () => {
  const setTitle = (inject: IInject, pm: IPhaseMessage) => {
    const name = pm.phase === Phase.PROPER_NAME ? pm.alternativeName : Phase[pm.phase];
    inject.title = `${pm.isStarting ? 'START' : 'END'} ${name}`;
  };
  return {
    view: ({
      attrs: {
        state: {
          app: { trial, injectId, mode },
        },
        actions: { updateInject },
      },
    }) => {
      const disabled = mode !== 'edit';
      const inject = getInject(trial, injectId);
      if (!inject) return;
      const pm = getMessage<IPhaseMessage>(inject, MessageType.PHASE_MESSAGE);
      const options = Object.keys(Phase).map((p) => ({ id: p, label: p }));
      // console.table(pm);

      return [
        m(Select, {
          disabled,
          iconName: 'flag',
          placeholder: 'Select the phase type',
          checkedId: pm.phase,
          options,
          onchange: (v) => {
            pm.phase = v[0] as Phase;
            if (!pm.isStarting) {
              pm.isStarting = true;
            }
            setTitle(inject, pm);
            updateInject(inject);
          },
        }),
        pm.phase === Phase.PROPER_NAME
          ? m(TextInput, {
              disabled,
              id: 'title',
              initialValue: pm.alternativeName || '',
              onchange: (v: string) => {
                pm.alternativeName = v;
                setTitle(inject, pm);
                updateInject(inject);
              },
              label: 'Title',
              iconName: 'title',
            })
          : undefined,
        m(Switch, {
          disabled,
          checked: !pm.isStarting,
          label: 'Start or end of phase?',
          left: 'Start',
          right: 'End',
          onchange: (v: boolean) => {
            pm.isStarting = !v;
            setTitle(inject, pm);
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
          iconName: 'description',
        }),
      ];
    },
  };
};
