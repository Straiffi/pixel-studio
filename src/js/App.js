import React, { Component, PropTypes } from 'react';
import PixelEditor from './components/pixel-editor/js/PixelEditor';
import Modal from './components/modal/js/Modal';
import { rgbToHex } from './utils/image-utils';

import '../styles/App.css';
import '../fonts/fontello/css/icons.css';

const MIN_GRIDSIZE = 4;
const MAX_GRIDSIZE = 64;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gridWidth: this.props.gridWidth,
      gridHeight: this.props.gridHeight,
      newImage: false,
      newImageModal: false,
      uploadedImage: null,
    };
  }

  newImage(size) {
    let width;
    let height;
    if (size) {
      width = size.width;
      height = size.height;
    } else {
      width = parseInt(document.getElementById('widthSelector').value, 10);
      height = parseInt(document.getElementById('heightSelector').value, 10);
    }
    this.setState({ gridWidth: width, gridHeight: height, newImage: true, newImageModal: false });
  }

  toggleNewImageModal(visible) {
    this.setState({ newImageModal: visible, newImage: false });
  }

  createGridSizeSelector() {
    const validateInput = (e) => {
      const value = e.currentTarget.value;
      if (value < MIN_GRIDSIZE) {
        e.currentTarget.value = MIN_GRIDSIZE;
      }
      if (value > MAX_GRIDSIZE) {
        e.currentTarget.value = MAX_GRIDSIZE;
      }
    };
    return (
      <div>
        <span>Select a size between {MIN_GRIDSIZE} and {MAX_GRIDSIZE}</span>
        <div className="row">
          <div className="five columns">
            <span>Width: </span>
            <input type="number" id="widthSelector" min={MIN_GRIDSIZE} max={MAX_GRIDSIZE} maxLength="2" defaultValue="16" onBlur={(e) => validateInput(e)} style={{ width: 70 }}/>
          </div>
        </div>
        <div className="row">
          <div className="five columns">
            <span>Height: </span>
            <input type="number" id="heightSelector" min={MIN_GRIDSIZE} max={MAX_GRIDSIZE} maxLength="2" defaultValue="16" onBlur={(e) => validateInput(e)} style={{ width: 70 }}/>
          </div>
        </div>
        <br/>
        <span className="warning-text">All changes to the current image will be lost.</span>
      </div>
    );
  }

  onFileUpload() {
    const input = document.getElementById('fileselector');
    const file = input.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const img = new Image();
      const canvas = document.createElement('canvas');

      img.src = reader.result;
      if (img.width > MAX_GRIDSIZE || img.height > MAX_GRIDSIZE) { return; } // TODO: implement error message
      canvas.width = img.width;
      canvas.height = img.height;

      const context = canvas.getContext('2d');
      context.drawImage(img, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const cells = [];

      for (let i = 0, n = data.length; i < n; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const alpha = data[i + 3];
        const hex = alpha !== 0 ? rgbToHex(`rgba(${red}, ${green}, ${blue}, ${alpha})`) : 'transparent';
        cells.push({ id: (i !== 0 ? (i / 4) : i), color: hex});
      }
      this.setState({ uploadedImage: cells, gridWidth: canvas.width, gridHeight: canvas.height });
    };

    if (file) {
      if (file.type !== 'image/png') { return; }
      reader.readAsDataURL(file);
    }
  }

  render() {
    const newImageModal = this.state.newImageModal ? (
      <Modal
        height={250}
        title={'New image'}
        body={this.createGridSizeSelector()}
        positiveText={'OK'}
        negativeText={'Cancel'}
        positiveCallback={(size) => this.newImage(size)}
        dismissCallback={(visible) => this.toggleNewImageModal(visible)}
      />
    ) : null;
    return (
      <div>
        <div className="row center">
          <div className="ten columns">
            <h2 style={{ userSelect: 'none' }}>Pixel Studio</h2>
          </div>
          <div className="two columns">
            <a href="https://github.com/Straiffi/pixel-studio" title="View on GitHub" target="_blank"><i className="icon-github-circled" style={{ color: '#000', fontSize: 45 }}></i></a>
          </div>
        </div>
        <div className="row center margin-bottom">
          <div className="seven columns">
            <a style={{ cursor: 'pointer' }} onClick={() => this.toggleNewImageModal(true)}><i className="icon-plus-circled"></i> New image</a>
            <input type="file" name="fileselector" id="fileselector" style={{ display: 'none' }} onChange={(e) => this.onFileUpload(e)}/>
            <label htmlFor="fileselector">
              <a style={{ cursor: 'pointer' }}><i className="icon-upload"></i> Open</a>
            </label>
          </div>
        </div>
        <PixelEditor
          size={700}
          cellSize={20}
          gridWidth={this.state.gridWidth}
          gridHeight={this.state.gridHeight}
          newImage={this.state.newImage}
          cells={this.state.uploadedImage}
        />
        {newImageModal}
      </div>
    );
  }
}

App.PropTypes = {
  gridWidth: PropTypes.number,
  gridHeight: PropTypes.number,
};

App.defaultProps = {
  gridWidth: 16,
  gridHeight: 16,
};
