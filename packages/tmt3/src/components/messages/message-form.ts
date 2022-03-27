import m from 'mithril';
import { deepCopy, IAsset, IGuiTemplate, IKafkaMessage, InjectType, MessageType, UserRole } from 'trial-manager-models';
import { ScenarioForm, DefaultMessageForm, RolePlayerMessageForm } from '.';
import { MessageComponent, restServiceFactory } from '../../services';
import { getInject, getPath, getUsersByRole, isJSON, baseLayers } from '../../utils';
import { UIForm, LayoutForm } from 'mithril-ui-form';
import { ModalPanel } from 'mithril-materialized';
import { UploadAsset } from '../ui';
import { RolePlayerMessageView } from './role-player-message';
import { geoJSON, LeafletMap, GeoJSON } from 'mithril-leaflet';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

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
  let filePreview: string = '';
  let prev_file_id = -1;
  let customTemplates = [] as IGuiTemplate[];
  let asset = {} as IAsset;
  let overlay = undefined as GeoJSON | undefined;
  let assetId: number;

  return {
    oninit: async ({ attrs: { state } }) => {
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
      availableAssets = JSON.stringify(assets.filter((a) => a.alias !== 'gui_form').map((a) => ({ id: a.id, label: a.alias || a.filename })).sort((a, b) => a.label.localeCompare(b.label)));
      kafkaTopicOpts = JSON.stringify(
        kafkaTopics
          .filter((topic: string) => 'send_file'.indexOf(topic) < 0)
          .map((topic: string) => ({
            id: topic,
            label: topic.charAt(0).toUpperCase() + topic.replace(/_/g, ' ').slice(1),
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      );
      const assetsSvc = restServiceFactory<IAsset>(`trials/${trial.id}/assets`);
      const customForms = trial.selectedMessageTypes.filter((msg: IKafkaMessage) => msg.asset)
      customForms.forEach(async (msg: IKafkaMessage) => {
        if(msg.asset) {
        const gui = JSON.parse(JSON.stringify(await assetsSvc.load(msg.asset.id)))
        customTemplates.push({
          label: msg.name,
          icon: msg.iconName,
          topic: msg.name,
          ui: JSON.stringify(gui.ui),
        } as IGuiTemplate)
        }
      })
    },
    view: ({ attrs: { state, actions, options } }) => {
      const { owner, mode, templates, assets } = state.app;
      const isExecuting = mode === 'execute';
      const { trial, scenarioId, injectId } = isExecuting && state.exe.trial.id ? state.exe : state.app;
      const inject = getInject(trial, injectId || scenarioId);
      
      const { editing = true } = options || {};

      if(inject && inject.type === InjectType.INJECT && inject.topic === MessageType.ROLE_PLAYER_MESSAGE) {
        const sao = { state, actions, options };
        return  isExecuting && !editing ? m(RolePlayerMessageView, sao) : m(RolePlayerMessageForm, sao);
      }

      if(inject && inject.message) {
        assetId = (inject.message.SEND_FILE as any).file
      }

      if (inject && inject.type === InjectType.INJECT) {
        let kafkaTopicSelect = inject.kafkaTopic === 'send_file' ? JSON.stringify('select') : JSON.stringify('none');
        const { updateInject, createAsset } = actions;
        const disabled = !editing;
        let topic = templates.find((t) => t.topic === inject.topic);
        if (!topic) {
          topic = customTemplates.find((t) => t.topic === inject.topic);
          if(!topic) return;
        }
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
              .replace(/"&kafkaTopicSet"/g, kafkaTopicSelect)
          ) as UIForm);
        // console.log(JSON.stringify(inject, null, 2));

        const original = assets.filter((a) => a.id === assetId).shift();
        if (original && (!asset || asset.id !== assetId)) {
          overlay = undefined;
          asset = deepCopy(original);
        }
        if (!overlay && isJSON(asset.filename) && asset.url) {
          m.request<FeatureCollection<Geometry, GeoJsonProperties>>(asset.url).then((json) => {
            const isGeoJSON = json && json.features && json.features.length > 0;
            if (isGeoJSON) {
              overlay = geoJSON(json as GeoJSON.FeatureCollection);
            }
          });
        }
        if (asset.id && prev_file_id != asset?.id && asset.url) {
          prev_file_id = asset?.id;
          asset.url.length > 1
            ? m.request({ url: asset?.url as string, method: 'GET' }).then((json) => {
                filePreview = JSON.stringify(json, undefined, 4);
              })
            : undefined;
        } else if (!asset.url) {
          filePreview = '';
          prev_file_id = asset.id;
        }

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
            overlay && filePreview !== ''
            ? [m(LeafletMap, {
              className: 'col s6',
                baseLayers,
                style: 'height: 300px',
                overlays: { [asset.alias || asset.filename]: overlay },
                visible: [asset.alias || asset.filename],
                showScale: { imperial: false },
                onLoaded: (map) => {
                  overlay && map.fitBounds(overlay?.getBounds());
                },
              }),
              m('div.input-field.col.s6', { style: 'height: 300px; margin: 0px' }, [
                m('span', 'File Preview'),
                m(
                  'textarea.materialize-textarea',
                  { style: 'height: 280px; overflow-y: auto;', disabled: true, id: 'previewArea' },
                  filePreview
                ),
              ])]
            : overlay
            ? m(LeafletMap, {
                baseLayers,
                style: 'width: 100%; height: 300px; margin: 5px;',
                overlays: { [asset.alias || asset.filename]: overlay },
                visible: [asset.alias || asset.filename],
                showScale: { imperial: false },
                onLoaded: (map) => {
                  overlay && map.fitBounds(overlay?.getBounds());
                },
              })
            : filePreview !== ''
            ? m('div.input-field.col.s12', { style: 'height: 300px; margin-bottom: 40px' }, [
                m('span', 'File Preview'),
                m(
                  'textarea.materialize-textarea',
                  { style: 'height: 300px; overflow-y: auto;', disabled: true, id: 'previewArea' },
                  filePreview
                ),
              ])
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
                  availableAssets = JSON.stringify(assets.map((a) => ({ id: a.id, label: a.alias || a.filename })).sort((a, b) => a.label.localeCompare(b.label)));
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
