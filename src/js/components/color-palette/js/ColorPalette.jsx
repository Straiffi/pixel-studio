import React, { Component, PropTypes } from 'react';

const COLORS_PER_ROW = 5;

export default class ColorPalette extends Component {
  render() {
    const palette = this.props.colors.map((c, i) => {
      return (
        <div>
          <div key={i} className="palette-color" style={{ background: c }} title={c} onClick={() => this.props.onColorChanged(c)}></div>
        </div>
      )
    });
    return (
      <div>
        <div className={`palette ${palette.length !== 0 ? 'border' : ''}`}>
          {palette}
        </div>
      </div>
    );
  }
}

ColorPalette.PropTypes = {
  colors: PropTypes.array,
  onColorChanged: PropTypes.func,
};

ColorPalette.defaultProps = {
  colors: [],
};