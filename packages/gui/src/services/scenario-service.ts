import { RestService } from './rest-service';
import { ChannelNames, usersChannel, TopicNames, stakeholdersChannel } from '../models/channels';
import { IScenario } from '../models/scenario';
import { IObjective, IPerson, IStakeholder } from '../models';
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

  /** USERS */

  /** Get a user by ID */
  public getUserById(id: string) {
    const users = this.getUsers();
    return users ? users.filter(u => u.id === id).shift() : undefined;
  }

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
      this.current.stakeholders.forEach(s => {
        if (s.contactIds) {
          s.contactIds = s.contactIds.filter(id => id !== user.id);
        }
      });
    }
    await this.saveScenario();
    usersChannel.publish(TopicNames.ITEM_DELETE, { cur: user });
  }

  public userRoleToString = (role: UserRole) => {
    switch (role) {
      default:
        return UserRole[role];
      case UserRole.ROLE_PLAYER:
        return 'ROLE PLAYER';
    }
  }

  public userIcon = (user: IPerson) => {
    switch (user.role) {
      default:
        return 'person';
      case UserRole.ROLE_PLAYER:
        return 'record_voice_over';
      case UserRole.ADMIN:
        return 'supervisor_account';
    }
  }

  /** STAKEHOLDERS */

  /** Get all contacts (or filter by name) */
  public getStakeholders(filter?: string) {
    if (!this.current) {
      return undefined;
    }
    if (!this.current.stakeholders) {
      this.current.stakeholders = [];
    }
    return filter
      ? this.current.stakeholders.filter(s => s.name && s.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
      : this.current.stakeholders;
  }

  public async createStakeholder(sh: IStakeholder) {
    const stakeholders = this.getStakeholders();
    if (stakeholders) {
      sh.id = sh.id || uniqueId();
      stakeholders.push(sh);
    }
    await this.saveScenario();
    stakeholdersChannel.publish(TopicNames.ITEM_CREATE, { cur: sh });
  }

  public async updateStakeholder(sh: IStakeholder) {
    if (this.current) {
      this.current.stakeholders = this.current.stakeholders.map(s => (s.id === sh.id ? sh : s));
    }
    await this.saveScenario();
    stakeholdersChannel.publish(TopicNames.ITEM_UPDATE, { cur: sh });
  }

  public async deleteStakeholder(sh: IStakeholder) {
    if (this.current) {
      this.current.stakeholders = this.current.stakeholders.filter(s => s.id !== sh.id);
      this.current.objectives.forEach(s => {
        if (s.stakeholderIds) {
          s.stakeholderIds = s.stakeholderIds.filter(id => id !== sh.id);
        }
      });
    }
    await this.saveScenario();
    stakeholdersChannel.publish(TopicNames.ITEM_DELETE, { cur: sh });
  }
}

export const ScenarioSvc = new ScenarioService();
