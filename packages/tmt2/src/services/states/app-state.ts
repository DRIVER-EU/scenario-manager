import Stream from 'mithril/stream';
import { applyPatch, Operation } from 'rfc6902';
import { IRestService, restServiceFactory, SocketSvc } from '..';
import {
  deepCopy,
  IAsset,
  IExecutingInject,
  IInject,
  IInjectSimStates,
  InjectType,
  IObjective,
  IPerson,
  IScenario,
  ISessionManagement,
  IStakeholder,
  ITimeManagement,
  ITrial,
  SessionState,
} from '../../../../models/dist';
import { MessageScope } from '../../components/messages';
import { arrayMove, getInjects, isScenario, validateInjects } from '../../utils';
import { IAppModel, UpdateStream } from '../meiosis';
import { RunSvc } from '../run-service';
import { ISessionControl } from '../../models';

const trialSvc = restServiceFactory<ITrial>('trials');
let assetsSvc: IRestService<IAsset>;

export interface IActiveTrial {
  trial: ITrial;
  scenarioId: string;
  injectId: string;
  treeState: {
    [id: string]: boolean;
  };
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
}

export interface IExe extends IActiveTrial {
  /** Executing trial */
  trial: ITrial;
  /** Executing scenario ID */
  scenarioId: string;
  /** Currently selected inject ID */
  injectId: string;
  injectStates: IInjectSimStates;
  time: ITimeManagement;
  sessionControl: ISessionControl;
  scenarioStartTime: Date;
  session: Partial<ISessionManagement>;
}

/** Application state */
export interface IAppStateModel {
  app: IApp;
  exe: IExe;
}

export interface IAppStateActions {
  /** Pass-through to update function */
  update: (state: Partial<IAppModel>) => void;

  setEditMode: (editing: boolean) => void;
  setInjectStates: (injectStates: IInjectSimStates) => void;
  updateExecutingInject: (inject: IExecutingInject) => Promise<void>;
  updateSession: (s?: Partial<ISessionManagement>) => Promise<void>;
  updateSessionControl: (sessionControl: ISessionControl) => void;
  startSession: (session: ISessionManagement) => Promise<void>;
  stopSession: () => Promise<void>;

  toggleTreeItem: (id: string) => void;

  loadTrials: () => Promise<void>;
  loadTrial: (trialId: string, mode?: MessageScope) => Promise<void>;
  saveTrial: (trial?: ITrial) => Promise<void>;
  deleteTrial: (trialId: string | number) => Promise<void>;

  selectAsset: (asset: IAsset) => void;
  createAsset: (asset: IAsset, files?: FileList) => Promise<void>;
  updateAsset: (asset: IAsset, files: FileList) => Promise<void>;
  deleteAsset: (asset: IAsset) => Promise<void>;

  selectScenario: (scenario: IInject | string) => void;

  selectInject: (inject: IInject) => void;
  createInject: (inject: IInject) => Promise<void>;
  updateInject: (inject: IInject) => Promise<void>;
  deleteInject: (inject: IInject) => Promise<void>;
  moveInject: (source: IInject, target: IInject) => Promise<void>;

  selectStakeholder: (stakeholder: IStakeholder) => void;
  createStakeholder: (stakeholder: IStakeholder) => Promise<void>;
  updateStakeholder: (stakeholder: IStakeholder) => Promise<void>;
  deleteStakeholder: (stakeholder: IStakeholder) => Promise<void>;

  selectObjective: (objective: IObjective) => void;
  createObjective: (objective: IObjective) => Promise<void>;
  updateObjective: (objective: IObjective) => Promise<void>;
  deleteObjective: (objective: IObjective) => Promise<void>;

