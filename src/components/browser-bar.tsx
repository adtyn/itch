import * as React from "react";
import * as classNames from "classnames";

import BrowserControls from "./browser-controls";

import { IBrowserControlProperties } from "./browser-state";

import styled, * as styles from "./styles";

const BrowserBarDiv = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  padding: 5px 0 4px 4px;
  background: ${props => props.theme.breadBackground};
  transition: all .2s;
  min-height: 32px;

  border-width: 0;
  border-bottom-width: 2px;
  border-image-source: repeating-linear-gradient(
    to right,
    #353535 0,
    #353535 95%,
    transparent 95%,
    transparent 100%
  );

  &.loading {
    border-image-source: repeating-linear-gradient(
      to right,
      ${props => props.theme.lightAccent} 0,
      ${props => props.theme.lightAccent} 95%,
      transparent 95%,
      transparent 100%
    );
    animation: ${styles.animations.loadBorder} 10s cubic-bezier(0, 0, 0, 0.42)
      infinite;
  }

  border-image-slice: 100% 10% 0% 0%;
  border-bottom: 2px solid;

  display: flex;
  flex-direction: row;
  align-items: center;
`;

export class BrowserBar extends React.PureComponent<IProps> {
  render() {
    const { browserState } = this.props;
    const { loading } = browserState;

    return (
      <BrowserBarDiv className={classNames({ loading })}>
        <BrowserControls {...this.props} />
      </BrowserBarDiv>
    );
  }
}

interface IProps extends IBrowserControlProperties {}

export default BrowserBar;
