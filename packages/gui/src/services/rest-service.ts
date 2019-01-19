import m from 'mithril';
import { IChannelDefinition, messageBus } from './message-bus-service';
import { TopicNames } from '../models/channels';

const log = console.log;
const error = console.error;
const withCredentials = false;
const apiService = 'http://localhost:3000';

// export class RestService<T extends IBaseModel> {
export class RestService<T extends { id?: string }> {
  protected current: T = {} as T;
  protected list: T[] = [];
  protected baseUrl: string;
  protected channel: IChannelDefinition<{ list: T[] } | { cur: T; old: T }>;

  constructor(
    protected urlFragment: string,
    protected channelName?: string
  ) {
    this.baseUrl = `${apiService}/${urlFragment}/`;
    this.channel = messageBus.channel(channelName || urlFragment);
  }

  public getList() {
    return this.list;
  }

  public getCurrent() {
    return this.current;
  }

  public save(item: T) {
    return item.id ? this.update(item) : this.create(item);
  }

  public create(data: T) {
    log(`Creating...`);
    return m
      .request<T>({
        method: 'POST',
        url: this.baseUrl,
        data,
        withCredentials,
      })
      .then(result => {
        log(`Created with id: ${result.id}.`);
        this.setCurrent(result);
        this.addItemToList(this.current);
        return this.current;
      })
      .catch(err => error(err));
  }

  public update(data: T) {
    return m
      .request<T>({
        method: 'PUT',
        url: this.baseUrl + data.id,
        data,
        withCredentials,
      })
      .then(() => {
        // this.setCurrent(data);
        this.updateItemInList(data);
        return this.current;
      })
      .catch(err => error(err));
  }

  public delete(id = this.current.id) {
    return m
      .request<T>({
        method: 'DELETE',
        url: this.baseUrl + id,
        withCredentials,
      })
      .then(() => {
        log(`Deleted with id: ${id}.`);
        this.removeItemFromList(id);
      })
      .catch(err => error(err));
  }

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

  public new() {
    this.setCurrent({} as T);
    return this.current;
  }

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

  private removeItemFromList(id?: string) {
    this.setList([...this.list.filter(i => i.id !== id)]);
  }
}
