import m from 'mithril';
import {
  IAsset,
  IGuiTemplate,
  IInject,
  IKafkaMessage,
  InjectType,
  ITrial,
  MessageType,
  UserRole,
} from 'trial-manager-models';
import { ScenarioForm, DefaultMessageForm, RolePlayerMessageForm } from '.';
import { MessageComponent, restServiceFactory } from '../../services';
import { getInject, getPath, getUsersByRole } from '../../utils';
import { UIForm, LayoutForm } from 'mithril-ui-form';
import { ModalPanel } from 'mithril-materialized';
import { UploadAsset } from '../ui';
import { RolePlayerMessageView } from './role-player-message';

export type MessageScope = 'edit' | 'execute';

export const MessageForm: MessageComponent = () => {
  const getPathRegex = /&([\w.]+)/;
  let participants: string;
  let participantEmails: string;
  let availableAssets: string;
  let kafkaTopicOpts: string;
  let filePreview: string = '';
  let prev_file_id = -1;
  let customTemplates = [] as IGuiTemplate[];

  const updateFilePreview = async (inject: IInject, trial: ITrial) => {
    if (inject && inject.message && inject.message.SEND_FILE && (inject.message.SEND_FILE as any).file) {
      if (prev_file_id != (inject.message.SEND_FILE as any).file) {
        const assetsSvc = restServiceFactory<IAsset>(`trials/${trial.id}/assets`);
        filePreview = JSON.stringify(await assetsSvc.load((inject.message.SEND_FILE as any).file), undefined, 4);
        prev_file_id = (inject.message.SEND_FILE as any).file;
      }
    }
  };

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
      availableAssets = JSON.stringify(
        assets.filter((a) => a.alias !== 'gui_form').map((a) => ({ id: a.id, label: a.alias || a.filename }))
      );
      kafkaTopicOpts = JSON.stringify(
        kafkaTopics
          .filter((topic: string) => 'send_file'.indexOf(topic) < 0)
          .map((topic: string) => ({
            id: topic,
            label: topic.charAt(0).toUpperCase() + topic.replace(/_/g, ' ').slice(1),
          }))
      );
      const assetsSvc = restServiceFactory<IAsset>(`trials/${trial.id}/assets`);
      const customForms = trial.selectedMessageTypes.filter((msg: IKafkaMessage) => msg.asset);
      customForms.forEach(async (msg: IKafkaMessage) => {
        if (msg.asset) {
          const gui = JSON.parse(JSON.stringify(await assetsSvc.load(msg.asset.id)));
          customTemplates.push({
            label: msg.name,
            icon: msg.iconName,
            topic: msg.name,
            ui: JSON.stringify(gui.ui),
          } as IGuiTemplate);
        }
      });
    },
    oncreate: async ({ attrs: { state } }) => {
      const { mode } = state.app;
      const isExecuting = mode === 'execute';
      const { trial, scenarioId, injectId } = isExecuting && state.exe.trial.id ? state.exe : state.app;
      const inject = getInject(trial, injectId || scenarioId);
      !isExecuting && updateFilePreview(inject as IInject, trial);
    },
    onupdate: async ({ attrs: { state } }) => {
      const { mode } = state.app;
      const isExecuting = mode === 'execute';
      const { trial, scenarioId, injectId } = isExecuting && state.exe.trial.id ? state.exe : state.app;
      const inject = getInject(trial, injectId || scenarioId);
      !isExecuting && updateFilePreview(inject as IInject, trial);
    },
    view: ({ attrs: { state, actions, options } }) => {
      const { owner, mode, templates, assets } = state.app;
      const isExecuting = mode === 'execute';
      const { trial, scenarioId, injectId } = isExecuting && state.exe.trial.id ? state.exe : state.app;
      const inject = getInject(trial, injectId || scenarioId);

      const { editing = true } = options || {};

      if (inject && inject.type === InjectType.INJECT && inject.topic === MessageType.ROLE_PLAYER_MESSAGE) {
        const sao = { state, actions, options };
        return isExecuting && !editing ? m(RolePlayerMessageView, sao) : m(RolePlayerMessageForm, sao);
      }

      if (inject && inject.type === InjectType.INJECT) {
        let kafkaTopicSelect = inject.kafkaTopic === 'send_file' ? JSON.stringify('select') : JSON.stringify('none');
        const { updateInject, createAsset } = actions;
        const disabled = !editing;
        let topic = templates.find((t) => t.topic === inject.topic);
        if (!topic) {
          topic = customTemplates.find((t) => t.topic === inject.topic);
          if (!topic) return;
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
            filePreview !== ''
              ? [
                  m('div.input-field.col.s12', { style: 'height: 300px' }, [
                    m('span', 'File Preview'),
                    m(
                      'textarea.materialize-textarea',
                      { style: 'height: 300px; overflow-y: auto; disabled', disabled: true, id: 'previewArea' },
                      filePreview
                    ),
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
