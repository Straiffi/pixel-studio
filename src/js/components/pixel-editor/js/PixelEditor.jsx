import React, { Component, PropTypes } from 'react';
import PNGImage from 'pnglib';
import _ from 'lodash';

import ImageDownloader from '../../image-downloader/js/ImageDownloader';
import Toolbox from '../../toolbox/js/Toolbox';
import ColorPalette from '../../color-palette/js/ColorPalette';

const MAX_ZOOM = 60;
const MIN_ZOOM = 10;

export default class PixelEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gridWidth: props.gridWidth,
      gridHeight: props.gridHeight,
      cellSize: props.cellSize,
      cells: [],
      history: [],
      future: [],
      paletteColors: [],
      color: '#000000',
      mousedown: false,
      pen: true,
      eraser: false,
      bucket: false,
      eyedropper: false,
    };

    window.onbeforeunload =  (e) => {
      e.preventDefault();
      if (this.state.paletteColors.length !== 0) { // Palette doesn't have any colors if the image hasn't been modified.
        return e.returnValue = '';
      }
    };

    document.onmouseup = () => this.onGridMouseUp();
    this.onCellMouseMoveThrottled = _.throttle(this.onCellMouseMove, 20);
  }

  componentDidMount() {
    this.createCells();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.gridWidth !== this.state.gridWidth || newProps.gridHeight !== this.state.gridHeight || newProps.newImage === true) {
      this.createCells(this.state.cellSize, newProps.gridWidth, newProps.gridHeight, true);
    }
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

    const p = new PNGImage(this.state.gridWidth, this.state.gridHeight, 256);
    p.color(0, 0, 0, 0);

    for (let i = 0; i < this.state.cells.length; i++) {
      const cell = this.state.cells[i];
      if (cell.color !== 'transparent') {
        const color = hexToRgb(cell.color);
        p.buffer[p.index(Math.floor(cell.x), Math.floor(cell.y))] = p.color(color.r, color.g, color.b);
      }
    }
    return `data:image/png;base64,${p.getBase64()}`;
  }

  createCells(size, width, height, clear = false) {
    const cells = [];
    const currentCells = this.state.cells;
    const cellSize = size ? size : this.state.cellSize;
    const gridWidth = width ? width : this.state.gridWidth;
    const gridHeight = height ? height : this.state.gridHeight;
    let offsetX = 0;
    let offsetY = 0;
    let top = 0;
    let left = 0;
    for (let i = 1; i < gridWidth * gridHeight + 1; i++) {
      const id = i - 1;
      const oldCell = currentCells.find((c) => c.id === id);
      const color = oldCell && oldCell.color && !clear ? oldCell.color : 'transparent';
      cells.push({ id, x: offsetX, y: offsetY, top, left, color, size: cellSize });
      left += cellSize + 1;
      offsetX++;
      if (i % gridWidth === 0) {
        top += cellSize + 1;
        left = 0;
        offsetX = 0;
        offsetY++;
      }
    }

    const newState = {
      cells,
      cellSize,
      gridWidth,
      gridHeight,
      paletteColors: this.getPaletteColors(cells),
    };
    if (clear) {
      newState.history = [];
      newState.future = [];
    }
    this.setState(newState);
  }

  createGrid() {
    if (this.state.cells.length === 0) { return; }

    return this.state.cells.map((c) => {
      return (
        <div key={c.id} id={c.id} className="grid-cell no-select" style={{
          backgroundColor: c.color,
          height: c.size,
          width: c.size,
          left: c.left,
          top: c.top
        }}
             onMouseUp={() => this.onCellClick(c)}
             onMouseMove={() => this.onCellMouseMoveThrottled(c)}>
        </div>
      );
    });
  }

  getPaletteColors(cells) {
    const colors = [];
    const currentCells = cells ? cells : this.state.cells;
    currentCells.forEach((c) => {
      if (c.color !== 'transparent' && !colors.includes(c.color)) {
        colors.push(c.color);
      }
    });
    return colors;
  }

  fill(startCell) {
    const pixelStack = [[startCell.x, startCell.y]];
    const startColor = startCell.color;
    if (startColor === this.state.color) { return; }

    const matchPixel = (id) => this.state.cells.find((c) => c.id === id);
    const matchPixelByCoord = (x, y) => this.state.cells.find((c) => c.x === x && c.y === y);

    const matchStartColor = (id) => {
      const pixel = matchPixel(id);
      return pixel.color === startColor;
    };

    const colorPixel = (id) => {
      const pixel = matchPixel(id);
      pixel.color = this.state.color;
    };

    while(pixelStack.length !== 0) {
      let newPos;
      let x;
      let y;
      let pixelPos;
      let reachLeft;
      let reachRight;
      newPos = pixelStack.pop();
      x = newPos[0];
      y = newPos[1];

      pixelPos = matchPixelByCoord(x, y).id;
      while (y-- >= 0 && matchStartColor(pixelPos)) {
        pixelPos -= this.state.gridWidth;
      }
      pixelPos += this.state.gridWidth;
      y++;
      reachLeft = false;
      reachRight = false;

      while (y++ < this.state.gridHeight - 1 && matchStartColor(pixelPos)) {
        colorPixel(pixelPos);

        if (x > 0) {
          if (matchStartColor(pixelPos - 1)) {
            if (!reachLeft) {
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          }
          else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (x < this.state.gridWidth - 1) {
          if (matchStartColor(pixelPos + 1)) {
            if (!reachRight) {
              pixelStack.push([x + 1, y]);
              reachRight = true;
            }
          }
          else if(reachRight) {
            reachRight = false;
          }
        }
        pixelPos += this.state.gridWidth;
      }
    }
    this.setState({ cells: this.state.cells });
  }

  onGridMouseDown() {
    const currentCells = JSON.parse(JSON.stringify(this.state.cells));
    this.state.history.push(currentCells);
    this.setState({ mousedown: true, future: [] });
  }

  onGridMouseUp() {
    this.setState({ mousedown: false, paletteColors: this.getPaletteColors() });
  }

  onCellMouseMove(cell) {
    if (!this.state.mousedown || this.state.bucket) { return; }
    this.onCellClick(cell)
  }

  onCellClick(cell) {
    if (this.state.pen || this.state.eraser) {
      cell.color = this.state.pen ? this.state.color : 'transparent';
      this.setState({ cells: this.state.cells });
    }

    if (this.state.bucket) {
      this.fill(cell);
    }

    if (this.state.eyedropper) {
      if (cell.color !== 'transparent') {
        this.setState({ color: cell.color });
      }
    }
  }

  onColorChanged(color) {
    this.setState({ color });
  }

  onToolChanged(tool) {
    let pen = false;
    let eraser = false;
    let bucket = false;
    let eyedropper = false;
    switch(tool) {
      case 'pen':
        pen = true;
        break;
      case 'eraser':
        eraser = true;
        break;
      case 'bucket':
        bucket = true;
        break;
      case 'eyedropper':
        eyedropper = true;
        break;
      default:
        pen = true;
        break;
    }
    this.setState({ pen, eraser, bucket, eyedropper });
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
      this.state.cells.forEach((c, i) => c.color = cells[i].color);
      this.setState({ cells: this.state.cells, paletteColors: this.getPaletteColors() });
    }
  }

  onRedo() {
    const cells = this.state.future[this.state.future.length - 1];
    if (cells && cells.length !== 0) {
      this.state.history.push(JSON.parse(JSON.stringify(this.state.cells)));
      this.state.future.splice(this.state.future.length - 1, 1);
      this.state.cells.forEach((c, i) => c.color = cells[i].color);
      this.setState({ cells: this.state.cells, paletteColors: this.getPaletteColors() });
    }
  }

  render() {
    const grid = this.createGrid();
    const previewUrl = this.createPreviewUrl();
    return (
      <div>
        <div className="row">
          <div className="ten columns">
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
                bucket={this.state.bucket}
                eyedropper={this.state.eyedropper}
                activeColor={this.state.color}
              />
            </div>
          </div>
          <div className="two columns">
            <ColorPalette
              colors={this.state.paletteColors}
              onColorChanged={(color) => this.onColorChanged(color)}
            />
          </div>
        </div>
        <div className="row">
          <div className="ten columns center">
            <div style={{ height: '70vh', width: '70vw', overflow: 'scroll' }}>
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
              previewWidth={this.state.gridWidth}
              previewHeight={this.state.gridHeight}
            />
          </div>
        </div>
      </div>
    );
  }
}

PixelEditor.propTypes = {
  gridWidth: PropTypes.number.isRequired,
  gridHeight: PropTypes.number.isRequired,
  cellSize: PropTypes.number.isRequired,
  size: PropTypes.number,
  newImage: PropTypes.bool,
};

PixelEditor.defaultProps = {
  gridWidth: 16,
  gridHeight: 16,
  cellSize: 20,
  size: 400,
};