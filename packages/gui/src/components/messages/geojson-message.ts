import m, { FactoryComponent } from 'mithril';
import { TextArea, TextInput, Select, FlatButton, ModalPanel, MapEditor } from 'mithril-materialized';
import { IAsset, IInject, MessageType, IGeoJsonMessage } from 'trial-manager-models';
import { getMessage, getMessageSubjects } from '../../utils';
import { TrialSvc } from '../../services';
import { UploadAsset } from '../ui';

export const GeoJsonMessageForm: FactoryComponent<{ inject: IInject }> = () => {
  const jsonExt = /json$/i;

  return {
    view: ({ attrs: { inject } }) => {
      const pm = getMessage(inject, MessageType.GEOJSON_MESSAGE) as IGeoJsonMessage;
      const subjects = getMessageSubjects(MessageType.GEOJSON_MESSAGE);
      if (!pm.subjectId && subjects.length === 1) {
        pm.subjectId = subjects[0].id;
      }
      const assets = TrialSvc.assets;
      const options = assets
        .filter(a => a.mimetype === 'application/json' || jsonExt.test(a.filename))
        .map(a => ({ id: a.id, label: a.alias || a.filename }));

      return [
        m('.row', [
          m(
            '.col.s12.m4',
            m(TextInput, {
              id: 'title',
              initialValue: inject.title,
              onchange: (v: string) => {
                inject.title = v;
              },
              label: 'Title',
              iconName: 'title',
            })
          ),
          m(Select, {
            placeholder: subjects.length === 0 ? 'First create a subject' : 'Select a subject',
            className: 'col s6 m3',
            label: 'Subject',
            isMandatory: true,
            options: subjects,
            checkedId: pm.subjectId,
            onchange: (v: unknown) => (pm.subjectId = v as string),
          }),
          m(Select, {
            label: 'Asset',
            placeholder: 'Select a geojson file',
            className: 'col s6 m4',
            checkedId: pm.assetId,
            options,
            onchange: (v: unknown) => {
              const assetId = +(v as number);
              pm.assetId = assetId;
              const asset = assets.filter(a => a.id === assetId).shift();
              pm.alias = asset ? asset.alias : undefined;
            },
          }),
          m(FlatButton, {
            className: 'input-field col s6 m1',
            modalId: 'upload',
            iconName: 'file_upload',
          }),
        ]),
        m(TextArea, {
          id: 'desc',
          className: 'col s10 m11',
          initialValue: inject.description,
          onchange: (v: string) => (inject.description = v),
          label: 'Description',
          iconName: 'short_text',
        }),
        m(FlatButton, {
          className: 'input-field col s2 m1',
          iconName: pm.properties ? 'delete' : 'add',
          onclick: () => {
            if (pm.properties) {
              delete pm.properties;
            } else {
              pm.properties = {};
            }
          },
        }),
        pm.properties
          ? m(MapEditor, { label: 'Properties', iconName: 'dns', disallowArrays: true, properties: pm.properties })
          : undefined,
        m(ModalPanel, {
          id: 'upload',
          title: 'Upload a new GeoJSON file',
          description: m(UploadAsset, {
            accept: ['.json', '.geojson'],
            placeholder: '',
            assetUploaded: (a: IAsset) => {
              pm.assetId = a.id;
              const el = document.getElementById('upload');
              if (el) {
                M.Modal.getInstance(el).close();
              }
            },
          }),
          bottomSheet: true,
        }),
      ];
    },
  };
};
