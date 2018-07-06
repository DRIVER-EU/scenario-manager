import { createStore, combineReducers } from 'redux';
import * as reducers from './reducers';

const myApp = combineReducers(reducers);
export const store = createStore(myApp);
