import m, { Lifecycle } from 'mithril';

export const compose = <F extends (d: any) => any, T>(...functions: F[]) => (data: T) =>
  functions.reduceRight((value, func) => func(value), data);

export const map = <T>(f: (...args: any[]) => any) => (x: T[]) => Array.prototype.map.call(x, f);

export const join = <T>(seperator: string) => (list: T[]): string => Array.prototype.join.call(list, seperator);

/**
 * Convert camel case to snake case.
 *
 * @param {string} cc: Camel case string
 */
export const camelToSnake = (cc: string) => cc.replace(/([A-Z])/g, ($1) => '-' + $1.toLowerCase());

const encodeAttribute = (x = '') => x.toString().replace(/"/g, '&quot;');

const toAttributeString = <T extends { [key: string]: any }>(x: T) =>
  compose(
    join(''),
    map((attribute: string) => `[${camelToSnake(attribute)}="${encodeAttribute(x[attribute])}"]`),
    Object.keys
  )(x);

export interface IHtmlAttributes {
  id?: string;
  for?: string;
  placeholder?: string;
  autofocus?: boolean;
  disabled?: boolean;
  type?: 'submit' | 'button' | 'text' | 'textarea' | 'number';
}

export interface IHtmlInputEvents<State, Attrs> extends Lifecycle<Attrs, State> {
  value?: string | number | boolean;
  href?: string;
  class?: string;
  style?: string;
  onclick?: (e: UIEvent) => void;
}

export const icon = (iconName: string) => m('i.material-icons', iconName);

export const iconPrefix = (iconName: string) => m('i.material-icons.prefix', iconName);

export const button = <State, Attrs>(
  label: string,
  attr = {} as IHtmlAttributes,
  ui = {} as IHtmlInputEvents<State, Attrs>
) => m(`button.waves-effect.waves-light.btn${toAttributeString(attr)}`, ui, label);

export const roundIconButton = <State, Attrs>(
  iconName: string,
  attr = {} as IHtmlAttributes,
  ui = {} as IHtmlInputEvents<State, Attrs>
) => m(`a.btn-floating.btn-large.waves-effect.waves-light.red${toAttributeString(attr)}`, ui, icon(iconName));