  selectUser: (user: IPerson) => void;
  createUser: (user: IPerson) => Promise<void>;
  updateUser: (user: IPerson) => Promise<void>;
  deleteUser: (user: IPerson) => Promise<void>;
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
    },
    exe: {
      trial: {} as ITrial,
      scenarioId: '',
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
        await RunSvc.updateInject(inject);
      },
      updateSessionControl: (sessionControl: ISessionControl) => update({ exe: { sessionControl } }),
      updateSession: async (s?: Partial<ISessionManagement>) => {
        const { trial } = states().app;
        const t = await RunSvc.activeTrial();
        const session = await RunSvc.activeSession();
        if (session && (session.state === SessionState.Started || session.state === SessionState.Initializing)) {
          const scenarioId = session.tags ? session.tags.scenarioId : undefined;
          const scenario = getInjects(trial)
            .filter((i) => i.id === scenarioId)
            .shift() as IScenario;
          const scenarioStartTime = scenario && scenario.startDate ? new Date(scenario.startDate) : new Date();
          update({ exe: { session, trial: t || trial, scenarioStartTime } });
        } else if (s) {
          // Either no session, or not active, so create a new session
          update({ exe: { session: s } });
        }
      },
      startSession: async (session: ISessionManagement) => {
        await RunSvc.load(session);
        update({
          exe: {
            session: session,
            sessionControl: { activeSession: session.state === SessionState.Started } as ISessionControl,
          },
        });
      },
      stopSession: async () => {
        await RunSvc.unload();
        const session = await RunSvc.activeSession();
        if (session) {
          update({
            exe: {
              session,
              sessionControl: { activeSession: session.state === SessionState.Started } as ISessionControl,
            },
          });
        }
      },

      loadTrials: async () => {
        const trials = await trialSvc.loadList();
        update({ app: { trials } });
      },
      loadTrial: async (trialId: string, mode: MessageScope = 'edit') => {
        unregisterForTrialUpdates(states);
        const trial = await trialSvc.load(trialId);
        if (trial) {
          registerForTrialUpdates(trial.id, states, update);
          assetsSvc = restServiceFactory<IAsset>(`trials/${trial.id}/assets`);
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

          if (mode === 'edit') {
            update({ app: { trial, assets, scenarioId: scenario?.id, mode, treeState } });
          } else {
            update({ exe: { trial, scenarioId: scenario?.id, session: {}, treeState }, app: { assets, mode } });
          }
        }
      },
      saveTrial: async (newTrial?: ITrial) => {
        const {
          app: { trial: s },
        } = states();
        const t = newTrial || s;
        console.log('Saving trial at ' + Date.now());
        validateInjects(t);
        t.lastEdit = new Date();
        const trial = await trialSvc.save(t);
        if (trial) update({ app: { trial } });
        // if (trial && (!this.assetSvc || this.assetSvc.trialId !== trial.id)) {
        //   this.assetSvc = new AssetService(trial.id);
        //   return this.assetSvc.loadList();
        // }
      },
      deleteTrial: async (trialId: string | number) => {
        await trialSvc.del(trialId);
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

      toggleTreeItem: (id: string) => {
        const { treeState: oldTreeState } = states().app;
        const treeState = deepCopy(oldTreeState);
        if (treeState) {
          const ts = treeState[id];
          if (ts) treeState[id] = !ts;
          update({ app: { treeState } });
        }
      },
      selectInject: (inject: IInject) => {
        const { app, exe } = states();
        const isEditing = app.mode === 'edit';
        const injectId = isEditing ? app.injectId : exe.injectId;
        if (injectId === inject.id) return;
        isEditing ? update({ app: { injectId: inject.id } }) : update({ exe: { injectId: inject.id } });
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
          await RunSvc.createInject(inject);
          update({ exe: { injectId: inject.id, trial } });
        }
      },
      updateInject: async (inject: IInject) => {
        const { app, exe } = states();
        const isEditing = app.mode === 'edit';
        const trial = isEditing ? app.trial : exe.trial;
        const oldTrial = deepCopy(trial);
        trial.injects = trial.injects.map((s) => (s.id === inject.id ? deepCopy(inject) : s));
        if (isEditing) {
          await trialSvc.patch(trial, oldTrial);
          update({ app: { injectId: inject.id, trial } });
        } else {
          await RunSvc.updateInject(inject);
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
          // await RunSvc.
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

      selectAsset: (asset: IAsset) => update({ app: { assetId: asset.id } }),
      createAsset: async (asset: IAsset, files?: FileList) => {
        const { assets } = states().app;
        const fd = files ? files2formData(asset, files) : undefined;
        const newAsset = await assetsSvc.create(asset, fd);
        if (newAsset && newAsset.filename) {
          newAsset.url = assetsSvc.url + newAsset.id;
        }
        if (newAsset) {
          assets.push(newAsset);
          update({ app: { assetId: newAsset.id, assets } });
        }
      },
      updateAsset: async (asset: IAsset, files: FileList) => {
        const { assets } = states().app;
        const fd = files2formData(asset, files);
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
    };
  },
} as IAppState;

const registerForTrialUpdates = (trialId: string, states: Stream<IAppModel>, update: UpdateStream) => {
  console.log('Registering for trial updates');
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
    console.log(JSON.stringify(patch, null, 2));
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
