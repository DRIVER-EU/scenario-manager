import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select, Switch } from 'mithril-materialized';
import { IInject, InjectType } from '../../models';
import { getMessage, iterEnum } from '../../utils';

export enum TrialPhase {
  PROPER_NAME,
  INITIALIZATION,
  PREPARATION,
  PRE_INCIDENT,
  INCIDENT,
  POST_INCIDENT,
}

export interface IPhaseMessage {
  /** Should be the same ID as the inject.id */
  id: string;
  /** Phase of the Trial */
  phase: TrialPhase;
  /** If the phase is starting or ending */
  isStarting?: boolean;
  /** In case you want to use an alternative name for your phase */
  alternativeName?: string;
}

export const PhaseMessageForm: FactoryComponent<{ inject: IInject }> = () => {
  const setTitle = (inject: IInject, pm: IPhaseMessage) => {
    const name = pm.phase === TrialPhase.PROPER_NAME ? pm.alternativeName : TrialPhase[pm.phase];
    inject.title = `${pm.isStarting ? 'START' : 'END'} ${name}`;
  };
  return {
    view: ({ attrs: { inject } }) => {
      const pm = getMessage(inject, InjectType.PHASE_MESSAGE) as IPhaseMessage;
      const options = iterEnum(TrialPhase).map(p => ({ id: p, label: TrialPhase[p] }));

      return [
        m(Select, {
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
          initialValue: pm.isStarting,
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
