import m from 'mithril';
import { IAsset, InjectType, UserRole } from '../../../../models';
import { ScenarioForm, DefaultMessageForm } from '.';
import { MessageComponent, restServiceFactory } from '../../services';
import { getInject, getPath, getUsersByRole } from '../../utils';
import { UIForm, LayoutForm } from 'mithril-ui-form';
import { ModalPanel, TextArea } from 'mithril-materialized';
import { UploadAsset } from '../ui';

export type MessageScope = 'edit' | 'execute';

// export const getMessageForm = (state: IAppModel, actions: IActions, inject: IInject, editing = true) => {
//   const getPathRegex = /&([\w.]+)/g;
//   const options = { editing };
//   const sao = { state, actions, options };
//   const {
//     app: { owner, templates },
//   } = state;
//   const { updateInject } = actions;
//   const topic = templates.find((t) => t.topic === inject.topic);
//   if (!topic) return;
//   const { update } = topic;
//   const ui =
//     typeof topic.ui === 'string' &&
//     (JSON.parse(topic.ui.replace(/&id/g, inject.id).replace(/&owner/g, owner)) as UIForm);
//   if (ui)
//     return m(
//       '.row',
//       m(LayoutForm, {
//         form: ui,
//         obj: inject,
//         disabled: !editing,
//         onchange: () => {
//           update &&
//             Object.keys(update).forEach((key) => {
//               const replacement = update[key];
//               let matches: RegExpExecArray | null;
//               while ((matches = getPathRegex.exec(replacement))) {
//                 if (matches.index === getPathRegex.lastIndex) getPathRegex.lastIndex++;
//                 matches
//                   .filter((_, i) => i !== 0)
//                   .forEach((match) => {
//                     const value = getPath(inject, match);
//                     if (typeof value !== 'undefined') {
//                       (inject as Record<string, any>)[key] = replacement.replace(`&${match}`, value);
//                     }
//                   });
//               }
//             });
//           // console.log(`Updating ${JSON.stringify(i)}`);
//           updateInject(inject);
//         },
//       })
//     );
//   switch (inject.topic) {
//     case MessageType.CHECKPOINT:
//       return m(RolePlayerMessageForm, { state, actions, options: { editing, checkpoint: true } });
//     case MessageType.ROLE_PLAYER_MESSAGE:
//       return editing ? m(RolePlayerMessageForm, sao) : m(RolePlayerMessageView, sao);
//     case MessageType.GEOJSON_MESSAGE:
//       return m(GeoJsonMessageForm, sao);
//     case MessageType.CAP_MESSAGE:
//       return m(CapMessageForm, sao);
//     case MessageType.LCMS_MESSAGE:
//       return m(LcmsMessageForm, sao);
//     case MessageType.CHANGE_OBSERVER_QUESTIONNAIRES:
//       return m(OstChangeStageMessageForm, sao);
//     case MessageType.LARGE_DATA_UPDATE:
//       return m(LargeDataUpdateMessageForm, sao);
//     case MessageType.SUMO_CONFIGURATION:
//       return m(SumoConfigurationForm, sao);
//     case MessageType.REQUEST_UNIT_MOVE:
//       return m(RequestUnitMoveForm, sao);
//     case MessageType.SET_AFFECTED_AREA:
//       return m(SetAffectedAreaForm, sao);
//     default:
//       return inject.topic && m('.row', 'TODO: ' + inject.topic);
//   }
// };

