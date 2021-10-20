import m from 'mithril';
import { InjectType } from '../../../../models';
import { MeiosisComponent } from '../../services';
import { getInject } from '../../utils';
import { MessageForm } from '../messages';

export const ExecutingMessageView: MeiosisComponent = () => {
  return {
    oninit: ({
      attrs: {
        actions: { setEditMode },
      },
    }) => {
      setEditMode(false);
    },
    view: ({ attrs: { state, actions } }) => {
      const { injectId, trial } = state.exe;
      const inject = getInject(trial, injectId);
      if (!inject) return;

      return (
        inject && inject.type === InjectType.INJECT && m(MessageForm, { state, actions, options: { editing: false } })
      );
    },
  };
};
