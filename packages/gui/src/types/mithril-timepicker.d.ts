declare module 'mithril-timepicker' {
  import { Vnode, Component, ComponentTypes } from 'mithril';

  export interface ITimePickerTime {
    /** Hours */
    h: number;
    /** Minutes */
    m: number;
  }

  export interface ITimePickerAttributes {
    increment?: 5 | 15;
    time?: ITimePickerTime;
    onchange?: (t: ITimePickerTime) => void;
    /** Twentyfour hour mode */
    tfh?: boolean;
  }

  const TimePicker: ComponentTypes<ITimePickerAttributes, any>;

  export default TimePicker;
}
