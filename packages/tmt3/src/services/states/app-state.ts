import Stream from 'mithril/stream';
import { applyPatch, Operation } from 'rfc6902';
import { IRestService, restServiceFactory, SocketSvc, runServiceFactory, actions } from '..';
import {
  deepCopy,
  IAsset,
  IExecutingInject,
  IGuiTemplate,
  IInject,
  IInjectSimStates,
  IKafkaMessage,
  IMessageTopic,
  InjectType,
  IObjective,
  IPerson,
  IScenario,
  ISessionManagement,
  IStakeholder,
  IStateTransitionRequest,
  ITimeManagement,
  ITrial,
  MessageType,
  SessionState,
  TimeCommand,
  uniqueId,
  UserRole,
} from 'trial-manager-models';
import { MessageScope } from '../../components/messages';
import { arrayMove, getInjects, getInject, isScenario, validateInjects } from '../../utils';
import { IAppModel, UpdateStream } from '../meiosis';
import { ISessionControl } from '../../models';

const trialSvc = restServiceFactory<ITrial>('trials');
let assetsSvc: IRestService<IAsset>;

const runSvc = runServiceFactory((process.env.SERVER || location.origin) + '/tmt');

export interface IActiveTrial {
  trial: ITrial;
  scenarioId: string;
  injectId: string;
  treeState: {
    [id: string]: boolean;
  };
}

export interface ICustomMessage {
  name: string;
  type: string;
  kafkaTopic: string;
}

export interface IApp extends IActiveTrial {
  apiService: string;
  /** Operating mode */
  mode: MessageScope;
  /** Overview of all trials */
  trials: ITrial[];
  /** Active trial */
  trial: ITrial;
  /** Currently selected stakeholder ID */
  stakeholderId: string;
  /** Currently selected scenario ID */
  scenarioId: string;
  /** Currently selected inject ID */
  injectId: string;
  /** Currently selected objective ID */
  objectiveId: string;
  /** Currently selected user ID */
  userId: string;
  /** Currently selected user ID */
  assetId: number;
  /** List of all the available assets */
  assets: IAsset[];
  /** State of the injects tree (items are open or closed) */
  treeState: {
    [id: string]: boolean;
  };
  owner: string;
  copiedInjectIsCut: boolean;
  copiedInjects: undefined | IInject | IInject[];
  /** GUI Templates */
  templates: IGuiTemplate[];
  /** kafkaTopics */
  kafkaTopics: string[];
  /** Currently selected message in config menu */
  messageId: string;
}

export interface IExe extends IActiveTrial {
  /** Executing trial */
  trial: ITrial;
  /** Original trial ID, e.g. when starting a session, the session's trial ID is changed */
  trialId: string;
  /** Executing scenario ID */
  scenarioId: string;
  /** ID of the currently active user */
  userId: string;
  /** Currently selected inject ID */
  injectId: string;
  injectStates: IInjectSimStates;
  time: ITimeManagement;
  sessionControl: ISessionControl;
  scenarioStartTime: Date;
  session: Partial<ISessionManagement>;
  /** When a timeline item starts */
  startTime?: number;
}

/** Application state */
export interface IAppStateModel {
  app: IApp;
  exe: IExe;
}

export interface IAppStateActions {
  /** Pass-through to update function */
  update: (state: { app?: Partial<IApp>; exe?: Partial<IExe> }) => void;

  setEditMode: (editing: boolean) => void;
  setInjectStates: (injectStates: IInjectSimStates) => void;
  updateExecutingInject: (inject: IExecutingInject) => Promise<void>;
  updateSession: (s?: Partial<ISessionManagement>) => Promise<void>;
  updateSessionControl: (sessionControl: ISessionControl) => void;
  startSession: (session: ISessionManagement) => Promise<void>;
  stopSession: () => Promise<void>;

  toggleTreeItem: (id: string) => void;

  updateKafkaTopics: (kafkaTopics: string[]) => void;

  loadTrials: () => Promise<void>;
  loadTrial: (trialId: string, mode?: MessageScope) => Promise<void>;
  newTrial: () => void;
  saveTrial: (trial: ITrial) => Promise<void>;
  deleteTrial: (trialId: string | number) => Promise<void>;

