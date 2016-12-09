import React, { Component, PropTypes } from 'react';
import PNGImage from 'pnglib';

import ImageDownloader from '../../image-downloader/js/ImageDownloader';
import Toolbox from '../../toolbox/js/Toolbox';

export default class PixelEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gridSize: props.gridSize,
      cellSize: props.cellSize,
      cells: [],
      color: '#000000',
      mousedown: false,
      pen: true,
      eraser: false,
    };

    document.onmouseup = () => this.onGridMouseUp();
  }

  componentDidMount() {
    this.createCells();
  }

  createPreviewUrl() {
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const p = new PNGImage(this.state.gridSize, this.state.gridSize, 256);
    p.color(0, 0, 0, 0);

    for (let i = 0; i < this.state.cells.length; i++) {
      const cell = this.state.cells[i];
      if (cell.background !== 'transparent') {
        const color = hexToRgb(cell.background);
        p.buffer[p.index(Math.floor(cell.x), Math.floor(cell.y))] = p.color(color.r, color.g, color.b);
      }
    }
    return `data:image/png;base64,${p.getBase64()}`;
  }

  createCells() {
    const cells = [];
    let offsetX = 0;
    let offsetY = 0;
    let top = 0;
    let left = 0;
    for (let i = 1; i < this.state.gridSize * this.state.gridSize + 1; i++) {
      cells.push({ id: i, x: offsetX, y: offsetY, top, left, background: 'transparent', size: this.state.cellSize });
      left += this.state.cellSize + 1;
      offsetX++;
      if (i % this.state.gridSize === 0) {
        top += this.state.cellSize + 1;
        left = 0;
        offsetX = 0;
        offsetY++;
      }
    }
    this.setState({ cells });
  }

  createGrid() {
    if (this.state.cells.length === 0) { return; }

    return this.state.cells.map((c) => {
      return (
        <div key={c.id} id={c.id} className="grid-cell" style={{
          backgroundColor: c.background,
          height: c.size,
          width: c.size,
          left: c.left,
          top: c.top
        }}
             onClick={() => this.onCellClick(c)}
             onMouseMove={() => this.onCellMouseMove(c)}>
        </div>
      );
    });
  }

  onGridMouseDown() {
    this.setState({ mousedown: true });
  }

  onGridMouseUp() {
    this.setState({ mousedown: false });
  }

  onCellMouseMove(cell) {
    if (!this.state.mousedown) { return; }
    this.onCellClick(cell)
  }

  onCellClick(cell) {
    cell.background = this.state.pen ? this.state.color : 'transparent';
    this.setState({ cells: this.state.cells });
  }

  onColorChanged(color) {
    this.setState({ color });
  }

  onToolChanged(tool) {
    let pen = false;
    let eraser = true;
    if (tool === 'pen') {
      pen = true;
      eraser = false;
    }
    this.setState({ pen, eraser });
  }

  render() {
    const grid = this.createGrid();
    const previewUrl = this.createPreviewUrl();
    return (
      <div>
        <div className="margin-bottom">
          <Toolbox
            onColorChanged={(color) => this.onColorChanged(color)}
            onToolChanged={(tool) => this.onToolChanged(tool)}
            pen={this.state.pen}
            eraser={this.state.eraser}
          />
        </div>
        <div style={{ height: this.props.size, width: this.props.size, overflow: 'scroll' }}>
          <div
            onMouseDown={() => this.onGridMouseDown()}
            onMouseUp={() => this.onGridMouseUp()}
            style={{ position: 'relative' }}>
            {grid}
          </div>
        </div>
        <ImageDownloader
          previewSrc={previewUrl}
          previewSize={32}
        />
      </div>
    );
  }
}

PixelEditor.propTypes = {
  gridSize: PropTypes.number.isRequired,
  cellSize: PropTypes.number.isRequired,
  size: PropTypes.number,
};

PixelEditor.defaultProps = {
  gridSize: 16,
  cellSize: 20,
  size: 400,
};