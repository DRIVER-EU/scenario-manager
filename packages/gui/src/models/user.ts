import m from 'mithril';

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
}

const log = console.log;
const error = console.error;

const baseUrl = 'https://rem-rest-api.herokuapp.com/api/users/';

export const User = {
  current: {} as IUser,
  create: () =>
    m
      .request<IUser>({
        method: 'POST',
        url: baseUrl,
        data: User.current,
        withCredentials: true,
      })
      .then((result) => {
        log(`Created user with id: ${result.id}.`);
        m.route.set('/list');
      })
      .catch((err) => error(err)),
  delete: (id: number) =>
    m
      .request<IUser>({
        method: 'DELETE',
        url: baseUrl + id,
        withCredentials: true,
      })
      .then(() => {
        log(`Deleted user with id: ${id}.`);
        m.route.set('/list');
      })
      .catch((err) => error(err)),
  list: [] as IUser[],
  load: (id: number) =>
    m
      .request<IUser>({
        method: 'GET',
        url: baseUrl + id,
        withCredentials: true,
      })
      .then((result) => {
        log(result);
        User.current = result;
      }),
  loadList: () =>
    m
      .request<{ data: IUser[] }>({
        method: 'GET',
        url: baseUrl + '?limit=50',
        // The limit is added as the REM service normally only returns 10 'things',
        // and when creating new 'things', I would like to see them
        withCredentials: true,
      })
      .then((result) => {
        User.list = result.data;
      }),
  new: () => (User.current = {} as IUser),
  save: () =>
    m.request<IUser>({
      method: 'PUT',
      url: baseUrl + User.current.id,
      data: User.current,
      withCredentials: true,
    }),
};