  selectAsset: (asset: IAsset) => void;
  createAsset: (asset: IAsset, files?: FileList) => Promise<void>;
  updateAsset: (asset: IAsset, files?: FileList) => Promise<void>;
  deleteAsset: (asset: IAsset) => Promise<void>;

  selectScenario: (scenario: IInject | string) => void;
  loginUser: (userId: string) => void;

  selectInject: (inject: IInject | string) => void;
  createInject: (inject: IInject) => Promise<void>;
  createInjects: (injects: IInject[]) => Promise<void>;
  updateInject: (inject: IInject) => Promise<void>;
  deleteInject: (inject: IInject) => Promise<void>;
  moveInject: (source: IInject, target: IInject) => Promise<void>;
  transitionInject: (st: IStateTransitionRequest) => Promise<boolean>;
  updateMessageTopics: (topics: IMessageTopic[]) => Promise<void>;

  selectStakeholder: (stakeholder: IStakeholder) => void;
  createStakeholder: (stakeholder: IStakeholder) => Promise<void>;
  updateStakeholder: (stakeholder: IStakeholder) => Promise<void>;
  deleteStakeholder: (stakeholder: IStakeholder) => Promise<void>;

  updateSelectedMessageTypes: (messageTypes: string[]) => Promise<void>;

  selectObjective: (objective: IObjective) => void;
  createObjective: (objective: IObjective) => Promise<void>;
  updateObjective: (objective: IObjective) => Promise<void>;
  deleteObjective: (objective: IObjective) => Promise<void>;

  selectUser: (user: IPerson) => void;
  createUser: (user: IPerson) => Promise<void>;
  updateUser: (user: IPerson) => Promise<void>;
  deleteUser: (user: IPerson) => Promise<void>;

  saveNewKafkaMessage: (fn: string, tn: string) => void;
  deleteKafkaMessage: (entr: IKafkaMessage) => void;

  setPresetRole: (id: string) => void;

  selectMessage: (msg: IKafkaMessage) => void;
  createMessage: (msg: IKafkaMessage) => Promise<void>;
  updateMessage: (msg: IKafkaMessage, files?: FileList) => Promise<void>;
  deleteMessage: (msg: IKafkaMessage) => Promise<void>;
}

export interface IAppState {
  initial: IAppStateModel;
  actions: (us: UpdateStream, states: Stream<IAppModel>) => IAppStateActions;
}

const files2formData = (asset: IAsset, files: FileList) => {
  if (asset && files && files.length > 0) {
    const data = new FormData();
    const file = files[0];
    asset.filename = file.name;
    asset.mimetype = file.type;
    if (asset.id) {
      data.append('id', asset.id.toString());
    }
    data.append('file', file);
    data.append('alias', asset.alias || '');
    data.append('filename', asset.filename || '');
    return data;
  }
  return undefined;
};

const stripNamespaces = (fd: FormData) => {
  // @ts-ignore
  let text: string = '';
  const handleFileLoad = (event: any) => {
    text = event.target.result;
  };

  fd.forEach((value) => {
    if (value instanceof File) {
      const fr = new FileReader();
      fr.onload = handleFileLoad;
      fr.readAsText(value);
    }
  });

  return fd;
};

