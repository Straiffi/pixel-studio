import React, { Component, PropTypes } from 'react';

export default class ImageDownloader extends Component {
  render() {
    return(
      <div>
        <div className="row center">
          <div className="six columns">
            <img src={this.props.previewSrc} style={{ height: this.props.previewSize, width: this.props.previewSize, imageRendering: 'pixelated' }} alt="" />
          </div>
        </div>
        <div className="row center">
          <div className="six columns">
            <a className='button button-primary' download='pixels.png' href={this.props.previewSrc}> Download </a>
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
