import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, NumberInput } from 'mithril-materialized';
import { getMessage, IInject, MessageType, ISumoConfiguration } from 'trial-manager-models';

export const SumoConfigurationForm: FactoryComponent<{
  inject: IInject;
  disabled?: boolean;
  onChange?: () => void;
}> = () => {
  const setTitle = (inject: IInject, sc: ISumoConfiguration) => {
    inject.title = `Run ${sc.configFile}`;
  };
  const convertToSec = (n: number) => n === -1 ? -1 : n / 1000;
  const convertToMSec = (n: number) => n === -1 ? -1 : n * 1000;

  return {
    view: ({ attrs: { inject, disabled } }) => {
      const sc = getMessage(inject, MessageType.SUMO_CONFIGURATION) as ISumoConfiguration;
      sc.begin = sc.begin || -1;
      sc.end = sc.end || -1;
      sc.aggregation = sc.aggregation || 3600000;
      sc.affectedTraffic = sc.affectedTraffic || 90000;
      sc.singleVehicle = sc.singleVehicle || -1;

      return [
        m(TextInput, {
          disabled,
          label: 'Configuration file',
          iconName: 'title',
          isMandatory: true,
          helperText: 'Absolute or relative path to the SUMO configuration.',
          initialValue: sc.configFile,
          onchange: v => {
            sc.configFile = v;
            setTitle(inject, sc);
          },
        }),
        m(NumberInput, {
          disabled,
          className: 'col s6',
          label: 'Begin time',
          iconName: 'timer',
          isMandatory: true,
          helperText: 'Begin time of the simulation in seconds or -1 for indefinite',
          initialValue: convertToSec(sc.begin),
          onchange: v => (sc.begin = convertToMSec(v)),
        }),
        m(NumberInput, {
          disabled,
          className: 'col s6',
          label: 'End time',
          iconName: 'timer_off',
          isMandatory: true,
          helperText: 'End time of the simulation in seconds or -1 for indefinite',
          initialValue: convertToSec(sc.end),
          onchange: v => (sc.end = convertToMSec(v)),
        }),
        m(NumberInput, {
          disabled,
          className: 'col s4',
          label: 'Affected traffic',
          iconName: 'traffic',
          isMandatory: true,
          helperText: 'Aggregation period for the statistics about affected traffic in seconds',
          initialValue: convertToSec(sc.affectedTraffic),
          onchange: v => (sc.affectedTraffic = convertToMSec(v)),
        }),
        m(NumberInput, {
          disabled,
          className: 'col s4',
          label: 'Aggregation',
          iconName: 'traffic',
          isMandatory: true,
          helperText: 'Aggregation period for simulation outputs in seconds',
          initialValue: convertToSec(sc.aggregation),
          onchange: v => (sc.aggregation = convertToMSec(v)),
        }),
        m(NumberInput, {
          disabled,
          className: 'col s4',
          label: 'Single vehicle',
          iconName: 'directions_car',
          isMandatory: true,
          helperText: 'Aggregation period for the outputs of each vehicle in seconds (or -1 to disable)',
          initialValue: convertToSec(sc.singleVehicle),
          onchange: v => (sc.singleVehicle = convertToMSec(v)),
        }),
        m(TextArea, {
          disabled,
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => (inject.description = v),
          label: 'Description',
          iconName: 'description',
        }),
      ];
    },
  };
};