export const appStateMgmt = {
  initial: {
    app: {
      /** During development, use this URL to access the server. */
      apiService: process.env.SERVER || location.origin,
      mode: 'edit',
      trials: [],
      trial: {} as ITrial,
      stakeholderId: '',
      injectId: '',
      objectiveId: '',
      userId: '',
      assetId: -1,
      assets: [],
      treeState: {},
      owner: 'TB_TrialMgmt',
      scenarioId: '',
      copiedInjectIsCut: false,
      copiedInjects: undefined as undefined | IInject | IInject[],
      templates: [],
      kafkaTopics: [],
      messageId: '',
    },
    exe: {
      trial: {} as ITrial,
      trialId: '',
      scenarioId: '',
      userId: '',
      injectId: '',
      treeState: {},
      injectStates: {} as IInjectSimStates,
      time: {} as ITimeManagement,
      scenarioStartTime: new Date(),
      sessionControl: {
        isConnected: false,
        activeSession: false,
        realtime: false,
        host: '',
      },
      session: {
        id: '1',
        name: '',
        trialId: '',
        scenarioId: '',
        comments: '',
      } as Partial<ISessionManagement>,
    },
  },

  actions: (update, states) => {
    return {
      update: (state: Partial<IAppModel>) => update(state),

      setEditMode: (editing: boolean) => update({ app: { mode: editing ? 'edit' : 'execute' } }),
      setInjectStates: (injectStates: IInjectSimStates) => update({ exe: { injectStates } }),
      updateExecutingInject: async (inject: IExecutingInject) => {
        await runSvc.updateInject(inject);
      },
      updateSessionControl: (sessionControl: ISessionControl) => update({ exe: { sessionControl } }),
      updateSession: async (s?: Partial<ISessionManagement>) => {
        const { trial } = states().app;
        const t = await runSvc.activeTrial();
        const session = await runSvc.activeSession();
        if (session && (session.state === SessionState.Started || session.state === SessionState.Initializing)) {
          const scenarioId = session.tags ? session.tags.scenarioId : undefined;
          const scenario = getInjects(trial)
            .filter((i) => i.id === scenarioId)
            .shift() as IScenario;
          let scenarioStartTime = scenario && scenario.startDate ? new Date(scenario.startDate) : new Date();
          if (t) {
            const scenario = t.injects.find((inj) => inj.type === 'SCENARIO') as IScenario;
            scenarioStartTime = scenario && scenario.startDate ? new Date(scenario.startDate) : new Date();
          }
          update({ exe: { session, trial: t || trial, scenarioStartTime } });
        } else if (s) {
          // Either no session, or not active, so create a new session
          update({ exe: { session: s } });
        }
      },
      startSession: async (session: ISessionManagement) => {
        await runSvc.load(session);
        update({
          exe: {
            session: session,
            sessionControl: { activeSession: session.state === SessionState.Started } as ISessionControl,
          },
        });
      },
      stopSession: async () => {
        SocketSvc.socket.emit('time-control', { command: TimeCommand.Reset });
        const { trialId } = states().exe;
        await runSvc.unload();
        const session = await runSvc.activeSession();
        const trial = await trialSvc.load(trialId);
        if (session && trial) {
          update({
            exe: {
              trial,
              session,
              sessionControl: { activeSession: session.state === SessionState.Started } as ISessionControl,
            },
          });
        }
      },

      updateKafkaTopics: (kafkaTopics: string[]) => update({ app: { kafkaTopics } }),

      loadTrials: async () => {
        const trials = await trialSvc.loadList();
        update({ app: { trials } });
        // const kafkaTopics = (await SocketSvc.getKafkaTopics()) as string[];
        // update({ app: { trials, kafkaTopics } });
      },
      loadTrial: async (trialId: string, scope: MessageScope = 'edit') => {
        if (scope === 'edit') {
          unregisterForTrialUpdates(states);
          const trial = await trialSvc.load(trialId);
          if (trial) {
            registerForTrialUpdates(trialId, states, update);
            assetsSvc = restServiceFactory<IAsset>(`trials/${trialId}/assets`);
            const assets = (await assetsSvc.loadList()).map((a) => ({
              ...a,
              url: a.filename ? assetsSvc.url + a.id : undefined,
            }));
            const scenario = getInjects(trial).filter(isScenario).shift();
            const treeState = getInjects(trial)
              .filter((i) => i.type !== InjectType.INJECT)
              .reduce((acc, i) => {
                acc[i.id] = true;
                return acc;
              }, {} as { [key: string]: boolean });

            update({ app: { trial, assets, scenarioId: scenario?.id, mode: scope, treeState } });
          }
        } else {
          const state = states();
          const { session = {}, injectStates, trial: t } = state.exe;
          const isRunning = session.state === SessionState.Initializing || session.state === SessionState.Started;
          const trial = isRunning ? (t ? t : await runSvc.activeTrial()) : await trialSvc.load(trialId);
          const scenarioId = session.tags && session.tags.scenarioId ? session.tags.scenarioId : undefined;
          if (trial && trial.injects) {
            if (injectStates) {
              trial.injects = trial.injects.map((i) => ({ ...i, ...injectStates[i.id] }));
            }
            assetsSvc = restServiceFactory<IAsset>(`trials/${trialId}/assets`);
            const assets = (await assetsSvc.loadList()).map((a) => ({
              ...a,
              url: a.filename ? assetsSvc.url + a.id : undefined,
            }));
            const scenario = (
              scenarioId ? getInject(trial, scenarioId) : getInjects(trial).filter(isScenario).shift()
            ) as IScenario;
            const treeState = getInjects(trial)
              .filter((i) => i.type !== InjectType.INJECT)
              .reduce((acc, i) => {
                acc[i.id] = true;
                return acc;
              }, {} as { [key: string]: boolean });
            update({
              exe: { trial, trialId, scenarioId: scenario?.id, session, treeState },
              app: { assets, mode: scope },
            });
          } else {
            actions.stopSession();
          }
        }
      },
      newTrial: () => {
        const hostId = uniqueId();
        const probId = uniqueId();
        const scenId = uniqueId();
        const trial = {
          id: '',
          title: 'New trial',
          users: [
            { id: hostId, name: 'Host', roles: [UserRole.STAKEHOLDER] },
            { id: probId, name: 'Problem owner', roles: [UserRole.STAKEHOLDER] },
            { id: uniqueId(), name: 'Exercise Control', roles: [UserRole.EXCON, UserRole.ROLE_PLAYER] },
            { id: uniqueId(), name: 'Participant 1', roles: [UserRole.PARTICIPANT], email: 'participant1@tmt.eu' },
            { id: uniqueId(), name: 'Participant 2', roles: [UserRole.PARTICIPANT], email: 'participant2@tmt.eu' },
            { id: uniqueId(), name: 'Role player 1', roles: [UserRole.ROLE_PLAYER] },
            { id: uniqueId(), name: 'Role player 2', roles: [UserRole.ROLE_PLAYER] },
            { id: uniqueId(), name: 'Spectator', roles: [UserRole.VIEWER] },
          ],
          stakeholders: [
            {
              id: uniqueId(),
              name: 'Host',
              notes: 'The host is responsible for preparing the facilities during the exercise.',
              contactIds: [hostId],
              roles: [UserRole.STAKEHOLDER],
            },
            {
              id: uniqueId(),
              name: 'Problem owner',
              notes:
                'The problem owner is responsible for defining the gaps, and validating the objectives of the playbook.',
              contactIds: [probId],
              roles: [UserRole.STAKEHOLDER],
            },
          ],
          objectives: [{ id: uniqueId(), title: 'Fix gap 1' }],
          messageTopics: [],
          selectedMessageTypes: [
            {
              id: uniqueId(),
              name: 'Change observer questionnaire',
              messageForm: 'system_request_change_of_trial_stage',
              messageType: MessageType.CHANGE_OBSERVER_QUESTIONNAIRES,
              kafkaTopic: 'system_request_change_of_trial_stage',
              useNamespace: false,
              iconName: 'attach_file',
              useCustomGUI: false,
            },
            {
              id: uniqueId(),
              name: 'Change exercise phase',
              messageForm: 'system_tm_phase_message',
              messageType: MessageType.PHASE_MESSAGE,
              kafkaTopic: 'system_tm_phase_message',
              useNamespace: false,
              iconName: 'attach_file',
              useCustomGUI: false,
            },
            {
              id: uniqueId(),
              name: 'send CAP message',
              messageForm: 'standard_cap',
              messageType: MessageType.CAP_MESSAGE,
              kafkaTopic: 'standard_cap',
              useNamespace: false,
              iconName: 'attach_file',
              useCustomGUI: false,
            },
            {
              id: uniqueId(),
              name: 'Send email, reports, or other posts',
              messageForm: 'simulation_entity_post',
              messageType: MessageType.POST_MESSAGE,
              kafkaTopic: 'simulation_entity_post',
              useNamespace: false,
              iconName: 'attach_file',
              useCustomGUI: false,
            },
            {
              id: uniqueId(),
              name: 'Send file',
              messageForm: 'send_file',
              messageType: MessageType.SEND_FILE,
              kafkaTopic: 'send_file',
              useNamespace: false,
              iconName: 'attach_file',
              useCustomGUI: false,
            },
            {
              id: uniqueId(),
              name: 'Send inject',
              messageForm: 'simulation_request_startinject',
              messageType: MessageType.START_INJECT,
              kafkaTopic: 'simulation_request_startinject',
              useNamespace: false,
              iconName: 'attach_file',
              useCustomGUI: false,
            },
            {
              id: 'rp_msg',
              name: 'Roleplayer Message',
              messageForm: 'ROLE_PLAYER_MESSAGE',
              messageType: 'ROLE_PLAYER_MESSAGE',
              kafkaTopic: 'system_tm_role_player',
              useNamespace: false,
              iconName: 'person',
              useCustomGUI: false,
            },
          ],
          injects: [
            {
              id: scenId,
              title: 'My scenario',
              type: InjectType.SCENARIO,
            } as IScenario,
            {
              id: uniqueId(),
              title: 'Main storyline',
              type: InjectType.STORYLINE,
              parentId: scenId,
            } as IScenario,
          ],
        } as Partial<ITrial>;
        update({ app: { trial: () => trial } } as any);
      },
      saveTrial: async (t: ITrial) => {
        // const {
        //   app: { trial: s },
        // } = states();
        // const t = newTrial || s;
        validateInjects(t);
        t.lastEdit = new Date();
        const trial = (await trialSvc.save(t)) || t;
        update({ app: { trial } });
      },
      deleteTrial: async (trialId: string | number) => {
        await trialSvc.del(trialId);
        update({ app: { trial: undefined } });
      },

      selectScenario: (scenario: IInject | string) => {
        const { mode } = states().app;
        const scenarioId = typeof scenario === 'string' ? scenario : scenario.id;
        if (mode === 'edit') {
          update({ app: { scenarioId } });
        } else {
          update({ exe: { scenarioId } });
        }
      },

      loginUser: (userId: string) => update({ exe: { userId } }),

      toggleTreeItem: (id: string) => {
        const { treeState: oldTreeState } = states().app;
        const treeState = deepCopy(oldTreeState);
        if (treeState) {
          const ts = treeState[id];
          if (ts) treeState[id] = !ts;
          update({ app: { treeState } });
        }
      },
      selectInject: (inject: IInject | string) => {
        const { app, exe } = states();
        const isEditing = app.mode === 'edit';
        const iid = typeof inject === 'string' ? inject : inject.id;
        const injectId = isEditing ? app.injectId : exe.injectId;
        if (injectId === iid) return;
        isEditing ? update({ app: { injectId: iid } }) : update({ exe: { injectId: iid } });
      },
      createInject: async (inject: IInject) => {
        const { app, exe } = states();
        const isEditing = app.mode === 'edit';
        const trial = isEditing ? app.trial : exe.trial;
        const oldTrial = deepCopy(trial);
        if (!trial.injects) {
          trial.injects = [];
        }
        trial.injects.push(inject);
        if (isEditing) {
          await trialSvc.patch(trial, oldTrial);
          inject.type === InjectType.SCENARIO
            ? update({ app: { scenarioId: inject.id, trial } })
            : update({ app: { injectId: inject.id, trial } });
        } else {
          await runSvc.createInject(inject);
          update({ exe: { injectId: inject.id, trial } });
        }
      },
      createInjects: async (injects: IInject[]) => {
        const { app } = states();
        const trial = app.trial;
        const oldTrial = deepCopy(trial);
        if (!trial.injects) {
          trial.injects = [];
        }
        trial.injects.push(...injects);
        await trialSvc.patch(trial, oldTrial);
        update({ app: { trial } });
      },
      updateInject: async (inject: IInject) => {
        const { app, exe } = states();
        const isEditing = app.mode === 'edit';
        const trial = isEditing ? app.trial : exe.trial;
        const oldTrial = deepCopy(trial);
        trial.injects = trial.injects.map((i) => (i.id === inject.id ? deepCopy(inject) : i));
        if (isEditing) {
          await trialSvc.patch(trial, oldTrial);
          update({ app: { injectId: inject.id, trial } });
        } else {
          await runSvc.updateInject(inject);
        }
      },
      deleteInject: async (inject: IInject) => {
        const { app, exe } = states();
        const isEditing = app.mode === 'edit';
        const trial = isEditing ? app.trial : exe.trial;
        const oldTrial = deepCopy(trial);
        trial.injects = trial.injects.filter((s) => s.id !== inject.id);
        if (isEditing) {
          await trialSvc.patch(trial, oldTrial);
          update({ app: { injectId: '', trial } });
        } else {
          // TODO
          // await runSvc.
        }
      },
      moveInject: async (source: IInject, after: IInject) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        if (trial && trial.injects) {
          const sourceIndex = trial.injects.indexOf(source);
          const afterIndex = trial.injects.indexOf(after);
          arrayMove(trial.injects, sourceIndex, sourceIndex < afterIndex ? afterIndex : afterIndex + 1);
          await trialSvc.patch(trial, oldTrial);
        }
      },
      transitionInject: (st: IStateTransitionRequest) => runSvc.transition(st),
      updateMessageTopics: async (topics: IMessageTopic[]) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        trial.messageTopics = topics;
        await trialSvc.patch(trial, oldTrial);
        update({ app: { trial } });
      },

      selectAsset: (asset: IAsset) => update({ app: { assetId: asset.id } }),
      createAsset: async (asset: IAsset, files?: FileList) => {
        const { assets } = states().app;
        let fd = files ? files2formData(asset, files) : undefined;
        fd ? (fd = stripNamespaces(fd)) : undefined;
        const newAsset = await assetsSvc.create(asset, fd);
        if (newAsset && newAsset.filename) {
          newAsset.url = assetsSvc.url + newAsset.id;
        }
        if (newAsset) {
          assets.push(newAsset);
          update({ app: { assetId: newAsset.id, assets } });
        }
      },
      updateAsset: async (asset: IAsset, files?: FileList) => {
        const { assets } = states().app;
        let fd = files && files2formData(asset, files);
        fd ? (fd = stripNamespaces(fd)) : undefined;
        if (asset.filename) {
          asset.url = assetsSvc.url + asset.id;
        }
        await assetsSvc.update(asset, fd);
        const updated = assets.map((a) => (a.id === asset.id ? asset : a));
        update({ app: { assets: updated } });
      },
      deleteAsset: async (asset: IAsset) => {
        const { assets } = states().app;
        const updated = assets.filter((a) => a.id !== asset.id);
        await assetsSvc.del(asset.id);
        update({ app: { assets: updated } });
      },

      selectStakeholder: (stakeholder: IStakeholder) => update({ app: { stakeholderId: stakeholder.id } }),
      createStakeholder: async (stakeholder: IStakeholder) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        if (!trial.stakeholders) {
          trial.stakeholders = [];
        }
        trial.stakeholders.push(stakeholder);
        await trialSvc.patch(trial, oldTrial);
        update({ app: { stakeholderId: stakeholder.id, trial } });
      },
      updateStakeholder: async (stakeholder: IStakeholder) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        trial.stakeholders = trial.stakeholders.map((s) => (s.id === stakeholder.id ? deepCopy(stakeholder) : s));
        await trialSvc.patch(trial, oldTrial);
        update({ app: { stakeholderId: stakeholder.id, trial } });
      },
      deleteStakeholder: async (stakeholder: IStakeholder) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        trial.stakeholders = trial.stakeholders.filter((s) => s.id !== stakeholder.id);
        await trialSvc.patch(trial, oldTrial);
        update({ app: { stakeholderId: '', trial } });
      },

      selectObjective: (objective: IObjective) => update({ app: { objectiveId: objective.id } }),
      createObjective: async (objective: IObjective) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        if (!trial.objectives) {
          trial.objectives = [];
        }
        // console.table(trial.objectives);
        trial.objectives.push(objective);
        // console.table(trial.objectives);
        await trialSvc.patch(trial, oldTrial);
        // console.table(trial.objectives);
        update({ app: { objectiveId: objective.id, trial } });
      },
      updateObjective: async (objective: IObjective) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        trial.objectives = trial.objectives.map((s) => (s.id === objective.id ? deepCopy(objective) : s));
        await trialSvc.patch(trial, oldTrial);
        update({ app: { objectiveId: objective.id, trial } });
      },
      deleteObjective: async (objective: IObjective) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        trial.objectives = trial.objectives.filter((s) => s.id !== objective.id);
        await trialSvc.patch(trial, oldTrial);
        update({ app: { objectiveId: '', trial } });
      },

      updateSelectedMessageTypes: async (messageTypes: string[]) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        trial.selectedMessageTypes = messageTypes.map((msg: string) => {
          return {
            id: uniqueId(),
            name: msg,
            messageForm: msg,
            messageType: msg as MessageType,
            kafkaTopic: '',
            useNamespace: false,
            iconName: 'attach_file',
            useCustomGUI: false,
          };
        });
        await trialSvc.patch(trial, oldTrial);
        update({ app: { trial } });
      },

      selectUser: (user: IPerson) => update({ app: { userId: user.id } }),
      createUser: async (user: IPerson) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        if (!trial.users) {
          trial.users = [];
        }
        // console.table(trial.Users);
        trial.users.push(user);
        // console.table(trial.Users);
        await trialSvc.patch(trial, oldTrial);
        // console.table(trial.Users);
        update({ app: { userId: user.id, trial } });
      },
      updateUser: async (user: IPerson) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        trial.users = trial.users.map((s) => (s.id === user.id ? user : s));
        await trialSvc.patch(trial, oldTrial);
        update({ app: { userId: user.id, trial } });
      },
      deleteUser: async (user: IPerson) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        trial.users = trial.users.filter((s) => s.id !== user.id);
        await trialSvc.patch(trial, oldTrial);
        update({ app: { userId: '', trial } });
      },
      saveNewKafkaMessage: async (fn: string, tn: string) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        trial.selectedMessageTypes.push({ id: uniqueId(), name: fn, messageForm: fn, kafkaTopic: tn } as IKafkaMessage);
        await trialSvc.patch(trial, oldTrial);
        update({ app: { trial: trial } });
      },
      deleteKafkaMessage: async (entr: IKafkaMessage) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        trial.selectedMessageTypes.forEach((item, index) => {
          if (item === entr) trial.selectedMessageTypes.splice(index, 1);
        });
        await trialSvc.patch(trial, oldTrial);
        update({ app: { trial: trial } });
      },
      setPresetRole: (id: string) => {
        update({ exe: { userId: id } });
      },

      selectMessage: (msg: IKafkaMessage) => update({ app: { messageId: msg.id } }),
      createMessage: async (msg: IKafkaMessage) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        if (!trial.selectedMessageTypes) {
          trial.selectedMessageTypes = [];
        }
        // console.table(trial.Users);
        trial.selectedMessageTypes.push(msg);
        // console.table(trial.Users);
        await trialSvc.patch(trial, oldTrial);
        // console.table(trial.Users);
        update({ app: { messageId: msg.id, trial } });
      },
      updateMessage: async (msg: IKafkaMessage, files?: FileList) => {
        const asset = msg.asset;
        if (asset) {
          let fd = files && files2formData(asset, files);
          const newAsset = await assetsSvc.create(asset, fd);
          if (newAsset && newAsset.filename) {
            newAsset.url = assetsSvc.url + newAsset.id;
          }
          newAsset ? (msg.asset = newAsset) : undefined;
        }

        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        trial.selectedMessageTypes = trial.selectedMessageTypes.map((s) => (s.id === msg.id ? msg : s));
        await trialSvc.patch(trial, oldTrial);
        update({ app: { messageId: msg.id, trial } });
      },
      deleteMessage: async (msg: IKafkaMessage) => {
        if (msg.asset) {
          actions.deleteAsset(msg.asset);
        }
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        trial.selectedMessageTypes = trial.selectedMessageTypes.filter((s) => s.id !== msg.id);
        await trialSvc.patch(trial, oldTrial);
        update({ app: { messageId: '', trial } });
      },
    };
  },
} as IAppState;

const registerForTrialUpdates = (trialId: string, states: Stream<IAppModel>, update: UpdateStream) => {
  const socket = SocketSvc.socket;
  socket.on(trialId, async (patchObj: { id: string; patch: Operation[] }) => {
    const { id: senderId, patch } = patchObj;
    if (senderId === SocketSvc.socket.id) {
      return;
    }
    const {
      app: { trial: curTrial },
    } = states();
    console.log(`${socket.id} received message on channel ${curTrial.id} from ${senderId}:`);
    // console.log(JSON.stringify(patch, null, 2));
    const errors = applyPatch(curTrial, patch);

    if (errors && errors.length > 0 && errors[0] !== null) {
      console.error(`Error ${errors}:`);
      console.error(JSON.stringify(patch, null, 2));
    } else {
      update({ app: { trial: curTrial } });
    }
  });
};

const unregisterForTrialUpdates = (states: Stream<IAppModel>) => {
  const {
    app: { trial },
  } = states();
  const socket = SocketSvc.socket;
  if (socket.connected && trial) {
    socket.off(trial.id);
  }
};
