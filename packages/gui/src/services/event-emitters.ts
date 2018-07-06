import { EventEmitter } from '../utils/event-emitter';

export const objectivesEmitter = new EventEmitter<{ parentId: string }>();
