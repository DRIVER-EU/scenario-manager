import m, { FactoryComponent } from 'mithril';
import { IInject, InjectLevel, InjectState, InjectConditionType, IInjectCondition } from '../../models';
import { Select, NumberInput, ISelectOption, Icon, TimePicker } from 'mithril-materialized';
import { TrialSvc } from '../../services';
import { padLeft } from '../../utils';

/*
# Inject conditions

An inject can occur after a number of conditions:

Time-based conditions are all delays:

- After a fixed delay (in seconds/minutes/hours)
- Immediately after the previous inject (which is a fixed delay of 0 sec)
- At a certain time (which is also a fixed delay, but relative to the scenario start time)

Optionally, you may need to satisfy certain conditions:

- Another inject is completed (actually, this is a bit more generic, as we normally wait for the previous inject)

## Examples

For regular injects:

- Start manually (after the previous inject)
- Start immediately (after the previous inject)
- Start after 5 minutes (after the previous inject)

For acts and storylines, which are at the beginning of a sequence

- Start at 9:00 (after the 'start' inject)
- As above, after [act|storyline|scenario] [name of act|storyline] has [started|finished]

*/

export const InjectConditions: FactoryComponent<{ inject: IInject }> = () => {
  return {
    view: ({ attrs: { inject } }) => {
      if (!inject.type) {
        return;
      }
      if (!inject.condition) {
        inject.condition = {
          delayType: InjectConditionType.IMMEDIATELY,
          delay: 0,
          delayUnitType: 'seconds',
          injectLevel: InjectLevel.INJECT,
          levelState: InjectState.EXECUTED,
        } as IInjectCondition;
      }
      const { level, id, condition } = inject;
      const levelOptions = [] as Array<ISelectOption<string>>;
      if (level === InjectLevel.INJECT) {
        condition.injectLevel = InjectLevel.INJECT;
        levelOptions.push({ id: InjectLevel.INJECT, label: 'previous', disabled: true });
      } else {
        if (condition.injectLevel === InjectLevel.INJECT) {
          condition.injectLevel = InjectLevel.ACT;
        }
        levelOptions.push({ id: InjectLevel.ACT, label: 'act' });
        levelOptions.push({ id: InjectLevel.STORYLINE, label: 'storyline' });
        levelOptions.push({ id: InjectLevel.SCENARIO, label: 'scenario' });
      }
      const levelStateOptions: Array<ISelectOption<string>> =
        condition.injectLevel !== InjectLevel.SCENARIO ? [{ id: InjectState.EXECUTED, label: 'finished' }] : [];
      levelStateOptions.push({
        id: InjectState.SCHEDULED,
        disabled: condition.injectLevel === InjectLevel.SCENARIO,
        label: 'started',
      });
      const injects =
        condition.injectLevel === InjectLevel.INJECT
          ? []
          : (TrialSvc.getInjects() || [])
              .filter(i => i.level === condition.injectLevel && i.id !== id)
              .map(i => ({ id: i.id, label: `"${i.title}"` }));

      return m(
        '.row',
        m('.col.s12', [
          // m('h5', 'Start condition'),
          m(Icon, { iconName: 'playlist_play', class: 'small', style: 'margin: 0 0.5em;' }),
          m('span.inline', 'Start '),
          m(Select, {
            style: 'width: 70px',
            contentClass: 'inline medium',
            placeholder: 'Pick one',
            isMandatory: true,
            checkedId: condition.delayType,
            options: [
              { id: InjectConditionType.MANUALLY, label: 'manually' },
              { id: InjectConditionType.IMMEDIATELY, label: 'immediately' },
              { id: InjectConditionType.DELAY, label: 'after' },
              {
                id: InjectConditionType.AT_TIME,
                label: 'at',
                disabled: !TrialSvc.getCurrent() || !TrialSvc.getCurrent().startDate,
              },
            ],
            onchange: (v: unknown) => (condition.delayType = +(v as number)),
          }),
          condition.delayType === InjectConditionType.AT_TIME
            ? m(StartAt, { condition })
            : [
                m(Delay, { condition }),
                m('span.inline', ' after the '),
                m(Select, {
                  contentClass: 'inline small',
                  checkedId: condition.injectLevel,
                  options: levelOptions,
                  onchange: (v: unknown) => (condition.injectLevel = v as InjectLevel),
                }),
                condition.injectLevel === InjectLevel.INJECT || condition.injectLevel === InjectLevel.SCENARIO
                  ? undefined
                  : m(Select, {
                      contentClass: 'inline large',
                      checkedId: condition.levelId,
                      options: injects,
                      onchange: (v: unknown) => (condition.levelId = v as string),
                    }),
                m('span.inline', ' has '),
                m(Select, {
                  contentClass: 'inline small',
                  checkedId: condition.levelState,
                  options: levelStateOptions,
                  onchange: (v: unknown) => (condition.levelState = v as InjectState),
                }),
              ],
          m('span.inline', '.'),
        ])
      );
    },
  };
};

const Delay: FactoryComponent<{ condition: IInjectCondition }> = () => {
  return {
    view: ({ attrs: { condition } }) =>
      condition.delayType === InjectConditionType.DELAY
        ? [
            m(NumberInput, {
              contentClass: 'inline xs',
              min: 0,
              initialValue: condition.delay,
              onchange: (v: number) => (condition.delay = v),
            }),
            m(Select, {
              contentClass: 'inline small',
              checkedId: condition.delayUnitType,
              options: [
                { id: 'seconds', label: condition.delay === 1 ? 'second' : 'seconds' },
                { id: 'minutes', label: condition.delay === 1 ? 'minute' : 'minutes' },
                { id: 'hours', label: condition.delay === 1 ? 'hour' : 'hours' },
              ],
              onchange: (v: unknown) => (condition.delayUnitType = v as 'seconds' | 'minutes' | 'hours' | undefined),
            }),
          ]
        : undefined,
  };
};

const StartAt: FactoryComponent<{ condition: IInjectCondition }> = () => {
  return {
    view: ({ attrs: { condition } }) => {
      const { delay = 0, delayUnitType = 'seconds' } = condition;
      const trial = TrialSvc.getCurrent();
      if (!trial) {
        return;
      }
      const sec = delayUnitType === 'seconds' ? 1 : delayUnitType === 'minutes' ? 60 : 3600;
      const delayInSeconds = delay * sec;
      const trialStart = trial.startDate || new Date();
      const atTime = new Date(trialStart.getTime() + delayInSeconds * 1000);
      return m(TimePicker, {
        contentClass: 'inline',
        initialValue: `${padLeft(atTime.getHours(), 2)}:${padLeft(atTime.getMinutes(), 2)}`,
        prefix: 'Start',
        dt: atTime,
        onchange: (time: string) => {
          const regex = /(\d{1,2}):(\d{1,2})/g;
          const match = regex.exec(time);
          if (!match || match.length < 2) {
            return;
          }
          const hrs = +match[1];
          const min = +match[2];
          const newTime = new Date(new Date(atTime).setHours(hrs, min, 0)).getTime();
          const oldTime = trialStart.getTime();
          const dtInSec = (newTime - oldTime) / 1000;
          if (dtInSec < 0) {
            console.warn('Cannot start before the scenario starts!');
            return;
          }
          condition.delay = dtInSec;
          condition.delayUnitType = 'seconds';
          m.redraw();
        },
      });
    },
  };
};
