import React, { Component, PropTypes } from 'react';

export default class Toolbox extends Component {
  render() {
    return (
      <div className="toolbox">
        <div className="row">
          <div className="three columns">
            <label htmlFor="opacity">Opacity <span>{this.props.opacity} %</span></label><br/>
            <input type="range" id="opacity" name="opacity" min="1" max="100" defaultValue="100" onChange={() => {
              const opacity = document.getElementById('opacity').value;
              this.props.onOpacityChanged(opacity);
            }} />
          </div>
        </div>
        <div className="row">
          <div className="twelve columns">
            <input type="color" name="colorpicker" id="colorpicker" style={{ display: 'none' }} onInput={() => {
              const color = document.getElementById('colorpicker').value;
              this.props.onColorChanged(color);
            }}
            onClick={() => {
              document.getElementById('colorpicker').value = this.props.activeColor;
            }}/>
            <label htmlFor="colorpicker" className="no-select color-preview"><span style={{ background: this.props.activeColor, color: '#fff' }} className="toolbox-button" title="Color">Color</span></label>
            <span className={`toolbox-button no-select ${ this.props.pen ? 'selected' : '' } `} onClick={() => this.props.onToolChanged('pen')} title="Pencil"><i className="icon-pencil"></i></span>
            <span className={`toolbox-button no-select ${ this.props.bucket ? 'selected' : '' } `} onClick={() => this.props.onToolChanged('bucket')} title="Fill"><i className="icon-bucket"></i></span>
            <span className={`toolbox-button no-select ${ this.props.eraser ? 'selected' : '' } `} onClick={() => this.props.onToolChanged('eraser')} title="Eraser"><i className="icon-eraser"></i></span>
            <span className={`toolbox-button no-select ${ this.props.eyedropper ? 'selected' : '' } `} onClick={() => this.props.onToolChanged('eyedropper')} title="Eyedropper" style={{ marginRight: 20 }}>
            <i className="icon-eyedropper"></i>
          </span>

            <span className={'toolbox-button no-select'} onClick={() => this.props.onUndo()} title="Undo"><i className="icon-ccw"></i></span>
            <span className={'toolbox-button no-select'} onClick={() => this.props.onRedo()} title="Redo"><i className="icon-cw"></i></span>
            <span className={'toolbox-button no-select'} onClick={() => this.props.onZoomIn()} title="Zoom in"><i className="icon-zoom-in"></i></span>
            <span className={'toolbox-button no-select'} onClick={() => this.props.onZoomOut()} title="Zoom out"><i className="icon-zoom-out"></i></span>
          </div>
        </div>
        <div className="row">
          <span style={{ fontSize: 13 }}>keyboard shortcuts:</span>
          <div className="twelve columns">
            <div style={{ fontSize: 11 }}>
              <i className="icon-left-big"></i>
              <i className="icon-right-big"></i>
              <i className="icon-up-big"></i>
              <i className="icon-down-big"></i>
              <span>move canvas</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Toolbox.PropTypes = {
  onColorChanged: PropTypes.func,
  onOpacityChanged: PropTypes.func,
  onToolChanged: PropTypes.func,
  onZoomIn: PropTypes.func,
  onZoomOut: PropTypes.func,
  onUndo: PropTypes.func,
  onRedo: PropTypes.func,
  pen: PropTypes.bool,
  eraser: PropTypes.bool,
  bucket: PropTypes.bool,
  activeColor: PropTypes.string,
};

Toolbox.defaultProps = {
  pen: true,
  eraser: false,
  bucket: false,
  eyedropper: false,
};