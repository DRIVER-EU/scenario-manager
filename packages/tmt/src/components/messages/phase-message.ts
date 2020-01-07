import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select, Switch } from 'mithril-materialized';
import { getMessage, IInject, MessageType, IPhaseMessage, Phase, InjectKeys } from 'trial-manager-models';

export const PhaseMessageForm: FactoryComponent<{
  inject: IInject;
  disabled?: boolean;
  onChange?: (i: IInject, prop: InjectKeys) => void;
}> = () => {
  const setTitle = (inject: IInject, pm: IPhaseMessage) => {
    const name = pm.phase === Phase.PROPER_NAME ? pm.alternativeName : Phase[pm.phase];
    inject.title = `${pm.isStarting ? 'START' : 'END'} ${name}`;
  };
  return {
    view: ({ attrs: { inject, disabled, onChange } }) => {
      const update = (prop: keyof IInject | Array<keyof IInject> = 'message') => onChange && onChange(inject, prop);
      const pm = getMessage(inject, MessageType.PHASE_MESSAGE) as IPhaseMessage;
      const options = Object.keys(Phase).map(p => ({ id: p, label: p }));
      // console.table(pm);

      return [
        m(Select, {
          disabled,
          iconName: 'flag',
          placeholder: 'Select the phase type',
          checkedId: pm.phase,
          options,
          onchange: v => {
            pm.phase = v[0] as Phase;
            if (!pm.isStarting) {
              pm.isStarting = true;
            }
            setTitle(inject, pm);
            update(['title', 'message']);
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
                update(['title', 'message']);
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
          iconName: 'description',
        }),
      ];
    },
  };
};
