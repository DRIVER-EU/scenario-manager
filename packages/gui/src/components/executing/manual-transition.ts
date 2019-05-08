import m, { FactoryComponent } from 'mithril';
import { InjectState, InjectConditionType } from 'trial-manager-models';
import { IExecutingInject } from '../../models';
import { FlatButton } from 'mithril-materialized';
import { RunSvc } from '../../services';

export const ManualTransition: FactoryComponent<{ inject: IExecutingInject }> = () => {
  const state = {
    show: true,
  };

  const waitingForManualConfirmation = (inject: IExecutingInject) =>
    inject.state === InjectState.SCHEDULED &&
    inject.condition &&
    inject.condition.type === InjectConditionType.MANUALLY;

  return {
    view: ({ attrs: { inject } }) => {
      const { show } = state;
      return show && waitingForManualConfirmation(inject)
        ? m(
            '.row',
            m(FlatButton, {
              className: 'right',
              iconName: 'check_circle',
              iconClass: 'red-text',
              label: 'Click here when ready',
              onclick: () => {
                state.show = false;
                RunSvc.transition({ id: inject.id, from: inject.state, to: InjectState.IN_PROGRESS });
              },
            })
          )
        : undefined;
    },
  };
};
