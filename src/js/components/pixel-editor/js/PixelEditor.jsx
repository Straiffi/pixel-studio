import React, { Component, PropTypes } from 'react';
import PNGImage from 'pnglib';

import ImageDownloader from '../../image-downloader/js/ImageDownloader';
import Toolbox from '../../toolbox/js/Toolbox';

const MAX_ZOOM = 60;
const MIN_ZOOM = 10;

export default class PixelEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gridSize: props.gridSize,
      cellSize: props.cellSize,
      cells: [],
      history: [],
      future: [],
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

  createCells(size) {
    const cells = [];
    const currentCells = this.state.cells;
    const cellSize = size ? size : this.state.cellSize;
    let offsetX = 0;
    let offsetY = 0;
    let top = 0;
    let left = 0;
    for (let i = 1; i < this.state.gridSize * this.state.gridSize + 1; i++) {
      const oldCell = currentCells.find((c) => c.id === i);
      cells.push({ id: i, x: offsetX, y: offsetY, top, left, background: (oldCell ? oldCell.background : 'transparent'), size: cellSize });
      left += cellSize + 1;
      offsetX++;
      if (i % this.state.gridSize === 0) {
        top += cellSize + 1;
        left = 0;
        offsetX = 0;
        offsetY++;
      }
    }
    this.setState({ cells, cellSize });
  }

  createGrid() {
    if (this.state.cells.length === 0) { return; }

    return this.state.cells.map((c) => {
      return (
        <div key={c.id} id={c.id} className="grid-cell no-select" style={{
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
    const currentCells = JSON.parse(JSON.stringify(this.state.cells));
    this.state.history.push(currentCells);
    this.setState({ mousedown: true, future: [] });
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

  onZoomIn() {
    if (this.state.cellSize >= MAX_ZOOM) { return; }
    const cellSize = this.state.cellSize + 10;
    this.createCells(cellSize);
  }

  onZoomOut() {
    if (this.state.cellSize <= MIN_ZOOM) { return; }
    const cellSize = this.state.cellSize - 10;
    this.createCells(cellSize);
  }

  onUndo() {
    const cells = this.state.history[this.state.history.length - 1];
    if (cells && cells.length !== 0) {
      this.state.future.push(JSON.parse(JSON.stringify(this.state.cells)));
      this.state.history.splice(this.state.history.length - 1, 1);
      this.state.cells.forEach((c, i) => c.background = cells[i].background);
      this.setState({ cells: this.state.cells });
    }
  }

  onRedo() {
    const cells = this.state.future[this.state.future.length - 1];
    if (cells && cells.length !== 0) {
      this.state.history.push(JSON.parse(JSON.stringify(this.state.cells)));
      this.state.future.splice(this.state.future.length - 1, 1);
      this.state.cells.forEach((c, i) => c.background = cells[i].background);
      this.setState({ cells: this.state.cells });
    }
  }

  render() {
    const grid = this.createGrid();
    const previewUrl = this.createPreviewUrl();
    return (
      <div>
        <div className="row">
          <div className="ten columns center">
            <div className="margin-bottom">
              <Toolbox
                onColorChanged={(color) => this.onColorChanged(color)}
                onToolChanged={(tool) => this.onToolChanged(tool)}
                onZoomIn={() => this.onZoomIn()}
                onZoomOut={() => this.onZoomOut()}
                onUndo={() => this.onUndo()}
                onRedo={(cells) => this.onRedo(cells)}
                pen={this.state.pen}
                eraser={this.state.eraser}
                activeColor={this.state.color}
              />
            </div>
          </div>
        </div>
        <div className="row center">
          <div className="offset-by-one seven columns center">
            <div style={{ height: this.props.size, width: this.props.size, overflow: 'scroll' }}>
              <div
                onMouseDown={() => this.onGridMouseDown()}
                onMouseUp={() => this.onGridMouseUp()}
                style={{ position: 'relative' }}>
                {grid}
              </div>
            </div>
          </div>
          <div className="two columns">
            <ImageDownloader
              previewSrc={previewUrl}
              previewSize={this.state.gridSize}
            />
          </div>
        </div>
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