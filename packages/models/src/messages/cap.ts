import { IAlert } from './standard_cap-value';

export const ActionListParameter = '_actions';

export enum Priority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  AVERAGE = 'AVERAGE',
  LOW = 'LOW',
}

/** Action list for LCMS */
export interface IActionList {
  title: string;
  description: string;
  priority: Priority;
}

export const convertCAPtoAVRO = (cap: IAlert, sent: Date) => {
  cap.sent = convertDateToCAPDate(sent);
  return cap;
};

/**
 * Takes a date object, outputs a CAP date string
 */
export const convertDateToCAPDate = (date: Date) => {
  if (!date) {
    return 'unknown date';
  }
  const tdiff = -date.getTimezoneOffset();
  const tdiffh = Math.floor(Math.abs(tdiff / 60));
  const tdiffm = tdiff % 60;
  const tdiffpm = tdiff <= 0 ? '-' : '+';
  const isoTmp = date
    .toISOString()
    .split('.')
    .shift() || '';
  const iso = ''.concat(
    isoTmp,
    tdiffpm,
    tdiffh < 10 ? '0' : '',
    tdiffh.toFixed(0),
    ':',
    tdiffm < 10 ? '0' : '',
    tdiffm.toFixed(0)
  );
  // console.log(`Converted date to ${iso}`);
  return iso ;
};
