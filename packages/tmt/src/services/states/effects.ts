import m from 'mithril';
import { actions, selectedMessageTypes } from '..';
import { IGuiTemplate, MessageType, uniqueId } from 'trial-manager-models';
import { IActions } from '../meiosis';

export const LoadGuiTemplates = (_actions: IActions) => {
  //const server = location.origin + '/tmt';
  const server = (process.env.SERVER || location.origin) + '/tmt';
  let dataLoaded = false;

  return async () => {
    if (dataLoaded) return;
    dataLoaded = true;

    const templateFiles = await m.request<{ files: string[] }>({
      method: 'GET',
      url: `${server}/topics/index.json`,
    });
    const templates = [] as IGuiTemplate[];
    for (const templateFile of templateFiles.files) {
      let template: void | IGuiTemplate;
      template = await m
        .request<IGuiTemplate>({
          method: 'GET',
          url: `${server}/topics/${templateFile}`,
        })
        .catch((_e) => console.warn(`No GUI template found for topic ${templateFile}.`));
      if (template) {
        if (!template.id) template.id = uniqueId();
        templates.push({ ...template, ui: JSON.stringify(template.ui) });
      }
    }
    for (const t of templates.filter(t => t.default)) selectedMessageTypes.push({
      id: t.id,
      name: t.label,
      iconName: t.icon,
      templateId: t.id,
      kafkaTopic: t.kafkaTopic,
      messageType: (JSON.parse(t.ui as string) as Record<string, any>[]).filter(u => u.id === 'messageType').map(u => u.value).shift() || MessageType.UNDEFINED,
      useNamespace: false,
      useCustomGUI: false,
    })
    actions.update({ app: { templates } });
  };
};
