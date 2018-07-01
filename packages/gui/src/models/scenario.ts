import { BaseModel } from './base-model';

export interface IScenario {
  id: string;
  title: string;
  description?: string;
  startDate: number;
  endDate: number;
}

class ScenarioModel extends BaseModel<IScenario> {
  constructor() {
    super('http://localhost:3000/scenario/');
  }
}

export const Scenario = new ScenarioModel();

// import m from 'mithril';

// export interface IScenario {
//   id: string;
//   title: string;
//   description?: string;
//   startDate: number;
//   endDate: number;
// }

// const log = console.log;
// const error = console.error;

// const baseUrl = 'http://localhost:3000/scenario/';

// export const Scenario = {
//   current: {} as IScenario,
//   create: () =>
//     m
//       .request<IScenario>({
//         method: 'POST',
//         url: baseUrl,
//         data: Scenario.current,
//         withCredentials: true,
//       })
//       .then((result) => {
//         log(`Created scenario with id: ${result.id}.`);
//         m.route.set('/list');
//       })
//       .catch((err) => error(err)),
//   update: (id: string) =>
//     m
//       .request<IScenario>({
//         method: 'PUT',
//         url: baseUrl + id,
//         data: Scenario.current,
//         withCredentials: true,
//       })
//       .then((result) => {
//         log(`Updated scenario with id: ${result.id}.`);
//         m.route.set('/list');
//       })
//       .catch((err) => error(err)),
//   delete: (id: string) =>
//     m
//       .request<IScenario>({
//         method: 'DELETE',
//         url: baseUrl + id,
//         withCredentials: true,
//       })
//       .then(() => {
//         log(`Deleted user with id: ${id}.`);
//         m.route.set('/list');
//       })
//       .catch((err) => error(err)),
//   list: [] as IScenario[],
//   load: (id: number) =>
//     m
//       .request<IScenario>({
//         method: 'GET',
//         url: baseUrl + id,
//         withCredentials: true,
//       })
//       .then((result) => {
//         log(result);
//         Scenario.current = result;
//       }),
//   loadList: () =>
//     m
//       // .request<IScenario[]>({
//         method: 'GET',
//         url: baseUrl + '?limit=50',
//         // The limit is added as the REM service normally only returns 10 'things',
//         // and when creating new 'things', I would like to see them
//         // withCredentials: true,
//       })
//       .then((result) => {
//         // tslint:disable-next-line:no-debugger
//         Scenario.list = result;
//         log(Scenario.list);
//       }),
//   new: () => (Scenario.current = {} as IScenario),
//   save: () =>
//     m.request<IScenario>({
//       method: 'PUT',
//       url: baseUrl + Scenario.current.id,
//       data: Scenario.current,
//       withCredentials: true,
//     }),
// };
