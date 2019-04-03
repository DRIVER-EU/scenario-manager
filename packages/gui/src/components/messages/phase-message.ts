import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select, Switch } from 'mithril-materialized';
import { getMessage, IInject, MessageType, IPhaseMessage, Phase } from 'trial-manager-models';
import { iterEnum } from '../../utils';

export const PhaseMessageForm: FactoryComponent<{ inject: IInject, onChange: () => void }> = () => {
  const setTitle = (inject: IInject, pm: IPhaseMessage) => {
    const name = pm.phase === Phase.PROPER_NAME ? pm.alternativeName : Phase[pm.phase];
    inject.title = `${pm.isStarting ? 'START' : 'END'} ${name}`;
  };
  return {
    view: ({ attrs: { inject } }) => {
      const pm = getMessage(inject, MessageType.PHASE_MESSAGE) as IPhaseMessage;
      const options = Object.keys(Phase).map(p => ({ id: p, label: p }));
      console.table(pm);

      return [
        m(Select, {
          iconName: 'flag',
          placeholder: 'Select the phase type',
          checkedId: pm.phase,
          options,
          onchange: (v: unknown) => {
            pm.phase = v as Phase;
            if (!pm.isStarting) {
              pm.isStarting = true;
            }
            setTitle(inject, pm);
          },
        }),
        pm.phase === Phase.PROPER_NAME
          ? m(TextInput, {
              id: 'title',
              initialValue: pm.alternativeName || '',
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
