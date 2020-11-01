import m from 'mithril';
import { IStateTransitionRequest, ISessionManagement, IInject, ITrial, uniqueId, UserRole } from '../../../models';
import { userRolesFilter } from '../utils';

const withCredentials = false;

/**
 * The RunService is responsible for starting,
 * stopping, loading and unloading a Trial.
 */
class RunService {
  protected baseUrl!: string;
  private trial = {} as ITrial;
  private urlFragment = 'run';

  constructor() {
    this.updateBaseUrl(process.env.SERVER || location.origin);
  }

  public getInjects() {
    return this.trial.injects || [];
  }

  /** Get the active session */
  public async activeSession() {
    return m
      .request<ISessionManagement>({
        method: 'GET',
        url: this.baseUrl + 'active',
        withCredentials,
      })
      .catch(console.error);
  }

  /** Get the active, executing, scenario */
  public async activeTrial() {
    const result = await m
      .request<ITrial>({
        method: 'GET',
        url: this.baseUrl + 'trial',
        withCredentials,
      })
      .catch(console.error);
    this.trial = result || ({} as ITrial);
    return this.trial;
  }

  public newInjectReceived(i: IInject) {
    const injects = this.getInjects();
    if (injects) {
      i.id = i.id || uniqueId();
      injects.push(i);
    }
    return i;
  }

  /** Get all contacts (or filter by name) */
  public getUsers(filter?: string) {
    if (!this.trial) {
      return [];
    }
    if (!this.trial.users) {
      this.trial.users = [];
    }
    return filter
      ? this.trial.users.filter((u) => u.name && u.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
      : this.trial.users;
  }

  public getUsersByRole(role: UserRole) {
    return this.getUsers().filter((u) => userRolesFilter(u, role));
  }

  /** Update an existing inject and save it */
  public async updatedInjectReceived(i: IInject) {
    if (!i.id) {
      return this.createInject(i);
    }
    if (this.trial) {
      this.trial.injects = this.getInjects().map((s) => (s.id === i.id ? i : s));
    }
    // await this.saveTrial();
    // injectsChannel.publish(TopicNames.ITEM_UPDATE, { cur: i });
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
  public async load(body: ISessionManagement) {
    return m.request<void>({
      method: 'POST',
      url: this.baseUrl + 'load',
      withCredentials,
      body,
    });
  }

  /** Update an inject */
  public async updateInject(body: IInject) {
    return m.request<void>({
      method: 'PUT',
      url: this.baseUrl + 'update',
      withCredentials,
      body,
    });
  }

  /** Update an inject */
  public async createInject(body: IInject) {
    return m.request<void>({
      method: 'POST',
      url: this.baseUrl + 'create',
      withCredentials,
      body,
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

  /** Create the base URL, either using the apiService or the apiDevService */
  private updateBaseUrl(apiService: string) {
    this.baseUrl = `${apiService}/${this.urlFragment}/`;
  }
}

export const RunSvc = new RunService();
