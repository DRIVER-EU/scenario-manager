import m, { FactoryComponent, Attributes } from 'mithril';
import {
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
  /** The actual map of key-value pairs */
  properties: { [key: string]: number | string | boolean | Array<string | number> };
  /** Optional component to use to render the key-value pair in a Collection */
  keyValueConverter?: (key: string, value: number | string | boolean | Array<string | number>) => ICollectionItem;
}

/** A simple editor for a Map (i.e. key - value pairs) */
export const MapEditor: FactoryComponent<IMapEditor> = () => {
  const parseArray = (v?: string) => {
    const extractArrayData = /\s*\[(.*)\]\s*/gi;
    if (!v || !extractArrayData.test(v)) { return undefined; }
    const match = extractArrayData.exec(v);
    return match && match.length === 2 ? match[1] : undefined;
  };

  const kvc = (key: string, value: number | string | boolean | Array<string | number>) => {
    const displayValue = value instanceof Array ? value.join(', ') : value.toString();
    const title = `${key} ⇒ ${displayValue}`;
    return {
      title,
    } as ICollectionItem;
  };

  const onclick = (key: string) => (state.curKey = key);

  const kvcWrapper = (key: string, item: ICollectionItem) => {
    const clickHandler = item.onclick;
    (item.id = item.id || key), (item.active = key === state.curKey);
    item.onclick = clickHandler ? () => onclick(key) && clickHandler(item) : () => onclick(key);
    return item;
  };

  const toCollectionArray = (properties: { [key: string]: number | string | boolean | Array<string | number> }) =>
    Object.keys(properties)
      .map(key => ({ key, value: properties[key] }))
      .map(item => kvcWrapper(item.key, state.kvc(item.key, item.value)));

  const state = {
    curKey: '',
    kvc,
  };

  return {
    oninit: ({ attrs: { keyValueConverter } }) => {
      if (keyValueConverter) {
        state.kvc = keyValueConverter;
      }
    },
    view: ({ attrs: { header, disabled, properties, labelKey, labelValue } }) => {
      const items = toCollectionArray(properties);
      const key = state.curKey;
      const prop = properties[key];
      const value = prop ? (prop instanceof Array ? `[${prop.join(', ')}]` : prop) : '';

      return [
        m('.row', m(Collection, { items, mode: CollectionMode.LINKS, header })),
        disabled
          ? undefined
          : m('.row', [
              m(
                '.col.s12.m6',
                m(TextInput, {
                  label: labelKey || 'Key',
                  initialValue: state.curKey,
                  disabled: !key,
                  onchange: (v: string) => {
                    properties[v] = prop;
                    delete properties[key];
                  },
                })
              ),
              m(
                '.col.s12.m6',
                typeof value === 'string'
                  ? m(TextArea, {
                      label: labelValue || 'Value',
                      initialValue: value,
                      disabled: !value,
                      onchange: (v: string) => {
                        properties[key] = parseArray(v) || v;
                      },
                    })
                  : typeof value === 'number'
                  ? m(NumberInput, {
                      label: labelValue || 'Value',
                      initialValue: value,
                      disabled: !value,
                      onchange: (v: number) => {
                        properties[key] = v;
                      },
                    })
                  : m(Switch, {
                      checked: value,
                      onchange: (v: boolean) => {
                        properties[key] = v;
                      },
                    })
              ),
              m('.col.s12', [
                m(FlatButton, {
                  iconName: 'add',
                  onclick: () => {
                    state.curKey = 'newKey';
                  },
                }),
                m(FlatButton, {
                  iconName: 'delete',
                  disabled: !key,
                  onclick: () => {
                    delete properties[key];
                  },
                }),
              ]),
            ]),
      ];
    },
  };
};
