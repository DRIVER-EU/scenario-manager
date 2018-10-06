declare module 'mithril-datepicker' {
  import { Vnode, Component, ComponentTypes } from 'mithril';

  export interface IFormatOptions {
    weekday?: 'narrow' | 'short' | 'long';
    day?: 'numeric' | '2-digit'
    month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';
    year?: 'numeric' | '2-digit'
  }

  export interface IDatePickerLocalisationAttributes {
    /** E.g. 0 is Sunday, 1 is Monday */
    weekStart?: number;
    /** 2-char locale, e.g. 'nl', 'es', 'fr', 'en' */
    locale?: string;
    /** Default, ['1 Mo', '1 Yr', '10 Yr'] */
    prevNextTitles?: string[];
    formatOptions?: IFormatOptions;
    onchange?: (date: Date) => void;
  }

  export interface IDatePickerAttributes extends IDatePickerLocalisationAttributes {
    date?: Date;
    onchange?: (date: Date) => void;
  }

  const DatePicker: ComponentTypes<IDatePickerAttributes, any>;

  export default DatePicker;
}
