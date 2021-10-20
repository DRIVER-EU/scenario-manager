import { FactoryComponent } from 'mithril';
import Stream from 'mithril/stream';
import { merge } from '../utils/mergerino';
import { appStateMgmt, IApp, IAppStateActions, IAppStateModel, IExe, LoadGuiTemplates } from './states';

export interface IAppModel extends IAppStateModel {}

export interface IActions extends IAppStateActions {}

export type ModelUpdate = {
  app?: Partial<IApp> | (() => Partial<IApp>);
  exe?: Partial<IExe> | (() => Partial<IExe>);
};

// export type ModelUpdateFunction = IAppModel | ((model: IAppModel) => IAppModel);

export type UpdateStream = Stream<ModelUpdate>;

export type MeiosisComponent<T = {}> = FactoryComponent<{
  state: IAppModel;
  actions: IActions;
  options?: T;
}>;

export type MessageComponent<T = {}> = MeiosisComponent<{ editing?: boolean } & T>;

const app = {
  initial: Object.assign({}, appStateMgmt.initial) as IAppModel,
  actions: (update: UpdateStream, states: Stream<IAppModel>) =>
    Object.assign({}, appStateMgmt.actions(update, states)) as IActions,
  effects: (_update: UpdateStream, actions: IActions) => [LoadGuiTemplates(actions)],
};

const update: UpdateStream = Stream<ModelUpdate>();
export const states = Stream.scan(merge, app.initial, update);
export const actions = app.actions(update, states);
const effects = app.effects(update, actions);

states.map((state) => {
  effects.forEach((effect) => effect(state));
  // m.redraw();
});
