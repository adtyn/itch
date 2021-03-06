import * as React from "react";

import env from "../env";

import { pathPrefix, pathSuffix, pathToId } from "../util/navigation";
import urls from "../constants/urls";

import { IMeatProps } from "./meats/types";

import BrowserMeat, { ControlsType } from "./browser-meat";
import * as querystring from "querystring";

const emptyObj = {};

export default class UrlMeat extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super();
    this.state = {
      active: props.visible || !props.tabData.restored,
    };
  }

  render() {
    const { active } = this.state;
    if (!active) {
      return null;
    }

    const { tab } = this.props;
    const { url, controls } = this.getUrlAndControls();

    return (
      <BrowserMeat
        url={url}
        tab={tab}
        {...this.props as any}
        controls={controls}
      />
    );
  }

  getUrlAndControls(): IUrlAndControls {
    const { tab, tabData, tabPath } = this.props;

    const tabUrl = tabData.url;

    switch (tab) {
      case "featured":
        if (env.name === "test") {
          return { url: "about:blank", controls: "generic" };
        } else {
          return { url: urls.itchio + "/", controls: "generic" };
        }
      default:
        const prefix = pathPrefix(tabPath);
        const id = pathToId(tabPath);
        switch (prefix) {
          case "url":
            return { url: pathSuffix(tabPath), controls: "generic" };
          case "users":
            const users = tabData.users || emptyObj;
            const user = users[id];
            if (user) {
              return { url: tabUrl || user.url, controls: "generic" };
            } else {
              return { url: tabUrl, controls: "generic" };
            }
          case "games":
            const games = tabData.games || emptyObj;
            const game = games[id];
            if (game) {
              return { url: tabUrl || game.url, controls: "game" };
            } else {
              return { url: tabUrl, controls: "generic" };
            }
          case "search":
            const url =
              urls.itchio + "/search?" + querystring.stringify({ q: id });
            return { url, controls: "generic" };
          default:
            return { url: tabUrl || "about:blank", controls: "generic" };
        }
    }
  }

  componentWillReceiveProps(props: IProps) {
    if (props.visible && !this.state.active) {
      this.setState({
        active: true,
      });
    }
  }
}

interface IUrlAndControls {
  url: string;
  controls: ControlsType;
}

interface IProps extends IMeatProps {}

interface IState {
  active: boolean;
}
