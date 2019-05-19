import m, { FactoryComponent } from 'mithril';
import { InjectState, InjectConditionType, InjectType } from 'trial-manager-models';
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
      const isWaiting = waitingForManualConfirmation(inject);
      return show
        ? isWaiting
          ? m(
              '.row',
              m(FlatButton, {
                className: 'right red-text',
                iconName: 'check_circle',
                iconClass: 'red-text right',
                label: 'Click here when ready',
                onclick: () => {
                  state.show = false;
                  RunSvc.transition({ id: inject.id, from: inject.state, to: InjectState.IN_PROGRESS });
                },
              })
            )
          : inject.type === InjectType.INJECT
          ? m(
              '.row',
              m(FlatButton, {
                className: 'right',
                iconName: 'send',
                iconClass: 'right',
                label: inject.state === InjectState.EXECUTED ? 'Resend' : 'Send now',
                onclick: () => {
                  state.show = false;
                  RunSvc.transition({ id: inject.id, from: inject.state, to: InjectState.IN_PROGRESS });
                },
              })
            )
          : undefined
        : undefined;
    },
  };
};