export const MessageForm: MessageComponent = () => {
  const getPathRegex = /&([\w.]+)/;
  let participants: string;
  let participantEmails: string;
  let availableAssets: string;
  let kafkaTopicOpts: string;
  let filePreview: string;
  let prev_file_id = -1;

  return {
    oninit: ({ attrs: { state } }) => {
      const {
        app: { mode, assets, kafkaTopics },
      } = state;
      const isExecuting = mode === 'execute';
      const { trial } = isExecuting && state.exe.trial.id ? state.exe : state.app;
      participants = JSON.stringify(
        getUsersByRole(trial, UserRole.PARTICIPANT).map((rp) => ({ id: rp.id, label: rp.name }))
      );
      participantEmails = JSON.stringify(
        getUsersByRole(trial, UserRole.PARTICIPANT).map((rp) => ({ id: rp.email, label: rp.name }))
      );
      availableAssets = JSON.stringify(assets.map((a) => ({ id: a.id, label: a.alias || a.filename })));
      kafkaTopicOpts = JSON.stringify(
        kafkaTopics
          .filter((topic: string) => 'send_file'.indexOf(topic) < 0)
          .map((topic: string) => ({ id: topic, label: topic }))
      );
    },
    onupdate: async ({ attrs: { state } }) => {
      const { mode } = state.app;
      const isExecuting = mode === 'execute';
      const { trial, scenarioId, injectId } = isExecuting && state.exe.trial.id ? state.exe : state.app;
      const inject = getInject(trial, injectId || scenarioId);

      //@ts-ignore
      if (inject && inject.message && inject.message.SEND_FILE && inject.message.SEND_FILE.file) {
        //@ts-ignore
        if (prev_file_id != inject.message.SEND_FILE.file) {
          const assetsSvc = restServiceFactory<IAsset>(`trials/${trial.id}/assets`);
          //@ts-ignore
          filePreview = JSON.stringify(await assetsSvc.load(inject.message.SEND_FILE.file), undefined, 4);
          //@ts-ignore
          prev_file_id = inject.message.SEND_FILE.file;
        }
      }
    },
    view: ({ attrs: { state, actions, options } }) => {
      const { owner, mode, templates, assets } = state.app;
      const isExecuting = mode === 'execute';
      const { trial, scenarioId, injectId } = isExecuting && state.exe.trial.id ? state.exe : state.app;
      const inject = getInject(trial, injectId || scenarioId);

      if (inject && inject.type === InjectType.INJECT) {
        const { updateInject, createAsset } = actions;
        const { editing = true } = options || {};
        const disabled = !editing;
        const topic = templates.find((t) => t.topic === inject.topic);
        if (!topic) return;
        const { update } = topic;
        const ui =
          typeof topic.ui === 'string' &&
          (JSON.parse(
            topic.ui
              .replace(/&id/g, inject.id)
              .replace(/&title/g, inject.title)
              .replace(/&owner/g, owner)
              .replace(/"&participants"/g, participants)
              .replace(/"&participantEmails"/g, participantEmails)
              .replace(/"&assets"/g, availableAssets)
              .replace(/"&kafkaTopics"/g, kafkaTopicOpts)
          ) as UIForm);
        // console.log(JSON.stringify(inject, null, 2));
        return (
          ui &&
          m('.row.message-form', [
            m(LayoutForm, {
              form: ui,
              obj: inject,
              disabled,
              onchange: () => {
                update &&
                  Object.keys(update).forEach((key) => {
                    let replacement = update[key];
                    let matches: RegExpExecArray | null;
                    while ((matches = getPathRegex.exec(replacement))) {
                      if (matches.index === getPathRegex.lastIndex) getPathRegex.lastIndex++;
                      matches
                        .filter((_, i) => i !== 0)
                        .forEach((match) => {
                          const value = getPath(inject, match);
                          replacement = replacement.replace(new RegExp(`&${match}`, 'g'), value || '');
                        });
                    }
                    (inject as Record<string, any>)[key] = eval(`\`${replacement}\``);
                  });
                updateInject(inject);
              },
            }),
            topic.icon === 'attach_file' &&
            filePreview &&
            inject.message &&
            inject.message.SEND_FILE &&
            //@ts-ignore
            inject.message.SEND_FILE.file
              ? [
                  m(TextArea, {
                    label: 'File Preview',
                    iconName: 'attach_file',
                    className: 'col s12',
                    initialValue: filePreview,
                    disabled: true,
                  }),
                ]
              : undefined,
            m(ModalPanel, {
              disabled,
              id: 'upload',
              title: 'Upload a file',
              description: m(UploadAsset, {
                accept: ['.json', '.geojson', '.png', '.jpg', '.jpeg', '*'],
                placeholder: 'Upload a file.',
                createAsset,
                done: () => {
                  availableAssets = JSON.stringify(assets.map((a) => ({ id: a.id, label: a.alias || a.filename })));
                  const el = document.getElementById('upload');
                  if (el) {
                    M.Modal.getInstance(el).close();
                  }
                },
              }),
              bottomSheet: true,
            }),
          ])
        );
      }

      return inject
        ? inject.type === InjectType.SCENARIO
          ? m(ScenarioForm, { state, actions, options })
          : m(DefaultMessageForm, { state, actions, options })
        : undefined;
    },
  };
};
