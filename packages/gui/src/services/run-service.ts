import m from 'mithril';
import { AppState } from '../models';
import { IStateTransitionRequest, ISessionMessage, ITestbedSessionMessage } from 'trial-manager-models';

const withCredentials = false;

class RunService {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = `${AppState.apiService}/run/`;
  }

  /** Get the active trial */
  public async active() {
    return m.request<ISessionMessage>({
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
  public async load(sm: ITestbedSessionMessage) {
    return m.request<void>({
      method: 'POST',
      url: this.baseUrl + 'load',
      withCredentials,
      data: sm,
    });
  }

  /** Request a state transition. */
  public async transition(st: IStateTransitionRequest) {
    return m.request<boolean>({
      method: 'PUT',
      url: this.baseUrl + 'transition',
      withCredentials,
      data: st,
    });
  }
}

export const RunSvc = new RunService();
