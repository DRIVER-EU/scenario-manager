import { RestService } from './rest-service';
import { ChannelNames, usersChannel, TopicNames } from '../models/channels';
import { IScenario } from '../models/scenario';
import { IObjective, IPerson } from '../models';
import { uniqueId } from '../utils';
import { UserRole } from '../models/user-role';

class ScenarioService extends RestService<IScenario> {
  constructor() {
    super('scenarios', ChannelNames.SCENARIO);
  }

  public load(id?: string): Promise<IScenario> {
    return super.load(id).then(s => {
      s.startDate = s.startDate ? new Date(s.startDate) : new Date();
      s.endDate = s.endDate ? new Date(s.endDate) : new Date();
      this.current = s;
      return s;
    });
  }

  public async saveScenario(s: IScenario = this.current) {
    s.updatedDate = new Date();
    super.save(s);
  }

  /** OBJECTIVES */

  public getObjectives() {
    if (!this.current) {
      return undefined;
    }
    if (!this.current.objectives) {
      this.current.objectives = [];
    }
    return this.current.objectives;
  }

  public async createObjective(objective: IObjective) {
    const objectives = this.getObjectives();
    if (objectives) {
      objective.id = uniqueId();
      objectives.push(objective);
    }
    await this.saveScenario();
  }

  public async updateObjective(objective: IObjective) {
    if (this.current) {
      this.current.objectives = this.current.objectives.map(o => (o.id === objective.id ? objective : o));
    }
    await this.saveScenario();
  }

  public async deleteObjective(objective: IObjective) {
    if (this.current) {
      this.current.objectives = this.current.objectives.filter(o => o.id !== objective.id);
    }
    await this.saveScenario();
  }

  /** CONTACTS */

  /** Get all contacts (or filter by name) */
  public getUsers(filter?: string) {
    if (!this.current) {
      return undefined;
    }
    if (!this.current.users) {
      this.current.users = [];
    }
    return filter
      ? this.current.users.filter(u => u.name && u.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
      : this.current.users;
  }

  public async createUser(user: IPerson) {
    const users = this.getUsers();
    if (users) {
      user.id = user.id || uniqueId();
      users.push(user);
    }
    await this.saveScenario();
    usersChannel.publish(TopicNames.ITEM_CREATE, { cur: user });
  }

  public async updateUser(user: IPerson) {
    if (this.current) {
      this.current.users = this.current.users.map(u => (u.id === user.id ? user : u));
    }
    await this.saveScenario();
    usersChannel.publish(TopicNames.ITEM_UPDATE, { cur: user });
  }

  public async deleteUser(user: IPerson) {
    if (this.current) {
      this.current.users = this.current.users.filter(u => u.id !== user.id);
    }
    await this.saveScenario();
    usersChannel.publish(TopicNames.ITEM_DELETE, { cur: user });
  }

  public userRoleToString = (role: UserRole) => {
    switch (role) {
      default: return UserRole[role];
      case UserRole.ROLE_PLAYER: return 'ROLE PLAYER';
    }
  }

  public userIcon = (user: IPerson) => {
    switch (user.role) {
      default: return 'person';
      case UserRole.ROLE_PLAYER: return 'record_voice_over';
      case UserRole.ADMIN: return 'supervisor_account';
    }
  }
}

export const ScenarioSvc = new ScenarioService();
