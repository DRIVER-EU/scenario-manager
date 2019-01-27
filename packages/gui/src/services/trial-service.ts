import { RestService, AssetService } from '.';
import {
  IObjective,
  IPerson,
  IStakeholder,
  IInject,
  IAsset,
  assetsChannel,
  ChannelNames,
  usersChannel,
  TopicNames,
  stakeholdersChannel,
  injectsChannel,
  ITrial,
  UserRole,
} from '../models';
import { uniqueId } from '../utils';

class TrialService extends RestService<ITrial> {
  private assetSvc?: AssetService;

  constructor() {
    super('trials', ChannelNames.SCENARIO);
  }

  public load(id: string): Promise<ITrial> {
    return super.load(id).then(async s => {
      s.startDate = s.startDate ? new Date(s.startDate) : new Date();
      s.endDate = s.endDate ? new Date(s.endDate) : new Date();
      this.current = s;
      this.assetSvc = new AssetService(id);
      await this.assetSvc.loadList();
      return s;
    });
  }

  public async saveTrial(s: ITrial = this.current) {
    s.updatedDate = new Date();
    return super.save(s);
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
    await this.saveTrial();
  }

  public async updateObjective(objective: IObjective) {
    if (this.current) {
      this.current.objectives = this.current.objectives.map(o => (o.id === objective.id ? objective : o));
    }
    await this.saveTrial();
  }

  public async deleteObjective(objective: IObjective) {
    if (this.current) {
      this.current.objectives = this.current.objectives.filter(o => o.id !== objective.id);
    }
    await this.saveTrial();
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
    await this.saveTrial();
    usersChannel.publish(TopicNames.ITEM_CREATE, { cur: user });
  }

  public async updateUser(user: IPerson) {
    if (this.current) {
      this.current.users = this.current.users.map(u => (u.id === user.id ? user : u));
    }
    await this.saveTrial();
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
    await this.saveTrial();
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
    await this.saveTrial();
    stakeholdersChannel.publish(TopicNames.ITEM_CREATE, { cur: sh });
  }

  public async updateStakeholder(sh: IStakeholder) {
    if (this.current) {
      this.current.stakeholders = this.current.stakeholders.map(s => (s.id === sh.id ? sh : s));
    }
    await this.saveTrial();
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
    await this.saveTrial();
    stakeholdersChannel.publish(TopicNames.ITEM_DELETE, { cur: sh });
  }

  /** INJECTS */

  /** Get all injects (or filter by name) */
  public getInjects(filter?: string) {
    if (!this.current) {
      return undefined;
    }
    if (!this.current.injects) {
      this.current.injects = [];
    }
    return filter
      ? this.current.injects.filter(s => s.title && s.title.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
      : this.current.injects;
  }

  public async createInject(i: IInject) {
    const injects = this.getInjects();
    if (injects) {
      i.id = i.id || uniqueId();
      injects.push(i);
    }
    await this.saveTrial();
    injectsChannel.publish(TopicNames.ITEM_CREATE, { cur: i });
  }

  public async updateInject(i: IInject) {
    if (this.current) {
      this.current.injects = this.current.injects.map(s => (s.id === i.id ? i : s));
    }
    await this.saveTrial();
    injectsChannel.publish(TopicNames.ITEM_UPDATE, { cur: i });
  }

  // TODO Delete inject, including all children
  public async deleteInject(i: IInject) {
    if (this.current) {
      this.current.injects = this.current.injects.filter(s => s.id !== i.id);
      // this.current.objectives.forEach(s => {
      //   if (s.stakeholderIds) {
      //     s.stakeholderIds = s.stakeholderIds.filter(id => id !== i.id);
      //   }
      // });
    }
    await this.saveTrial();
    injectsChannel.publish(TopicNames.ITEM_DELETE, { cur: i });
  }

  /* ASSETS */

  public async newAsset() {
    if (!this.current) {
      return;
    }
    assetsChannel.publish(TopicNames.ITEM_CREATE, { cur: { alias: 'New asset' } as IAsset });
  }

  /** Create or update an asset */
  public async saveAsset(asset: IAsset, fd?: FormData) {
    if (!asset || !this.assetSvc) {
      return;
    }
    const cur = await this.assetSvc.save(asset, fd);
    if (!cur) { return; }
    this.assetSvc.addUrl(cur);
    assetsChannel.publish(TopicNames.ITEM_UPDATE, { cur });
  }

  /** Delete an asset */
  public async deleteAsset(asset: IAsset | undefined) {
    if (!asset || !this.assetSvc) {
      return;
    }
    await this.assetSvc.delete(asset.id);
    assetsChannel.publish(TopicNames.ITEM_DELETE, { cur: asset });
  }

  public get assets() {
    return this.assetSvc ? this.assetSvc.getList() : [];
  }

  public get curAsset() {
    return this.assetSvc ? this.assetSvc.getCurrent() : {};
  }
}

export const TrialSvc = new TrialService();
