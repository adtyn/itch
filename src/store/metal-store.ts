if (process.type !== "browser") {
  throw new Error("metal store required from chrome");
}

import {
  createStore,
  applyMiddleware,
  compose,
  GenericStoreEnhancer,
  Store,
} from "redux";
import { electronEnhancer } from "ftl-redux-electron-store";

import route from "../reactors/route";
import getWatcher from "../reactors";
import reducer from "../reducers";
import db from "../db";

import { IStore } from "../types";

const crashGetter = (store: Store<any>) => (next: (action: any) => any) => (
  action: any,
) => {
  try {
    if (action && !action.type) {
      throw new Error(
        `refusing to dispatch action with null type: ${JSON.stringify(action)}`,
      );
    }
    return next(action);
  } catch (e) {
    /* tslint:disable:no-console */
    console.log(`Uncaught redux: for action ${action.type}: ${e.stack}`);
  }
};

const middleware = [crashGetter];

const beChatty = process.env.MARCO_POLO === "1";

if (beChatty) {
  const createLogger = require("redux-cli-logger").default;
  const logger = createLogger({
    predicate: (getState: () => any, action: any) => {
      return (
        !action.MONITOR_ACTION &&
        !/^WINDOW_/.test(action.type) &&
        !/_DB_/.test(action.type) &&
        !/LOCALE_/.test(action.type) &&
        !/_DATAPOINT$/.test(action.type) &&
        action.type !== "TASK_PROGRESS"
      );
    },
    stateTransformer: (state: any) => "",
    actionTransformer: (action: any) => {
      if (/_FETCHED$/.test(action.type)) {
        return {
          type: action.type,
          payload: { redacted: "true" },
        };
      } else {
        return action;
      }
    },
  });

  middleware.push(logger);
}

const watcher = getWatcher(db);

const enhancer = compose(
  electronEnhancer({
    postDispatchCallback: (action: any) => {
      route(watcher, store, action);
    },
  }),
  applyMiddleware(...middleware),
) as GenericStoreEnhancer;

const initialState = {};
const store = createStore(reducer, initialState, enhancer) as IStore;
route(watcher, store, { type: "__MOUNT", payload: null });

export default store;
