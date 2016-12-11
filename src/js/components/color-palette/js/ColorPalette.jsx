import React, { Component, PropTypes } from 'react';

export default class ColorPalette extends Component {
  render() {
    const palette = this.props.colors.map((c, i) => {
      return c !== 'transparent' ? (
        <div key={i} className="palette-color" style={{ background: c }} title={c} onClick={() => this.props.onColorChanged(c)}></div>
      ) : null;
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