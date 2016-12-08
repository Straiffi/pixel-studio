import React, { Component } from 'react';
import PixelEditor from './components/pixel-editor/js/PixelEditor';
import PNGImage from 'pnglib-es6';

import '../styles/App.css';

class App extends Component {
  save() {
    console.log(new PNGImage(100,100,256));
  }

  render() {
    this.save();
    return (
      <div>
        <div className="row center">
          <div className="six columns">
            <h2 style={{ userSelect: 'none' }}>Pixel Editor</h2>
          </div>
        </div>
        <div className="row center">
          <div className="three columns">
            <PixelEditor
              cellSize={16}
              gridSize={20}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
