import { EventEmitter } from './../utils/event-emitter';
import { createStore, combineReducers } from 'redux';
import * as reducers from './reducers';

const myApp = combineReducers(reducers);
export const store = createStore(myApp);

// PUB/SUB emitters

export const objectivesEmitter = new EventEmitter<{ parentId: string }>();
