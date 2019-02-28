import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select, Switch } from 'mithril-materialized';
import { getMessage, IInject, MessageType, IPhaseMessage, TrialPhase } from 'trial-manager-models';
import { iterEnum } from '../../utils';

export const PhaseMessageForm: FactoryComponent<{ inject: IInject }> = () => {
  const setTitle = (inject: IInject, pm: IPhaseMessage) => {
    const name = pm.phase === TrialPhase.PROPER_NAME ? pm.alternativeName : TrialPhase[pm.phase];
    inject.title = `${pm.isStarting ? 'START' : 'END'} ${name}`;
  };
  return {
    view: ({ attrs: { inject } }) => {
      const pm = getMessage(inject, MessageType.PHASE_MESSAGE) as IPhaseMessage;
      const options = iterEnum(TrialPhase).map(p => ({ id: p, label: TrialPhase[p] }));

      return [
        m(Select, {
          iconName: 'flag',
          placeholder: 'Select the phase type',
          checkedId: pm.phase,
          options,
          onchange: (v: unknown) => {
            pm.phase = +(v as number);
            if (!pm.isStarting) {
              pm.isStarting = true;
            }
            setTitle(inject, pm);
          },
        }),
        pm.phase === TrialPhase.PROPER_NAME
          ? m(TextInput, {
              id: 'title',
              initialValue: pm.alternativeName,
              onchange: (v: string) => {
                pm.alternativeName = v;
                setTitle(inject, pm);
              },
              label: 'Title',
              iconName: 'title',
            })
          : undefined,
        m(Switch, {
          checked: !pm.isStarting,
          label: 'Start or end of phase?',
          left: 'Start',
          right: 'End',
          onchange: (v: boolean) => {
            pm.isStarting = !v;
            setTitle(inject, pm);
          },
        }),
        m(TextArea, {
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => (inject.description = v),
          label: 'Description',
          iconName: 'description',
        }),
      ];
    },
  };
};
