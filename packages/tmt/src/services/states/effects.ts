import m from 'mithril';
import { actions } from '..';
import { IGuiTemplate } from 'trial-manager-models';
import { IActions, IAppModel } from '../meiosis';

export const LoadGuiTemplates = (_actions: IActions) => {
  const server = location.origin + '/tmt';
  // const server = (process.env.SERVER || location.origin) + '/tmt';
  let dataLoaded = false;

  return async (state: IAppModel) => {
    if (dataLoaded) return;
    const {
      app: { templates },
    } = state;

    if (templates.length === 0) {
      dataLoaded = true;
      // console.log(`Loading data`);
      const topics = await m.request<string[]>({
        method: 'GET',
        url: `${server}/run/topics`,
      });
      const loadedTemplates = [] as IGuiTemplate[];
      for (const topic of topics) {
        let template: IGuiTemplate;
        try {
          template = await m.request<IGuiTemplate>({
            method: 'GET',
            url: `${server}/topics/${topic.toLowerCase()}.json`,
          });
          if (template) loadedTemplates.push({ ...template, ui: JSON.stringify(template.ui), topic });
        } catch {
          console.warn(`No GUI template found for topic ${topic}.`);
        }
      }
      actions.update({ app: { templates: loadedTemplates } });
    }
  };
};
