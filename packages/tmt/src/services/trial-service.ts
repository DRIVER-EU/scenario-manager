import { RestService, AssetService } from '.';
import { assetsChannel, ChannelNames, usersChannel, TopicNames, stakeholdersChannel, injectsChannel } from '../models';
import {
  IObjective,
  IPerson,
  IStakeholder,
  IInject,
  IAsset,
  ITrial,
  uniqueId,
  UserRole,
  InjectConditionType,
  InjectType,
} from 'trial-manager-models';
import { userRolesFilter, arrayMove, debounce } from '../utils';
import { OverlaySvc } from './overlay-service';

/**
 * The TrialService wraps common functionality needed
 * to CRUD a Trial with the server.
 * It also provides help functionality to parse the data.
 */
class TrialService extends RestService<ITrial> {
  private assetSvc?: AssetService;
  private debouncedSave: (trial: ITrial) => void;

  constructor() {
    super('trials', ChannelNames.SCENARIO);
    const save = async (t: ITrial) => {
      this.validateInjects();
      t.lastEdit = new Date();
      const trial = await super.save(t);
      if (trial && (!this.assetSvc || this.assetSvc.trialId !== trial.id)) {
        this.assetSvc = new AssetService(trial.id);
        return this.assetSvc.loadList();
      }
    };
    this.debouncedSave = debounce(save, 1000);
  }

  public async load(id: string): Promise<ITrial> {
    const s = await super.load(id);
    // s.startDate = s.startDate ? new Date(s.startDate) : new Date();
    // s.endDate = s.endDate ? new Date(s.endDate) : new Date();
    this.current = s;
    this.assetSvc = new AssetService(id);
    await this.assetSvc.loadList();
    return s;
  }

  public async saveTrial(s: ITrial = this.current) {
    this.debouncedSave(s);
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

  public async setObjectives(objectives?: IObjective[]) {
    if (this.current && objectives) {
      this.current.objectives = objectives;
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
      return [];
    }
    if (!this.current.users) {
      this.current.users = [];
    }
    return filter
      ? this.current.users.filter(u => u.name && u.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
      : this.current.users;
  }

  public getUsersByRole(role: UserRole) {
    return this.getUsers().filter(u => userRolesFilter(u, role));
  }

  public async createUser(user: IPerson) {
    const users = this.getUsers();
    if (users) {
      user.id = user.id || uniqueId();
      users.push(user);
    }
    // await this.saveTrial();
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

  public async moveInject(source: IInject, after: IInject) {
    if (this.current && this.current.injects) {
      const sourceIndex = this.current.injects.indexOf(source);
      const afterIndex = this.current.injects.indexOf(after);
      arrayMove(this.current.injects, sourceIndex, sourceIndex < afterIndex ? afterIndex : afterIndex + 1);
      await this.saveTrial();
    }
  }

  /** Create a new inject and save it */
  public async createInject(i: IInject) {
    this.newInject(i);
    await this.saveTrial();
    injectsChannel.publish(TopicNames.ITEM_CREATE, { cur: i });
    return i;
  }

  public newInject(i: IInject) {
    const injects = this.getInjects();
    if (injects) {
      i.id = i.id || uniqueId();
      injects.push(i);
    }
    return i;
  }

  /** Update an existing inject and save it */
  public async updateInject(i: IInject) {
    if (!i.id) {
      return this.createInject(i);
    }
    if (this.current) {
      this.current.injects = this.current.injects.map(s => (s.id === i.id ? i : s));
    }
    await this.saveTrial();
    injectsChannel.publish(TopicNames.ITEM_UPDATE, { cur: i });
  }

  /** Check whether the injects are still valid, e.g. after deleting an inject, a depending inject becomes invalid. */
  public validateInjects() {
    const invalidateParents = (parentId?: string) => {
      if (!parentId) {
        return;
      }
      injects.some(i => {
        if (i.id === parentId) {
          i.isValid = 'childInvalid';
          invalidateParents(i.parentId);
          return true;
        }
        return false;
      });
    };
    if (!this.current || !this.current.injects) {
      return true;
    }
    const injects = this.current.injects;
    const ids = injects.map(i => i.id);
    const errors = [] as string[];
    injects.forEach(i => {
      if (i.condition && i.condition.injectId && ids.indexOf(i.condition.injectId) === -1) {
        errors.push(`Inject ${i.title} depends on a non-existing condition.`);
        i.isValid = 'invalid';
        invalidateParents(i.parentId);
      } else if (
        i.condition &&
        !(i.type === InjectType.SCENARIO || i.condition.type === InjectConditionType.AT_TIME || i.condition.injectId)
      ) {
        errors.push(`Inject ${i.title} has not defined the inject it depends on.`);
        i.isValid = 'invalid';
      } else {
        i.isValid = 'valid';
      }
    });
    if (errors.length > 0) {
      M.toast({
        html: errors.join('<br>'),
        classes: 'red',
      });
      return false;
    }
    return true;
  }

  // Delete inject, including all children
  public canDeleteInject(i: IInject) {
    const injects = this.current ? this.current.injects : [];
    const findChildren = (inject: IInject) => injects.filter(s => s.parentId === inject.id);
    return findChildren(i).length === 0;
  }

  // Delete inject, including all children
  public async deleteInject(i: IInject) {
    if (!this.current) {
      return;
    }
    console.warn(this.current.injects.length);
    let injects = this.current.injects;
    const findChildren = (inject: IInject) => injects.filter(s => s.parentId === inject.id);
    const deleteOne = (inject: IInject) => {
      console.warn('Deleting: ' + inject.title);
      injects = injects.filter(s => s.id !== inject.id);
      findChildren(inject).forEach(deleteOne);
    };
    deleteOne(i);
    this.current.injects = injects;

    await this.saveTrial();
    injectsChannel.publish(TopicNames.ITEM_DELETE, { cur: i });
  }

  /* ASSETS */

  public async mapOverlays() {
    return this.assetSvc ? this.assetSvc.mapOverlays() || [] : ([] as IAsset[]);
  }

  public async loadMapOverlay(id: number | string) {
    return this.assetSvc && this.assetSvc.loadMapOverlay(id);
  }

  public async newAsset() {
    if (!this.current) {
      return;
    }
    assetsChannel.publish(TopicNames.ITEM_CREATE, {
      cur: { alias: 'New_asset' } as IAsset,
    });
  }

  /** Create or update an asset */
  public async saveAsset(asset?: IAsset, files?: FileList) {
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
    };
    if (!asset || !this.assetSvc) {
      return;
    }
    const fd = files2formData();
    const cur = await this.assetSvc.save(asset, fd);
    if (!cur) {
      return;
    }
    this.assetSvc.addUrl(cur);
    return cur;
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

  public overlayRename(oldName: string, newName: string) {
    return OverlaySvc.rename(oldName, newName);
  }

  public overlays() {
    return OverlaySvc.overlays();
  }

  public get bounds() {
    return OverlaySvc.bounds;
  }
}

export const TrialSvc = new TrialService();