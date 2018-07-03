import m from 'mithril';

export interface IBaseModel {
  id: string;
  title: string;
  description?: string;
  startDate: number;
  endDate: number;
}

const log = console.log;
const error = console.error;
const withCredentials = false;

export class BaseModel<T extends IBaseModel> {
  public list = [] as T[];
  public current = {} as T;

  public constructor(protected baseUrl: string) {}

  public create() {
    log(`Creating...`);
    return m
      .request<T>({
        method: 'POST',
        url: this.baseUrl,
        data: this.current,
        withCredentials,
      })
      .then((result) => {
        log(`Created with id: ${result.id}.`);
      })
      .catch((err) => error(err));
  }

  public update(id: string) {
    return m
      .request<T>({
        method: 'PUT',
        url: this.baseUrl + id,
        data: this.current,
        withCredentials,
      })
      .then((result) => {
        log(`Updated with id: ${result.id}.`);
        m.route.set('/list');
      })
      .catch((err) => error(err));
  }

  public delete(id: string) {
    return m
      .request<T>({
        method: 'DELETE',
        url: this.baseUrl + id,
        withCredentials,
      })
      .then(() => {
        log(`Deleted with id: ${id}.`);
        m.route.set('/list');
      })
      .catch((err) => error(err));
  }

  public load(id: number) {
    return m
      .request<T>({
        method: 'GET',
        url: this.baseUrl + id,
        withCredentials,
      })
      .then((result) => {
        log(result);
        this.current = result;
      });
  }

  public loadList() {
    return m
      .request<T[]>({
        method: 'GET',
        url: this.baseUrl,
        withCredentials,
      })
      .then((result) => {
        log(JSON.stringify(result, null, 2));
        this.list = result;
      });
  }

  public new() {
    this.current = {} as T;
  }

  public save() {
    log(`Saving...`);
    return m.request<T>({
      method: 'PUT',
      url: this.baseUrl + this.current.id,
      data: this.current,
      withCredentials,
    });
  }
}
