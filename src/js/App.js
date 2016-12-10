import React, { Component } from 'react';
import PixelEditor from './components/pixel-editor/js/PixelEditor';

import '../styles/App.css';
import '../fonts/fontello/css/icons.css';

class App extends Component {
  render() {
    return (
      <div>
        <div className="row center">
          <div className="six columns">
            <h2 style={{ userSelect: 'none' }}>Pixel Studio</h2>
          </div>
        </div>
          <PixelEditor
            size={700}
            cellSize={20}
            gridSize={16}
          />
      </div>
    );
  }
}

export default App;
