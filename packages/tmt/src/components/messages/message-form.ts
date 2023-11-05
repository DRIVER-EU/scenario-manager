import m from 'mithril';
import {
  deepCopy,
  IAsset,
  IGuiTemplate,
  IKafkaMessage,
  InjectType,
  ISendFileMessage,
  ISendMessageMessage,
  MessageType,
  UserRole,
} from 'trial-manager-models';
import { ScenarioForm, DefaultMessageForm, RolePlayerMessageForm, RequestUnitMoveForm, GeoJsonMessageForm } from '.';
import { MessageComponent } from '../../services';
import { getInject, getPath, getUsersByRole, isJSON, baseLayers, getResources } from '../../utils';
import { UIForm, LayoutForm } from 'mithril-ui-form';
import { InputCheckbox, ModalPanel } from 'mithril-materialized';
import { UploadAsset } from '../ui';
import { RolePlayerMessageView } from './role-player-message';
import { geoJSON, LeafletMap, GeoJSON } from 'mithril-leaflet';
import { FeatureCollection } from 'geojson';

export type MessageScope = 'edit' | 'execute';

export const MessageForm: MessageComponent = () => {
  const getPathRegex = /&([\w.]+)/;
  let participants: string;
  let participantEmails: string;
  let resources: string;
  let availableAssets: string;
  let kafkaTopicOpts: string;
  let filePreview: string = '';
  let prev_file_id = -1;
  let customTemplates = [] as IGuiTemplate[];
  let asset = {} as IAsset;
  let overlay = undefined as GeoJSON | undefined;
  let assetId: number;
  let showGUI: boolean = false;
  let visualizedGUI: UIForm | boolean;
  let messageIsGUI: boolean = false;

  const ignoredTopics = new Set([
    'send_file',
    'send_message',
    'system_logging',
    'system_heartbeat',
    'system_tm_phase_message',
    'system_tm_role_player',
    'simulation_time_control',
    'simulation_time_mgmt',
    'simulation_session_mgmt',
    'simulation_request_startinject',
  ]);

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
      resources = JSON.stringify(
        getResources(trial).map((r) => ({ id: r.id, label: r.name }))
      );
      availableAssets = JSON.stringify(
        assets
          .filter((a) => a.alias !== 'gui_form')
          .map((a) => ({ id: a.id, label: a.alias || a.filename }))
          .sort((a, b) => a.label.localeCompare(b.label))
      );
      kafkaTopicOpts = JSON.stringify(
        kafkaTopics
          .filter((topic: string) => !ignoredTopics.has(topic))
          .map((topic: string) => ({
            id: topic,
            label: topic.charAt(0).toUpperCase() + topic.replace(/_/g, ' ').slice(1),
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      );
      const customForms = trial.selectedMessageTypes.filter((msg) => msg.useCustomGUI);
      customForms.forEach((msg: IKafkaMessage) => {
        if (msg.useCustomGUI && msg.customGUI) {
          const gui = msg.customGUI;
          console.log(gui);
          customTemplates.push({
            label: msg.name,
            icon: msg.iconName,
            topic: msg.templateId,
            ui: JSON.stringify(JSON.parse(gui).ui),
          } as IGuiTemplate);
        }
      });
    },
    view: ({ attrs: { state, actions, options } }) => {
      const { owner, mode, templates, assets } = state.app;
      const isExecuting = mode === 'execute';
      const { trial, scenarioId, injectId } = isExecuting && state.exe.trial.id ? state.exe : state.app;
      const inject = getInject(trial, injectId || scenarioId);

      const { editing = true } = options || {};

      console.log(JSON.stringify(inject, null, 2))
      if (inject && inject.type === InjectType.INJECT) {
        const sao = { state, actions, options };
        switch (inject.templateId) {
          case MessageType.ROLE_PLAYER_MESSAGE:
            return isExecuting && !editing ? m(RolePlayerMessageView, sao) : m(RolePlayerMessageForm, sao);
          case MessageType.REQUEST_UNIT_MOVE:
            return m(RequestUnitMoveForm, sao);
          case MessageType.GEOJSON_MESSAGE:
            return m(GeoJsonMessageForm, sao);
        }
      }

      if (inject && inject.message && inject.message.SEND_FILE) {
        assetId = (inject.message.SEND_FILE as ISendFileMessage).file;
      }

      if (inject && inject.type === InjectType.INJECT) {
        const { updateInject, createAsset } = actions;
        const disabled = !editing;
        const template = [...customTemplates, ...templates].find((t) => t.id === inject.templateId);
        if (!template) return;
        const { update } = template;
        const ui =
          typeof template.ui === 'string' &&
          (JSON.parse(
            template.ui
              .replace(/&id/g, inject.id)
              .replace(/&title/g, inject.title)
              .replace(/&owner/g, owner)
              .replace(/"&participants"/g, participants)
              .replace(/"&participantEmails"/g, participantEmails)
              .replace(/"&assets"/g, availableAssets)
              .replace(/"&kafkaTopics"/g, kafkaTopicOpts)
          ) as UIForm);

        const original = assets.filter((a) => a.id === assetId).shift();
        if (original && (!asset || asset.id !== assetId)) {
          overlay = undefined;
          asset = deepCopy(original);
        }
        // If there is an assetID AND an asset URL && We are not requesting an already requested file
        if (asset.id && asset.url && prev_file_id != asset?.id) {
          // request file
          m.request(asset.url).then((json) => {
            const isJson = isJSON(asset.filename);
            const isGeoJSON = isJson
              ? json && (json as FeatureCollection).features && (json as FeatureCollection).features.length > 0
              : false;
            // If geojson and there is no overlay, create overlay
            if (isGeoJSON && !overlay) {
              overlay = geoJSON(json as GeoJSON.FeatureCollection);
            }
            // set prev_file_id (to prevent request loop) and set filePreview text
            prev_file_id = asset?.id;
            filePreview = JSON.stringify(json, undefined, 4);
          });
        }
        // Else, if there is no asset url reset filepreview and prev_file_id
        else if (!asset.url) {
          filePreview = '';
          prev_file_id = asset.id;
        }

        if (
          inject.message &&
          inject.message.SEND_MESSAGE &&
          (inject.message.SEND_MESSAGE as ISendMessageMessage).message &&
          (inject.message.SEND_MESSAGE as ISendMessageMessage).message.length > 1
        ) {
          let vizTopic: IGuiTemplate;
          try {
            vizTopic = JSON.parse((inject.message.SEND_MESSAGE as ISendMessageMessage).message);
          } catch (e) {
            vizTopic = {} as IGuiTemplate;
          }
          if (vizTopic.ui) {
            messageIsGUI = true;
            //@ts-ignore
            const uiString = JSON.stringify(vizTopic.ui);
            visualizedGUI =
              typeof uiString === 'string' &&
              (JSON.parse(
                uiString
                  .replace(/&id/g, inject.id)
                  .replace(/&title/g, inject.title)
                  .replace(/&owner/g, owner)
                  .replace(/"&participants"/g, participants)
                  .replace(/"&participantEmails"/g, participantEmails)
                  .replace(/"&resources"/g, resources)
                  .replace(/"&assets"/g, availableAssets)
                  .replace(/"&kafkaTopics"/g, kafkaTopicOpts)
              ) as UIForm);
          } else {
            messageIsGUI = false;
            visualizedGUI = false;
          }
        } else {
          messageIsGUI = false;
          visualizedGUI = false;
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
                          replacement = replacement.replace(
                            new RegExp(`&${match}`, 'g'),
                            typeof value === 'undefined' ? '' : value.toString()
                          );
                        });
                    }
                    (inject as Record<string, any>)[key] = eval(`\`${replacement}\``);
                  });
                updateInject(inject);
              },
            }),
            overlay && filePreview !== ''
              ? [
                m(LeafletMap, {
                  className: 'col s6',
                  baseLayers,
                  style: 'height: 300px; max-height: 300px',
                  overlays: { [asset.alias || asset.filename]: overlay },
                  visible: [asset.alias || asset.filename],
                  showScale: { imperial: false },
                  onLoaded: (map) => {
                    overlay && map.fitBounds(overlay?.getBounds());
                  },
                }),
                m('div.input-field.col.s6', { style: 'height: 300px; margin: 0px; max-height: 300px' }, [
                  m('span', 'File Preview'),
                  m(
                    'textarea.materialize-textarea',
                    {
                      style: 'height: 280px; overflow-y: auto; max-height: 280px',
                      disabled: true,
                      id: 'previewArea',
                    },
                    filePreview
                  ),
                ]),
              ]
              : overlay
                ? m(LeafletMap, {
                  baseLayers,
                  style: 'width: 100%; height: 300px; margin: 5px; max-height: 300px',
                  overlays: { [asset.alias || asset.filename]: overlay },
                  visible: [asset.alias || asset.filename],
                  showScale: { imperial: false },
                  onLoaded: (map) => {
                    overlay && map.fitBounds(overlay?.getBounds());
                  },
                })
                : filePreview !== ''
                  ? m('div.input-field.col.s12', { style: 'height: 300px; margin-bottom: 40px; max-height: 300px' }, [
                    m('span', 'File Preview'),
                    m(
                      'textarea.materialize-textarea',
                      { style: 'height: 300px; overflow-y: auto; max-height: 300px', disabled: true, id: 'previewArea' },
                      filePreview
                    ),
                  ])
                  : inject.kafkaTopic === 'send_message'
                    ? [
                      messageIsGUI
                        ? m(InputCheckbox, {
                          label: 'Render GUIForm?',
                          className: 'col s6',
                          checked: showGUI,
                          onchange: (v) => {
                            showGUI = v as boolean;
                          },
                        })
                        : undefined,
                      showGUI && visualizedGUI
                        ? m(LayoutForm, {
                          form: visualizedGUI as UIForm,
                          obj: {},
                          disabled: true,
                        })
                        : undefined,
                      m('div.input-field.col.s12', { style: 'height: 300px; margin-bottom: 40px; max-height: 300px' }, [
                        m('i.material-icons prefix', 'code'),
                        // m('span', 'JSON message'),
                        m(
                          'textarea.materialize-textarea#send_message_ta',
                          {
                            style: 'height: 300px; overflow-y: auto; max-height: 300px',
                            id: 'jsonTextArea',
                            onchange: (e: any) => {
                              if (inject.message && inject.message.SEND_MESSAGE) {
                                (inject.message.SEND_MESSAGE as ISendMessageMessage).message = e.target.value;
                                updateInject(inject);
                              }
                            },
                          },
                          inject.message &&
                            inject.message.SEND_MESSAGE &&
                            (inject.message.SEND_MESSAGE as ISendMessageMessage).message
                            ? (inject.message.SEND_MESSAGE as ISendMessageMessage).message
                            : undefined
                        ),
                        m('label.active[for=send_message_ta]', 'JSON message'),
                      ]),
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
                  availableAssets = JSON.stringify(
                    assets
                      .map((a) => ({ id: a.id, label: a.alias || a.filename }))
                      .sort((a, b) => a.label.localeCompare(b.label))
                  );
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
