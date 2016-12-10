import React, { Component, PropTypes } from 'react';

export default class ImageDownloader extends Component {
  render() {
    return(
      <div className="no-select">
        <div className="row center">
          <div className="two columns">
            <div>
              <img src={this.props.previewSrc} style={{ height: this.props.previewSize, width: this.props.previewSize, imageRendering: 'pixelated' }} alt="" />
              <br />
              <span>1x</span>
            </div>
            <div>
              <img src={this.props.previewSrc} style={{ height: this.props.previewSize * 2, width: this.props.previewSize * 2, imageRendering: 'pixelated' }} alt="" />
              <br />
              <span>2x</span>
            </div>
            <div>
              <img src={this.props.previewSrc} style={{ height: this.props.previewSize * 4, width: this.props.previewSize * 4, imageRendering: 'pixelated' }} alt="" />
              <br />
              <span>4x</span>
            </div>
          </div>
        </div>
        <div className="row center">
          <div className="six columns">
            <a className='button button-primary' download='pixels.png' href={this.props.previewSrc}><i className="icon-download"></i> Download </a>
          </div>
        </div>
      </div>
    )
  }
}

ImageDownloader.PropTypes = {
  previewSrc: PropTypes.string,
  previewSize: PropTypes.number,
};
