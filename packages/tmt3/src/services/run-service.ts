import m from 'mithril';
import { IStateTransitionRequest, ISessionManagement, IInject, ITrial } from '../../../models';

const withCredentials = false;

export const runServiceFactory = (apiService: string) => {
  const url = `${apiService}/run/`;

  const activeSession = async () =>
    await m
      .request<ISessionManagement>({
        method: 'GET',
        url: url + 'active',
        withCredentials,
      })
      .catch(console.warn);

  const activeTrial = async () =>
    await m
      .request<ITrial>({
        method: 'GET',
        url: url + 'trial',
        withCredentials,
      })
      .catch(console.warn);

  const load = async (body: ISessionManagement) =>
    await m.request<void>({
      method: 'POST',
      url: url + 'load',
      withCredentials,
      body,
    });

  const unload = async () =>
    await m.request<void>({
      method: 'DELETE',
      url: url + 'unload',
      withCredentials,
    });

  const transition = async (st: IStateTransitionRequest) =>
    await m.request<boolean>({
      method: 'PUT',
      url: url + 'transition',
      withCredentials,
      body: st,
    });

  const createInject = async (body: IInject) =>
    await m.request<void>({
      method: 'POST',
      url: url + 'create',
      withCredentials,
      body,
    });

  const updateInject = async (body: IInject) =>
    await m.request<void>({
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
