import m from 'mithril';
import { Options } from 'mithril-materialized';
import { ITrial, MessageType } from 'trial-manager-models';
import { TrialSvc } from '../../services';
import { enumToOptions, getMessageTitle } from '../../utils';

/** Select which message types you want to send */
export const SelectMessageTypesForm = () => {
  const state = {
    trial: undefined as ITrial | undefined,
  };
  const onsubmit = (e: UIEvent) => {
    e.preventDefault();
  };

  return {
    oninit: () => {
      state.trial = TrialSvc.getCurrent();
    },
    view: () => {
      const { trial } = state;
      if (!trial) {
        return undefined;
      }
      const { selectedMessageTypes = [] } = trial;
      if (selectedMessageTypes.length === 0) {
        Object.keys(MessageType).forEach(k => selectedMessageTypes.push(k));
      }
      const options = enumToOptions(MessageType).map(({ id }) => ({ id, label: getMessageTitle(id as MessageType) }));
      return m('.row', [
        m(
          '.col.s12.input-field',
          m(Options, {
            multiple: true,
            options,
            initialValue: selectedMessageTypes,
            label: 'Message types to send',
            onchange: ids => {
              trial.selectedMessageTypes = (ids as string[]);
              TrialSvc.saveTrial();
            },
          })
        ),
      ]);
    },
  };
};
