import m from 'mithril';

export type Updater = <M>(fx: (model: M) => M) => void;

const stream = <V>(initial?: V) => {
  const mapFunctions: Array<(value: V) => void> = [];
  const createdStream: { (value: V): void; map?: (mf: (m: V) => V) => void } = (value: V) => {
    for (const mf of mapFunctions) {
      mf(value);
    }
  };
  createdStream.map = (mapFunction: (value: V) => V) => {
    const newStream = initial !== undefined
      ? stream(mapFunction(initial))
      : stream();

    mapFunctions.push((value: V) => {
      newStream(mapFunction(value));
    });

    return newStream;
  };
  return createdStream;
};

const nestUpdate = <M extends { [key: string]: T }, T>(
  update: Updater,
  prop: string
) => (func: (f: T) => T) => {
  update((model: M) => {
    model[prop] = func(model[prop]);
    return model;
  });
};

const nest = <M extends { [key: string]: T }, T>(
  create: any,
  update: Updater,
  prop: string
) => {
  const component = create(nestUpdate(update, prop));
  const result = Object.assign({}, component);
  if (component.model) {
    result.model = () => {
      const initialModel = {} as { [key: string]: T };
      initialModel[prop] = component.model();
      return initialModel;
    };
  }
  if (component.view) {
    result.view = (model: M) => component.view(model[prop]);
  }
  return result;
};

// -- Application code

const convert = (value: number, to: 'C' | 'F') => to === 'C'
  ? Math.round((value - 32) / 9 * 5)
  : Math.round(value * 9 / 5 + 32);

const createTemperature = <M extends { value: number, units: 'C' | 'F' }>(label: string, init?: M) => {
  return (update: Updater) => {
    const increase = (amount: number) => {
      // tslint:disable-next-line:constiable-name
      return (_event: UIEvent) {
        // tslint:disable-next-line:no-shadowed-constiable
        update((model: M) => {
          model.value += amount;
          return model;
        });
      };
    };
    // tslint:disable-next-line:constiable-name
    const changeUnits = (_event: UIEvent) => {
      // tslint:disable-next-line:no-shadowed-constiable
      update((model: M) => {
        const newUnits = model.units === 'C' ? 'F' : 'C';
        model.value = convert(model.value, newUnits);
        model.units = newUnits;
        return model;
      });
    };

    const model = () => Object.assign({ value: 22, units: 'C' }, init);

    // tslint:disable-next-line:no-shadowed-constiable
    const view = (model: M) => {
      return m('div.temperature', [
        label,
        ' Temperature: ',
        model.value,
        m.trust('&deg;'),
        model.units,
        m(
          'div',
          m('button', { onclick: increase(1) }, 'Increase'),
          m('button', { onclick: increase(-1) }, 'Decrease')
        ),
        m('div', m('button', { onclick: changeUnits }, 'Change Units')),
      ]);
    };
    return { model, view };
  };
};

const createTemperaturePair = <M>(update: Updater) => {
  const air = nest(createTemperature('Air'), update, 'air');
  const water = nest(
    createTemperature('Water', { value: 84, units: 'F' }),
    update,
    'water'
  );

  const model = () => {
    return Object.assign(air.model(), water.model());
  };

  // tslint:disable-next-line:no-shadowed-constiable
  const view = (actualModel: M) => {
    return [air.view(actualModel), water.view(actualModel)];
  };
  return { model, view };
};

const createApp = (update: Updater) => nest(createTemperaturePair, update, 'temperatures');

// -- Meiosis pattern setup code

const updateStream = m.stream();
const app = createApp(updateStream);

const models = m.stream.scan(
  (model, func) => func(model),
  app.model(),
  updateStream
);

const element = document.getElementById('app') as HTMLElement;

models.map((model) {
  m.render(element, app.view(model));
});
