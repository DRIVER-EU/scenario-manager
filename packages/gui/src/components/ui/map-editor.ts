import m, { FactoryComponent, Attributes } from 'mithril';
import { uniqueId } from '../../utils';
import {
  Label,
  Collection,
  ICollectionItem,
  CollectionMode,
  TextInput,
  NumberInput,
  Switch,
  TextArea,
  FlatButton,
} from 'mithril-materialized';

export interface IMapEditor extends Attributes {
  /** If true, displays a header over the map */
  header?: string;
  /** Instead of a header, use a label */
  label?: string;
  /** Places a required * after the label */
  isMandatory?: boolean;
  /**
   * Optional value for the key label
   * @default: "Key"
   */
  labelKey?: string;
  /**
   * Optional value for the value label
   * @default: "Value"
   */
  labelValue?: string;
  /** If true, the item cannot be edited */
  disabled?: boolean;
  /** Add an icon prefix */
  iconName?: string;
  /** If true, do not parse arrays like [1, 2, 3] */
  disallowArrays?: boolean;
  /** The actual map of key-value pairs */
  properties: { [key: string]: number | string | boolean | Array<string | number> };
  /** Optional component to use to render the key-value pair in a Collection */
  keyValueConverter?: (key: string, value: number | string | boolean | Array<string | number>) => ICollectionItem;
}

/** A simple editor for a Map (i.e. key - value pairs) */
export const MapEditor: FactoryComponent<IMapEditor> = () => {
  const parseArray = (v?: string, disallowArrays = false) => {
    if (disallowArrays) {
      return v;
    }
    const extractArrayData = /\s*\[(.*)\]\s*/gi;
    if (!v) {
      return undefined;
    }
    const match = extractArrayData.exec(v);
    if (!match || match.length !== 2) {
      return undefined;
    }
    return match[1]
      .split(',')
      .map(i => i.trim())
      .map(i => (/^\d+$/g.test(i) ? +i : i));
  };

  const kvc = (key: string, value: number | string | boolean | Array<string | number>) => {
    const displayValue = value instanceof Array ? value.join(', ') : value.toString();
    // const title = m('.row', [m('.col.s6', key), m('.col.s6', displayValue)]);
    const title = m('.row', [
      m('.col.s4', m('b', key)),
      m('.col.s8', displayValue),
    ]);
    // const title = `${key}: ${displayValue}</div></div>`;
    return {
      title,
    } as ICollectionItem;
  };

  const onclick = (key: string) => (state.curKey = state.id = key);

  const kvcWrapper = (key: string, item: ICollectionItem) => {
    const clickHandler = item.onclick;
    item.id = item.id || key;
    item.active = key === state.curKey;
    item.onclick = clickHandler ? () => onclick(key) && clickHandler(item) : () => onclick(key);
    return item;
  };

  const toCollectionArray = (properties: { [key: string]: number | string | boolean | Array<string | number> }) =>
    Object.keys(properties)
      .map(key => ({ key, value: properties[key] }))
      .map(item => kvcWrapper(item.key, state.kvc(item.key, item.value)));

  const state = {
    compId: uniqueId(),
    id: '',
    curKey: '',
    kvc,
  };

  const resetInputs = () => {
    state.id = '';
    state.curKey = '';
  };

  return {
    oninit: ({ attrs: { keyValueConverter } }) => {
      if (keyValueConverter) {
        state.kvc = keyValueConverter;
      }
    },
    view: ({
      attrs: {
        header,
        label,
        isMandatory,
        disabled,
        disallowArrays,
        properties,
        iconName,
        className = 'col s12',
        labelKey = 'Key',
        labelValue = 'Value',
      },
    }) => {
      const items = toCollectionArray(properties);
      const key = state.curKey;
      const prop = properties[key];
      const value =
        typeof prop === 'boolean' ? prop : prop ? (prop instanceof Array ? `[${prop.join(', ')}]` : prop) : '';
      const id = state.compId;
      return [
        m(
          '.map-editor',
          m('.input-field', { className }, [
            iconName ? m('i.material-icons.prefix', iconName) : '',
            m(Label, { label, isMandatory, isActive: items.length > 0 }),
            m(Collection, { id, items, mode: CollectionMode.LINKS, header }),
          ])
        ),
        disabled
          ? undefined
          : [
              m(TextInput, {
                label: labelKey,
                iconName: 'label',
                className: 'col s12 m6',
                initialValue: key,
                onchange: (v: string) => {
                  state.curKey = v;
                  if (state.id) {
                    delete properties[state.id];
                    properties[v] = prop;
                    state.id = v;
                  }
                },
              }),
              typeof value === 'string'
                ? m(TextArea, {
                    label: labelValue,
                    initialValue: value,
                    className: 'col s12 m6',
                    onchange: (v: string) => {
                      const b = /false/i.test(v) ? false : /true/i.test(v) ? true : undefined;
                      const n = typeof b === 'undefined' ? (/^\s*\d+\s*$/i.test(v) ? +v : undefined) : undefined;
                      properties[key] =
                        typeof b === 'boolean' ? b : typeof n === 'number' ? n : parseArray(v, disallowArrays) || v;
                    },
                  })
                : typeof value === 'number'
                ? m(NumberInput, {
                    label: labelValue,
                    initialValue: value,
                    className: 'col s12 m6',
                    onchange: (v: number) => {
                      properties[key] = v;
                    },
                  })
                : m(Switch, {
                    label: labelValue,
                    checked: value,
                    className: 'col s12 m6',
                    onchange: (v: boolean) => {
                      properties[key] = v;
                    },
                  }),
              m('.col.s12.right-align', [
                m(FlatButton, {
                  iconName: 'add',
                  onclick: resetInputs,
                }),
                m(FlatButton, {
                  iconName: 'delete',
                  disabled: !key,
                  onclick: () => {
                    delete properties[key];
                    resetInputs();
                  },
                }),
              ]),
            ],
      ];
    },
  };
};
