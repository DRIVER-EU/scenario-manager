import { EventEmitter } from '../utils/event-emitter';
import { IObjective } from '../models/objective';

export const onObjective = new EventEmitter<{ parent?: IObjective, selected?: IObjective }>();
