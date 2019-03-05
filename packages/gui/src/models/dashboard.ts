import { ComponentTypes } from 'mithril';

export interface IDashboard {
  id: string;
  default?: boolean;
  title: string;
  iconName?: string;
  route: string;
  visible: boolean;
  component: ComponentTypes;
  level?: string;
}
