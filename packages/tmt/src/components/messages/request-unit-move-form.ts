import m from 'mithril';
import { ISelectOptions, Select, TextArea, TextInput } from 'mithril-materialized';
import { getMessage, IInject, MessageType, IRequestMove, MoveType, ILocation } from 'trial-manager-models';
import { LeafletMap } from 'mithril-leaflet';
import { LineString, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { geoJSON, GeoJSON } from 'leaflet';
import { geoJSONtoRoute, getActiveTrialInfo, isJSON, routeToGeoJSON, baseLayers } from '../../utils';
import { MessageComponent } from '../../services';

export const RequestUnitMoveForm: MessageComponent = () => {
  let overlays: { [key: string]: GeoJSON } = {};

  const setTitle = async (inject: IInject, si: IRequestMove) => {
    const newTitle = `Send ${si.entities.join(', ')} to ${si.destination}`;
    inject.title = newTitle;
  };

  const moveUnitLayer = 'MOVE_UNIT';

  return {
    oninit: async ({ attrs: {
      state,
      actions: { updateInject }
    } }) => {
      const { owner, assets } = state.app;
      const { inject } = getActiveTrialInfo(state);
      if (!inject) return;
      const ut = getMessage<IRequestMove>(inject, MessageType.REQUEST_UNIT_MOVE);
      if (!ut.applicant) ut.applicant = owner;
      if (!ut.moveType) ut.moveType = MoveType.OnlyRoads;
      if (!ut.waypoints) ut.waypoints = [];
      const route = ut.waypoints ? routeToGeoJSON(ut.waypoints) : undefined;
      overlays[moveUnitLayer] = route || geoJSON();
      const jsonAssets = assets.filter((a) => a.url && isJSON(a.filename));
      for (const asset of jsonAssets) {
        const result = await m.request<FeatureCollection<Geometry, GeoJsonProperties>>(asset.url as string);
        if (result) {
          overlays[asset.alias || asset.filename] = geoJSON(result);
        }
      }
      updateInject(inject);
    },
    view: ({
      attrs: {
        state,
        actions: { updateInject },
        options: { editing } = { editing: true },
      },
    }) => {
      const { inject } = getActiveTrialInfo(state);
      if (!inject) return;
      const disabled = !editing;
      const ut = getMessage<IRequestMove>(inject, MessageType.REQUEST_UNIT_MOVE);
      const addWaypoints = (r: ILocation[]) => {
        const { inject: inj } = getActiveTrialInfo(state);
        if (inj) {
          const m = getMessage<IRequestMove>(inj, MessageType.REQUEST_UNIT_MOVE);
          m.waypoints = r;
          updateInject(inj);
        }
      };
      return [
        m(TextInput, {
          disabled,
          className: 'col s6',
          label: 'Unit ID',
          iconName: 'title',
          isMandatory: true,
          helperText: 'Name of the unit(s) that must be transported.',
          initialValue: ut.entities ? ut.entities.join(', ') : '',
          onchange: async (v) => {
            ut.entities = v.split(',').map((s) => s.trim());
            await setTitle(inject, ut);
            updateInject(inject);
          },
        }),
        m(TextInput, {
          disabled,
          className: 'col s6',
          label: 'Unit type',
          iconName: 'directions_car',
          isMandatory: false,
          // ('DEFAULT_BIKETYPE', 'DEFAULT_PEDTYPE', 'DEFAULT_VEHTYPE', 'bike_bicycle', 'bus_bus', 'emergency',
          // 'ped_pedestrian', 'rail_rail', 'tram_tram', 'truck_truck', 'veh_passenger')
          helperText: 'Unit type, e.g. emergency, bus_bus, truck_truck, tram_tram, veh_passenger or bike_bicycle.',
          initialValue: ut.tags && ut.tags.hasOwnProperty('unit') ? ut.tags.unit : undefined,
          onchange: async (v) => {
            if (!ut.tags) {
              ut.tags = {};
            }
            ut.tags.unit = v;
            await setTitle(inject, ut);
            updateInject(inject);
          },
        }),
        m(Select, {
          label: 'Move type',
          initialValue: ut.moveType,
          iconName: 'add_road',
          className: 'col s6',
          options: [
            { id: MoveType.OnlyRoads, label: 'Only roads' },
            { id: MoveType.CrossCountry, label: 'Cross country' },
            { id: MoveType.RoadsAndCrossCountry, label: 'Roads and cross country' },
            { id: MoveType.Straight, label: 'Straight line' },
          ],
          onchange: v => {
            ut.moveType = v[0] as MoveType;
          }
        } as ISelectOptions<string>),
        m(TextInput, {
          disabled,
          className: 'col s6',
          label: 'Destination',
          iconName: 'store',
          isMandatory: true,
          helperText: 'Name of the station where you want to go.',
          initialValue: ut.destination,
          onchange: async (v) => {
            ut.destination = v;
            await setTitle(inject, ut);
            updateInject(inject);
          },
        }),
        m(LeafletMap, {
          baseLayers,
          autoFit: ut.waypoints && ut.waypoints.length > 0,
          style: 'width: 100%; height: 400px; margin-top: 10px;',
          overlays,
          visible: [moveUnitLayer],
          editable: [moveUnitLayer],
          showScale: { imperial: false },
          onLayerEdited: (f) => {
            const geojson = f.toGeoJSON() as FeatureCollection<LineString>;
            const r = geoJSONtoRoute(geojson);
            r && addWaypoints(r);
          },
        }),
        m(TextArea, {
          disabled,
          id: 'desc',
          initialValue: inject.description,
          onchange: (v: string) => {
            inject.description = v;
            updateInject(inject);
          },
          label: 'Description',
          iconName: 'description',
        }),
      ];
    },
  };
};
