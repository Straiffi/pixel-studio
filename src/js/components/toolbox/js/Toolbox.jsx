import React, { Component, PropTypes } from 'react';

export default class Toolbox extends Component {
  render() {
    return (
      <div className="row toolbox">
        <div className="twelve columns">
          <div className="colorpicker">
            <input type="color" name="colorpicker" id="colorpicker" onInput={() => {
              const color = document.getElementById('colorpicker').value;
              this.props.onColorChanged(color);
            }}/>
          </div>
          <span className={`toolbox-button no-select ${ this.props.pen ? 'selected' : '' } `} onClick={() => this.props.onToolChanged('pen')}>P</span>
          <span className={`toolbox-button no-select ${ this.props.eraser ? 'selected' : '' } `} onClick={() => this.props.onToolChanged('eraser')}>E</span>
        </div>
      </div>
    )
  }
}

Toolbox.PropTypes = {
  onColorChanged: PropTypes.func,
  onToolChanged: PropTypes.func,
  pen: PropTypes.bool,
  eraser: PropTypes.bool,
};

Toolbox.defaultProps = {
  pen: true,
  eraser: false,
};