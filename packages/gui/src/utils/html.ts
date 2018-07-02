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

const baseButton = (defaultClassNames: string[]) => <State, Attrs>(
  iconName: string,
  classNames: string[] = [],
  attr = {} as IHtmlAttributes,
  ui = {} as IHtmlInputEvents<State, Attrs>
) =>
  m(
    `${defaultClassNames.join('.')}${classNames.length > 0 ? '.' : ''}${classNames.join('.')}${toAttributeString(
      attr
    )}`,
    ui,
    icon(iconName)
  );

export const button = baseButton(['button', 'waves-effect', 'waves-light', 'btn']);
export const roundIconButton = baseButton(['button', 'btn-floating', 'btn-large', 'waves-effect', 'waves-light']);

const inputField = (type: string) => (options: {
  id: string;
  initialValue?: string;
  onchange: (value: string) => void;
  label: string;
  icon?: string;
  size?: string;
}) =>
  m(`.input-field.col.${options.size || 's12'}`, [
    options.icon ? m('i.material-icons.prefix', options.icon) : '',
    m(`${type}[id=${options.id}]`, {
      oninput: m.withAttr('value', options.onchange),
      value: options.initialValue,
    }),
    m(`label[for=${options.id}]`, options.label),
  ]);

export const inputTextArea = inputField('textarea.materialize-textarea');
export const inputText = inputField('input[type=text]');
