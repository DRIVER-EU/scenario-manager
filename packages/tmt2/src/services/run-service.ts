import m from 'mithril';
import { IStateTransitionRequest, ISessionManagement, IInject, ITrial } from '../../../models';

const withCredentials = false;

export const runServiceFactory = (apiService: string) => {
  const url = `${apiService}/run/`;

  const activeSession = async () =>
    m
      .request<ISessionManagement>({
        method: 'GET',
        url: url + 'active',
        withCredentials,
      })
      .catch(console.error);

  const activeTrial = () =>
    m
      .request<ITrial>({
        method: 'GET',
        url: url + 'trial',
        withCredentials,
      })
      .catch(console.error);

  const load = (body: ISessionManagement) =>
    m.request<void>({
      method: 'POST',
      url: url + 'load',
      withCredentials,
      body,
    });

  const unload = () =>
    m.request<void>({
      method: 'DELETE',
      url: url + 'unload',
      withCredentials,
    });

  const transition = (st: IStateTransitionRequest) =>
    m.request<boolean>({
      method: 'PUT',
      url: url + 'transition',
      withCredentials,
      body: st,
    });

  const createInject = (body: IInject) =>
    m.request<void>({
      method: 'POST',
      url: url + 'create',
      withCredentials,
      body,
    });

  const updateInject = (body: IInject) =>
    m.request<void>({
      method: 'PUT',
      url: url + 'update',
      withCredentials,
      body,
    });

  return {
    activeSession,
    activeTrial,
    load,
    unload,
    transition,
    createInject,
    updateInject,
  };
};
