import { ComponentTypes } from 'mithril';
import { Dashboards } from '../models';

export type IconType = () => string | string;

export type IconResolver = () => string;

export interface IDashboard {
  id: Dashboards;
  default?: boolean;
  hasNavBar?: boolean;
  title: string | (() => string);
  icon?: string | IconResolver;
  iconClass?: string;
  route: string;
  visible: boolean;
  component: ComponentTypes<any, any>;
  level?: string;
}
