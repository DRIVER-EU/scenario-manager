import m from 'mithril';
import { TextArea, TextInput, Select, FlatButton, ModalPanel } from 'mithril-materialized';
import { getMessage, MessageType, IPostMsg, UserRole } from '../../../../models';
import { enumToOptions, getActiveTrialInfo, getUsersByRole } from '../../utils';
import { MessageComponent } from '../../services';
import { UploadAsset } from '../ui';

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
export const PostMessageForm: MessageComponent = () => {
  let recipients: Array<{ id: string; label: string }> = [];
  const options = enumToOptions(MediumTypes);

  return {
    oninit: ({ attrs: { state } }) => {
      const { trial } = getActiveTrialInfo(state);
      recipients = getUsersByRole(trial, UserRole.PARTICIPANT).map((rp) => ({ id: rp.id, label: rp.name }));
    },
    view: ({
      attrs: {
        state,
        actions: { updateInject, createAsset },
        options: { editing } = { editing: true },
      },
    }) => {
      const { inject } = getActiveTrialInfo(state);
      const { assets } = state.app;

      if (!inject) return;
      const disabled = !editing;
      const pm = getMessage(inject, MessageType.POST_MESSAGE) as IPostMsg;

      const availableAssets = assets.map((a) => ({ id: a.id, label: a.alias || a.filename }));

      return [
        m(Select, {
          disabled,
          label: 'Media type',
          isMandatory: true,
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
          label: 'From',
          isMandatory: true,
          // iconName: 'record_voice_over',
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
          label: 'To',
          id: 'person',
          isMandatory: true,
          disabled,
          // iconName: 'people',
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
        m(Select, {
          disabled,
          label: 'Attachments',
          isMandatory: true,
          iconName: 'attach_file',
          placeholder: 'Select attachments',
          className: 'col s11',
          checkedId: pm.attachments,
          options: availableAssets,
          multiple: true,
          onchange: (v) => {
            pm.attachments = v;
            updateInject(inject);
          },
        }),
        m(FlatButton, {
          disabled,
          className: 'input-field col s1',
          modalId: 'upload',
          iconName: 'file_upload',
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
        m(ModalPanel, {
          disabled,
          id: 'upload',
          title: 'Upload a file',
          description: m(UploadAsset, {
            accept: ['.json', '.geojson', '.png', '.jpg', '.jpeg', '*'],
            placeholder: 'Upload a file.',
            createAsset,
            done: () => {
              const el = document.getElementById('upload');
              if (el) {
                M.Modal.getInstance(el).close();
              }
            },
          }),
          bottomSheet: true,
        }),
      ];
    },
  };
};
