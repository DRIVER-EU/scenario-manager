import { uniqueId } from '../utils';

export interface ICAPObject {
  properties: { [key: string]: any };
  area: any;
}

export interface ICAPAlert {
  identifier: string;
  sender: string;
  sent: string;
  status: string;
  msgType: string;
  scope: string;
  addresses?: string;
  references?: string[];
  info: ICAPInfo;
}

export interface ICAPInfo {
  senderName?: string;
  event: string;
  description?: string;
  category: string;
  severity: string;
  certainty: string;
  urgency: string;
  onset?: string;
  eventCode?: string;
  headline?: string;
  expires?: string;
  responseType?: string;
  instruction?: string;
  area?: ICAPArea;
  parameter?: IValueNamePair;
}

export interface IValueNamePair {
  valueName: string;
  value: string;
}

export interface ICAPArea {
  areaDesc: string;
  polygon?: { [key: string]: any };
  point?: { [key: string]: any };
}

export const createDefaultCAPMessage = (senderId: string) => ({
  identifier: uniqueId(),
  sender: `${senderId}@${senderId}.nl`,
  sent: convertDateToCAPDate(new Date()),
  status: 'Test',
  msgType: 'Alert',
  scope: 'Public',
  addresses: '',
  info: {
    senderName: 'LCMS-VRH',
    category: 'Met',
    event: 'Monitor',
    urgency: 'Immediate',
    severity: 'Severe',
    certainty: 'Observed',
    headline: 'Headline',
  },
});

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
  console.log(`Converted date to ${iso}`);
  return iso ;
};
