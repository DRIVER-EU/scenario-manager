import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select } from 'mithril-materialized';
import { getMessage, IInject, MessageType, IPostMsg, UserRole, InjectKeys } from '../../../../models';
import { enumToOptions } from '../../utils';
import { TrialSvc, RunSvc } from '../../services';
import { MessageScope } from '.';

export enum MediumTypes {
  CHAT = 'CHAT',
  INCIDENT_REPORT = 'INCIDENT_REPORT',
  MAIL = 'MAIL',
  MICROBLOG = 'MICROBLOG',
  NEWS = 'NEWS',
  SITUATION_REPORT = 'SITUATION_REPORT',
  SOCIAL_NETWORK = 'SOCIAL_NETWORK',
  VIDEO = 'VIDEO',
}

/** Inform others about a large data message: note that it only sends a link, not the actual data! */
export const PostMessageForm: FactoryComponent<{
  inject: IInject;
  onChange?: (i: IInject, prop: InjectKeys) => void;
  disabled?: boolean;
  scope: MessageScope;
}> = () => {
  const state = {
    options: enumToOptions(MediumTypes),
    recipients: [] as Array<{ id: string; label: string }>,
  };

  return {
    oninit: ({ attrs: { scope } }) => {
      const svc = scope === 'edit' ? TrialSvc : RunSvc;
      state.recipients = svc.getUsersByRole(UserRole.PARTICIPANT).map(rp => ({ id: rp.id, label: rp.name }));
    },
    view: ({ attrs: { inject, disabled, onChange } }) => {
      const update = (prop: keyof IInject | Array<keyof IInject> = 'message') => onChange && onChange(inject, prop);

      const { options, recipients } = state;
      const pm = getMessage(inject, MessageType.POST_MESSAGE) as IPostMsg;

      return [
        m(Select, {
          disabled,
          label: 'Media type',
          iconName: 'message',
          className: 'col s12 m3',
          placeholder: 'Pick one',
          options,
          checkedId: pm.type || MediumTypes.MAIL,
          onchange: v => {
            pm.type = v[0] as MediumTypes;
            update();
          },
        }),
        m(Select, {
          disabled,
          label: 'Sender',
          iconName: 'record_voice_over',
          className: 'col s12 m3',
          placeholder: 'Pick participant',
          options: recipients,
          checkedId: pm.senderId,
          onchange: v => {
            pm.senderId = v[0] as string;
            update();
          },
        }),
        m(Select, {
          label: 'Participant(s)',
          id: 'person',
          disabled,
          iconName: 'people',
          className: 'col s12 m6',
          placeholder: 'Pick one or more',
          multiple: true,
          options: recipients,
          initialValue: pm.recipientIds,
          onchange: v => {
            pm.recipientIds = v as string[];
            update();
          },
        }),
        m(TextInput, {
          disabled,
          id: 'title',
          initialValue: pm.title || inject.title,
          onchange: (v: string) => {
            pm.title = inject.title = v;
            update(['title', 'message']);
          },
          label: 'Subject',
          iconName: 'title',
          className: 'col s12',
        }),
        m(TextArea, {
          disabled,
          id: 'desc',
          initialValue: pm.description || inject.description,
          onchange: (v: string) => {
            pm.description = inject.description = v;
            update(['title', 'message']);
          },
          label: 'Content',
          iconName: 'note',
          className: 'col s12',
        }),
      ];
    },
  };
};
