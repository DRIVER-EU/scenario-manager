import m from 'mithril';
import { FlatButton } from 'mithril-materialized';
import { PluginType } from 'mithril-ui-form';

export const modalPlugin: PluginType = () => {
  return {
    view: ({ attrs: { props, field } }) => {
      const { disabled, iconName = 'file_upload', className = 'input-field col s1' } = props;
      const { id, modalId } = field;
      return m(FlatButton, {
        id,
        disabled,
        className,
        modalId,
        iconName,
      });
    },
  };
};
