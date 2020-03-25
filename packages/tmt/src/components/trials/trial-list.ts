import m from 'mithril';
import { TextInput, RoundIconButton, Icon } from 'mithril-materialized';
import { TrialSvc, dashboardSvc } from '../../services';
import { titleAndDescriptionFilter, padLeft } from '../../utils';
import { ITrial, ITrialOverview } from '../../../../models';
import { Dashboards, AppState } from '../../models';

export const TrialList = () => {
  const state = {
    filterValue: undefined as string | undefined,
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${padLeft(d.getHours())}:${padLeft(d.getMinutes())}`;
  };

  return {
    oninit: () => TrialSvc.loadList(),
    view: () => {
      const trials = TrialSvc.getList();
      const query = titleAndDescriptionFilter(state.filterValue);
      const filteredTrials = trials.filter(query);
      return m('.scenario-list', [
        m('.row', [
          m(RoundIconButton, {
            iconName: 'add',
            class: 'green input-field right btn-medium',
            style: 'margin: 1em 1em 0 0;',
            onclick: () => {
              TrialSvc.new({
                title: 'New trial',
                creationDate: new Date(),
              } as ITrial);
              dashboardSvc.switchTo(Dashboards.TRIAL_INFO);
            },
          }),
          m(TextInput, {
            label: 'Filter',
            id: 'filter',
            iconName: 'filter_list',
            onkeyup: (ev: KeyboardEvent, v?: string) => (state.filterValue = v),
            style: 'margin-right:100px',
            className: 'right',
          }),
        ]),
        m(
          '.row.sb.large',
          filteredTrials.map(trial =>
            m('.col.s6.m4.l3', [
              m(
                '.card',
                m('.card-content', { style: 'height: 150px' }, [
                  m(
                    'a[href=#].card-title',
                    {
                      onclick: () => {
                        console.log('Set scenario to ' + trial.title);
                        TrialSvc.load(trial.id);
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
                      href: `${AppState.apiService()}/repo/${trial.id}`,
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
                          url: `${AppState.apiService()}/repo/clone/${trial.id}`,
                        }).then(to => {
                          if (to && to.id) {
                            TrialSvc.load(to.id);
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
