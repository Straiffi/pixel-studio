import React, { Component } from 'react';
import PixelEditor from './components/pixel-editor/js/PixelEditor';

import '../styles/App.css';

class App extends Component {
  render() {
    return (
      <div>
        <div className="row center">
          <div className="six columns">
            <h2 style={{ userSelect: 'none' }}>Pixel Editor</h2>
          </div>
        </div>
        <div className="row center">
          <div className="six columns center">
            <PixelEditor
              cellSize={20}
              gridSize={16}
              size={400}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
