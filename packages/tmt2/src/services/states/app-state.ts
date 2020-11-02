import Stream from 'mithril/stream';
import { applyPatch, Operation } from 'rfc6902';
import { dashboardSvc, IRestService, restServiceFactory, SocketSvc } from '..';
import {
  deepCopy,
  IAsset,
  IInject,
  IInjectSimStates,
  IObjective,
  IPerson,
  ISessionManagement,
  IStakeholder,
  ITimeManagement,
  ITrial,
} from '../../../../models/dist';
import { Dashboards } from '../../models';
import { validateInjects } from '../../utils';
import { IAppModel, UpdateStream } from '../meiosis';

const trialSvc = restServiceFactory<ITrial>('trials');
let assetsSvc: IRestService<IAsset>;

/** Application state */
export interface IAppStateModel {
  app: {
    apiService: string;
    isSearching: boolean;
    searchQuery?: string;
    page?: Dashboards;

    /** Overview of all trials */
    trials: ITrial[];
    /** Active trial */
    trial: ITrial;
    /** Currently selected stakeholder ID */
    stakeholderId: string;
    /** Currently selected objective ID */
    objectiveId: string;
    /** Currently selected user ID */
    userId: string;
    /** Currently selected user ID */
    assetId: number;
    assets: IAsset[];
    owner: string;
    time: ITimeManagement;
    sessionControl: {
      isConnected: boolean;
      activeSession: boolean;
      realtime: boolean;
      host: string;
    };
    scenarioStartTime: Date;
    session: Partial<ISessionManagement>;
    scenarioId: '';
    injectStates: IInjectSimStates;
    copiedInjectIsCut: boolean;
    copiedInjects: undefined | IInject | IInject[];
  };
}

export interface IAppStateActions {
  search: (isSearching: boolean, searchQuery?: string) => void;
  changePage: (
    page: Dashboards,
    params?: { [key: string]: string | number | undefined },
    query?: { [key: string]: string | number | undefined }
  ) => void;

  loadTrials: () => Promise<void>;
  loadTrial: (trialId: string) => Promise<void>;
  saveTrial: (trial?: ITrial) => Promise<void>;
  deleteTrial: (trialId: string | number) => Promise<void>;

  selectAsset: (asset: IAsset) => void;
  createAsset: (asset: IAsset) => Promise<void>;
  updateAsset: (asset: IAsset, files: FileList) => Promise<void>;
  deleteAsset: (asset: IAsset) => Promise<void>;

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

export const appStateMgmt = {
  initial: {
    app: {
      /** During development, use this URL to access the server. */
      apiService: process.env.SERVER || location.origin,
      isSearching: false,
      searchQuery: '',

      trials: [],
      trial: {} as ITrial,
      stakeholderId: '',
      objectiveId: '',
      userId: '',
      assetId: -1,
      assets: [],
      owner: 'TB_TrialMgmt',
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
      scenarioId: '',
      injectStates: {} as IInjectSimStates,
      copiedInjectIsCut: false,
      copiedInjects: undefined as undefined | IInject | IInject[],
    },
  },

  actions: (update, states) => {
    return {
      search: (isSearching: boolean, searchQuery?: string) => update({ app: { isSearching, searchQuery } }),
      changePage: (page, params, query) => {
        dashboardSvc.switchTo(page, params, query);
        update({ app: { page } });
      },

      loadTrials: async () => {
        const trials = await trialSvc.loadList();
        update({ app: { trials } });
      },
      loadTrial: async (trialId: string) => {
        unregisterForTrialUpdates(states);
        const trial = await trialSvc.load(trialId);
        if (trial) {
          registerForTrialUpdates(trial.id, states, update);
          assetsSvc = restServiceFactory<IAsset>(`trials/${trial.id}/assets`);
          const assets = (await assetsSvc.loadList()).map((a) => ({
            ...a,
            url: a.filename ? assetsSvc.url + a.id : undefined,
          }));
          update({ app: { trial, assets } });
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
        update({ app: { trial } });
        // if (trial && (!this.assetSvc || this.assetSvc.trialId !== trial.id)) {
        //   this.assetSvc = new AssetService(trial.id);
        //   return this.assetSvc.loadList();
        // }
      },
      deleteTrial: async (trialId: string | number) => {
        await trialSvc.del(trialId);
      },

      selectAsset: (asset: IAsset) => update({ app: { assetId: asset.id } }),
      createAsset: async (asset: IAsset) => {
        const { assets } = states().app;
        const newAsset = await assetsSvc.create(asset);
        if (newAsset) {
          assets.push(newAsset);
          update({ app: { assetId: newAsset.id, assets } });
        }
      },
      updateAsset: async (asset: IAsset, files: FileList) => {
        const files2formData = () => {
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

        const { assets } = states().app;
        const fd = files2formData();
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
        trial.stakeholders = trial.stakeholders.map((s) => (s.id === stakeholder.id ? stakeholder : s));
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
        trial.objectives = trial.objectives.map((s) => (s.id === objective.id ? objective : s));
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
      createUser: async (User: IPerson) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        if (!trial.users) {
          trial.users = [];
        }
        // console.table(trial.Users);
        trial.users.push(User);
        // console.table(trial.Users);
        await trialSvc.patch(trial, oldTrial);
        // console.table(trial.Users);
        update({ app: { UserId: User.id, trial } });
      },
      updateUser: async (User: IPerson) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        trial.users = trial.users.map((s) => (s.id === User.id ? User : s));
        await trialSvc.patch(trial, oldTrial);
        update({ app: { UserId: User.id, trial } });
      },
      deleteUser: async (User: IPerson) => {
        const { trial } = states().app;
        const oldTrial = deepCopy(trial);
        trial.users = trial.users.filter((s) => s.id !== User.id);
        await trialSvc.patch(trial, oldTrial);
        update({ app: { UserId: '', trial } });
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
