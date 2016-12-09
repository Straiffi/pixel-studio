import React, { Component, PropTypes } from 'react';

export default class Toolbox extends Component {
  render() {
    return (
      <div className="row">
        <div className="six columns">
          <div className="colorpicker">
            <input type="color" name="colorpicker" id="colorpicker" onInput={() => {
              const color = document.getElementById('colorpicker').value;
              this.props.onColorChanged(color);
            }}/>
          </div>
        </div>
      </div>
    )
  }
}

Toolbox.PropTypes = {
  onColorChanged: PropTypes.func,
};