import { InjectType } from '../../../../models';
import { MeiosisComponent } from '../../services';
import { getInject } from '../../utils';
import { getMessageForm } from '../messages';

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
      console.log('inject', inject);
      if (!inject) return;

      return inject && inject.type === InjectType.INJECT ? getMessageForm(state, actions, inject, false) : undefined;
    },
  };
};
