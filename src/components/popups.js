import React from 'react'
import PropTypes from 'prop-types'

export default class Popups extends React.Component {

  static propTypes = {
    features: PropTypes.array.isRequired
  };

  render() {
    const { features } = this.props;

    const renderFeature = (feature, i) => {
      return (
        <div key={i}>
          <strong>{feature.properties['TYPE']} ({feature.properties['DAY']}/{feature.properties['MONTH']}/{feature.properties['YEAR']})</strong>
        </div>
      )
    };

    return (
      <div className="flex-parent-inline flex-parent--center-cross flex-parent--column absolute bottom">
        <div className="popup flex-child px12 py12 shadow-darken10 round txt-s w400 clip txt-truncate">
          {features.map(renderFeature)}
        </div>
        <span className="popup-triangle flex-child triangle triangle--d"></span>
      </div>
    );
  }
}
