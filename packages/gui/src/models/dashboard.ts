import { ComponentTypes } from 'mithril';

export interface IDashboard {
  id: string;
  default?: boolean;
  title: string;
  route: string;
  visible: boolean;
  component: ComponentTypes;
}
