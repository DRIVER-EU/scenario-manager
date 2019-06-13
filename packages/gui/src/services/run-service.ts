import m from 'mithril';
import { AppState } from '../models';
import { IStateTransitionRequest, ISessionMgmt } from 'trial-manager-models';

const withCredentials = false;

/**
 * The RunService is responsible for starting,
 * stopping, loading and unloading a Trial.
 */
class RunService {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = `${AppState.apiService()}/run/`;
  }

  /** Get the active trial */
  public async active() {
    return m.request<ISessionMgmt>({
      method: 'GET',
      url: this.baseUrl + 'active',
      withCredentials,
    });
  }

  /** Unload the active scenario */
  public async unload() {
    return m.request<void>({
      method: 'DELETE',
      url: this.baseUrl + 'unload',
      withCredentials,
    });
  }

  /** Load a new scenario: can only be done when no other scenario is loaded. */
  public async load(sm: ISessionMgmt) {
    return m.request<void>({
      method: 'POST',
      url: this.baseUrl + 'load',
      withCredentials,
      body: sm,
    });
  }

  /** Request a state transition. */
  public async transition(st: IStateTransitionRequest) {
    return m.request<boolean>({
      method: 'PUT',
      url: this.baseUrl + 'transition',
      withCredentials,
      body: st,
    });
  }
}

export const RunSvc = new RunService();
