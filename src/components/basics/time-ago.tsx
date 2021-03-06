import * as React from "react";

import { FormattedRelative } from "react-intl";

import { injectIntl, InjectedIntl } from "react-intl";
import { formatDate, DATE_FORMAT } from "../../format/datetime";

class TimeAgo extends React.PureComponent<IProps & IDerivedProps> {
  render() {
    const { intl } = this.props;
    let { date } = this.props;

    if (!date) {
      return <span />;
    }

    const type = typeof date;
    if (type === "string") {
      date = new Date(date as string);
    } else if (type === "object") {
      // already good
    } else {
      console.warn("TimeAgo wasn't passed a date: ", date);
      return <span />;
    }

    if (!(date as any).getTime || isNaN((date as any).getTime())) {
      console.warn("TimeAgo was passed an invalid date: ", this.props.date);
      return <span />;
    }

    return (
      <span data-rh={formatDate(date, intl.locale, DATE_FORMAT)}>
        <FormattedRelative value={date} />
      </span>
    );
  }
}

interface IProps {
  date: Date | string;
}

interface IDerivedProps {
  intl: InjectedIntl;
}

export default injectIntl(TimeAgo);
