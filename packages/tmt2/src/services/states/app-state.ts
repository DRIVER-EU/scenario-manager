import Stream from 'mithril/stream';
import { applyPatch, Operation } from 'rfc6902';
import { dashboardSvc, IRestService, restServiceFactory, SocketSvc } from '..';
import {
  deepCopy,
  IAsset,
  IInject,
  IInjectSimStates,
  IObjective,
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
  selectStakeholder: (stakeholder: IStakeholder) => void;
  createStakeholder: (stakeholder: IStakeholder) => Promise<void>;
  updateStakeholder: (stakeholder: IStakeholder) => Promise<void>;
  deleteStakeholder: (stakeholder: IStakeholder) => Promise<void>;
  selectObjective: (objective: IObjective) => void;
  createObjective: (objective: IObjective) => Promise<void>;
  updateObjective: (objective: IObjective) => Promise<void>;
  deleteObjective: (objective: IObjective) => Promise<void>;
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
          const assets = await assetsSvc.loadList();
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
