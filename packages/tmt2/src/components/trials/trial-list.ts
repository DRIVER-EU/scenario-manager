import m from 'mithril';
import { TextInput, RoundIconButton, Icon } from 'mithril-materialized';
import { dashboardSvc, MeiosisComponent } from '../../services';
import { titleAndDescriptionFilter, padLeft } from '../../utils';
import { ITrialOverview } from '../../../../models';
import { Dashboards } from '../../models';

export const TrialList: MeiosisComponent = () => {
  let filterValue: string | undefined;
  let loaded = false;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${padLeft(d.getHours())}:${padLeft(d.getMinutes())}`;
  };

  return {
    oninit: async ({
      attrs: {
        actions: { loadTrials },
      },
    }) => {
      await loadTrials();
      loaded = true;
    },
    view: ({
      attrs: {
        state: {
          app: { trials },
        },
        actions: { loadTrial },
      },
    }) => {
      const query = titleAndDescriptionFilter(filterValue);
      const filteredTrials = trials.filter(query);
      const apiService = process.env.SERVER || location.origin;

      return m('.scenario-list', [
        m('.row', [
          m(RoundIconButton, {
            iconName: 'add',
            class: 'green input-field right btn-medium',
            style: 'margin: 1em 1em 0 0;',
            onclick: () => {
              dashboardSvc.switchTo(Dashboards.TRIAL_INFO);
            },
          }),
          m(TextInput, {
            label: 'Filter',
            id: 'filter',
            iconName: 'filter_list',
            onkeyup: (_: KeyboardEvent, v?: string) => (filterValue = v),
            style: 'margin-right:100px',
            className: 'right',
          }),
        ]),
        m(
          '.row.sb.large',
          filteredTrials.map((trial) =>
            m('.col.s6.m4.l3', [
              m(
                '.card',
                m('.card-content', { style: 'height: 150px' }, [
                  m(
                    'a[href=#].card-title',
                    {
                      onclick: async () => {
                        console.log('Set scenario to ' + trial.title);
                        await loadTrial(trial.id);
                        dashboardSvc.switchTo(Dashboards.TRIAL_INFO);
                      },
                    },
                    `${trial.title || 'Untitled'}${trial.lastEdit ? ` (${formatDate(trial.lastEdit)})` : ''}`
                  ),
                  m(
                    'p',
                    trial.description && trial.description.length > 120
                      ? `${trial.description.substr(0, 119)}...`
                      : trial.description
                  ),
                ]),
                m('.card-action', [
                  m(
                    'a',
                    {
                      href: `${apiService}/repo/${trial.id}`,
                    },
                    m(Icon, {
                      iconName: 'cloud_download',
                    })
                  ),
                  m(
                    'a',
                    {
                      href: '#!',
                      onclick: () => {
                        m.request<ITrialOverview>({
                          method: 'POST',
                          url: `${apiService}/repo/clone/${trial.id}`,
                        }).then(async (to) => {
                          if (to && to.id) {
                            await loadTrial(to.id);
                            dashboardSvc.switchTo(Dashboards.TRIAL_INFO);
                          }
                        });
                      },
                    },
                    m(Icon, {
                      iconName: 'content_copy',
                    })
                  ),
                ])
              ),
            ])
          )
        ),
      ]);
    },
  };
};
