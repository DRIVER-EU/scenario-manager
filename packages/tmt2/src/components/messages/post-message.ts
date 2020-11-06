import m from 'mithril';
import { TextArea, TextInput, Select } from 'mithril-materialized';
import { getMessage, MessageType, IPostMsg, UserRole } from '../../../../models';
import { enumToOptions, getInject, getUsersByRole } from '../../utils';
import { MeiosisComponent } from '../../services';

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
export const PostMessageForm: MeiosisComponent = () => {
  let recipients: Array<{ id: string; label: string }> = [];
  const options = enumToOptions(MediumTypes);

  return {
    oninit: ({
      attrs: {
        state: {
          app: { trial },
        },
      },
    }) => {
      // const svc = scope === 'edit' ? TrialSvc : RunSvc;
      recipients = getUsersByRole(trial, UserRole.PARTICIPANT).map((rp) => ({ id: rp.id, label: rp.name }));
    },
    view: ({
      attrs: {
        state: {
          app: { trial, injectId, mode },
        },
        actions: { updateInject },
      },
    }) => {
      const inject = getInject(trial, injectId);
      const disabled = mode !== 'edit';
      if (!inject) return;
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
          onchange: (v) => {
            pm.type = v[0] as MediumTypes;
            updateInject(inject);
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
          onchange: (v) => {
            pm.senderId = v[0] as string;
            updateInject(inject);
            // update();
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
          onchange: (v) => {
            pm.recipientIds = v as string[];
            updateInject(inject);
            // update();
          },
        }),
        m(TextInput, {
          disabled,
          id: 'title',
          initialValue: pm.title || inject.title,
          onchange: (v: string) => {
            pm.title = inject.title = v;
            updateInject(inject);
            // update(['title', 'message']);
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
            updateInject(inject);
            // update(['title', 'message']);
          },
          label: 'Content',
          iconName: 'note',
          className: 'col s12',
        }),
      ];
    },
  };
};
