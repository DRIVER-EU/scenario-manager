import m from 'mithril';
import { IChannelDefinition, messageBus } from './message-bus-service';
import { TopicNames } from '../models/channels';
import { IAsset } from '../models';

const log = console.log;
const error = console.error;
const withCredentials = false;
const apiService = 'http://localhost:3000';

// export class RestService<T extends IBaseModel> {
export class RestService<T extends { id?: string | number }> {
  protected current: T = {} as T;
  protected list: T[] = [];
  protected baseUrl: string;
  protected channel: IChannelDefinition<{ list: T[] } | { cur: T; old: T }>;

  constructor(protected urlFragment: string, protected channelName?: string) {
    this.baseUrl = `${apiService}/${urlFragment}/`;
    this.channel = messageBus.channel(channelName || urlFragment);
  }

  public getList() {
    return this.list;
  }

  public getCurrent() {
    return this.current;
  }

  public save(item: T, fd?: FormData) {
    return item.id ? this.update(item, fd) : this.create(item, fd);
  }

  public async create(item: T, fd?: FormData) {
    log(`Creating...`);
    try {
      const result = await m.request<T>({
        method: 'POST',
        url: this.baseUrl,
        data: fd || item,
        withCredentials,
      });
      log(`Created with id: ${result.id}.`);
      this.setCurrent(result);
      this.addItemToList(this.current);
      return this.current;
    } catch (err) {
      return error(err.message);
    }
  }

  public async update(item: T, fd?: FormData) {
    try {
      await m.request<T>({
        method: 'PUT',
        url: this.baseUrl + item.id,
        data: fd || item,
        withCredentials,
      });
      // this.setCurrent(data);
      this.current = item;
      this.updateItemInList(item);
      return this.current;
    } catch (err) {
      return error(err.message);
    }
  }

  public async delete(id = this.current.id) {
    try {
      await m.request<T>({
        method: 'DELETE',
        url: this.baseUrl + id,
        withCredentials,
      });
      log(`Deleted with id: ${id}.`);
      this.removeItemFromList(id);
    } catch (err) {
      return error(err.message);
    }
  }

  /*
    There must be a generic file upload function: when uploading a file, it will allow you to set an alias (no spaces).
    This alias can be used as a link, e.g. you could create an alias image1, and use it in a markdown file as follows:
    ![My image]({{image1}}).
   */

  // public uploadFiles(
  //   fl: FileList | undefined,
  //   cb: (item: { filename: string; size: number; mimetype: string; data: Blob }) => void
  // ) {
  //   if (!fl || fl.length === 0) {
  //     return;
  //   }
  //   log(`Uploading files...`);
  //   // tslint:disable-next-line:prefer-for-of
  //   for (let i = 0; i < fl.length; i++) {
  //     const file = fl[i];
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const data = reader.result as ArrayBuffer;
  //       const item = { filename: file.name, size: file.size, mimetype: file.type, data: new Blob([data]) };
  //       cb(item);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // }

  public unload() {
    if (this.current) {
      this.new();
    }
  }

  public load(id?: string) {
    return m
      .request<T>({
        method: 'GET',
        url: this.baseUrl + id,
        withCredentials,
      })
      .then(result => {
        log(result);
        this.setCurrent(result);
        this.updateItemInList(this.current);
        return this.current;
      });
  }

  public loadList() {
    return m
      .request<T[]>({
        method: 'GET',
        url: this.baseUrl,
        withCredentials,
      })
      .then(result => {
        // log(JSON.stringify(result, null, 2));
        log('loadList...');
        this.setList(result);
        return this.list;
      });
  }

  public loadListInScenario(id: string) {
    return m
      .request<T[]>({
        method: 'GET',
        url: this.baseUrl + `scenario/${id}`,
        withCredentials,
      })
      .then(result => {
        // log(JSON.stringify(result, null, 2));
        log('loadListInScenario...');
        this.setList(result);
        return this.list;
      });
  }

  public new(item?: T) {
    this.setCurrent(item || ({} as T));
    return this.current;
  }

  // protected async getAssets(id = this.current.id) {
  //   return m
  //     .request<IAsset[]>({
  //       method: 'GET',
  //       url: this.baseUrl + id + '/assets',
  //       withCredentials,
  //     })
  //     .then(result => {
  //       log(`Got assets.`);
  //       return result;
  //     })
  //     .catch(err => error(err));
  // }

  private setCurrent(value: T) {
    const old = this.current;
    this.current = value;
    this.channel.publish(TopicNames.ITEM_UPDATE, { old, cur: this.current });
  }

  private setList(value: T[]) {
    this.list = value;
    this.channel.publish(TopicNames.LIST_UPDATE, { list: this.list });
  }

  private addItemToList(item: T) {
    this.setList([...this.list, item]);
  }

  private updateItemInList(item: T) {
    this.setList(this.list.map(i => (i.id === item.id ? item : i)));
  }

  private removeItemFromList(id?: string | number) {
    this.setList([...this.list.filter(i => i.id !== id)]);
  }
}
