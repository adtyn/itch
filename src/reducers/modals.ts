import { reject } from "underscore";

import { IModalsState } from "../types";

import * as actions from "../actions";
import reducer from "./reducer";

const initialState: IModalsState = [];

export default reducer<IModalsState>(initialState, on => {
  on(actions.openModal, (state, action) => {
    const modal = action.payload;
    return [...state, modal];
  });

  on(actions.modalClosed, (state, action) => {
    const { id } = action.payload;
    return reject(state, modal => modal.id === id);
  });
});
