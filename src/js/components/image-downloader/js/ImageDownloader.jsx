import React, { Component, PropTypes } from 'react';

export default class ImageDownloader extends Component {
  render() {
    return(
      <div className="no-select margin-top">
        <div className="row center">
          <div className="twelve columns">
            <span>Preview</span>
            <div>
              <img src={this.props.previewSrc} className="pixelated" style={{ height: this.props.previewHeight, width: this.props.previewWidth }} alt="" />
              <br />
              <span>1x</span>
            </div>
            <div className="margin-top">
              <img src={this.props.previewSrc} className="pixelated" style={{ height: this.props.previewHeight * 2, width: this.props.previewWidth * 2 }} alt="" />
              <br />
              <span>2x</span>
            </div>
            <div className="margin-top">
              <img src={this.props.previewSrc} className="pixelated" style={{ height: this.props.previewHeight * 4, width: this.props.previewWidth * 4 }} alt="" />
              <br />
              <span>4x</span>
            </div>
          </div>
        </div>
            <a className='button button-primary' download='pixels.png' href={this.props.previewSrc}><i className="icon-download"></i> Download </a>
      </div>
    )
  }
}

ImageDownloader.PropTypes = {
  previewSrc: PropTypes.string,
  previewWidth: PropTypes.number,
  previewHeight: PropTypes.number,
};
