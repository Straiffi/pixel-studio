import React, { Component, PropTypes } from 'react';
import PNGImage from 'pnglib';
import _ from 'lodash';
import { hexToRgb, rgbaToArray } from '../../../utils/image-utils';

import ImageDownloader from '../../image-downloader/js/ImageDownloader';
import Toolbox from '../../toolbox/js/Toolbox';
import ColorPalette from '../../color-palette/js/ColorPalette';

const MAX_ZOOM = 60;
const MIN_ZOOM = 10;

const TRANSPARENT = 'rgba(0, 0, 0, 0)';

export default class PixelEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gridWidth: props.gridWidth,
      gridHeight: props.gridHeight,
      cellSize: props.cellSize,
      cells: props.cells ? props.cells : [],
      oldCells: [],
      history: [],
      future: [],
      paletteColors: [],
      color: 'rgba(0, 0, 0, 1)',
      opacity: 1,
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
    document.onkeydown = (e) => {
      if (e.key.indexOf('Arrow') !== -1) {
        e.preventDefault();
        this.handleKeyPress(e.key);
      }
    };

    this.onCellMouseMoveThrottled = _.throttle(this.onCellMouseMove, 20);
  }

  componentDidMount() {
    this.createCells();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.gridWidth !== this.state.gridWidth || newProps.gridHeight !== this.state.gridHeight || newProps.newImage === true) {
      this.createCells(this.state.cellSize, newProps.gridWidth, newProps.gridHeight, undefined, true);
    }

    if (newProps.cells) {
      this.createCells(this.state.cellSize, newProps.gridWidth, newProps.gridHeight, newProps.cells, false);
    }
  }

  createPreviewUrl() {
    const p = new PNGImage(this.state.gridWidth, this.state.gridHeight, 256);
    p.color(0, 0, 0, 0);

    for (let i = 0; i < this.state.cells.length; i++) {
      const cell = this.state.cells[i];
      if (cell.color !== TRANSPARENT) {
        const color = cell.color;
        const rgba = rgbaToArray(color);
        p.buffer[p.index(Math.floor(cell.x), Math.floor(cell.y))] = p.color(rgba[0], rgba[1], rgba[2], rgba[3] * 255);
      }
    }
    return `data:image/png;base64,${p.getBase64()}`;
  }

  createCells(size, width, height, newCells = undefined, clear = false) {
    const cells = [];
    const currentCells = newCells ? newCells : this.state.cells;
    const cellSize = size ? size : this.state.cellSize;
    const gridWidth = width ? width : this.state.gridWidth;
    const gridHeight = height ? height : this.state.gridHeight;
    let offsetX = 0;
    let offsetY = 0;
    let top = 0;
    let left = 0;
    for (let i = 1; i < gridWidth * gridHeight + 1; i++) {
      const id = i - 1;
      let oldCell = _.find(currentCells, (c) => c.x === offsetX && c.y === offsetY);
      if (oldCell === undefined) {
        oldCell = _.find(currentCells, (c) => c.id === id);
      }
      const color = oldCell && oldCell.color && !clear ? oldCell.color : TRANSPARENT;
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
      if (c.color !== TRANSPARENT && !colors.includes(c.color)) {
        colors.push(c.color);
      }
    });
    return colors;
  }

  fill(startCell) {
    const pixelStack = [[startCell.x, startCell.y]];
    const startColor = startCell.color;
    if (startColor === this.state.color) { return; }

    const matchPixel = (id) => _.find(this.state.cells, (c) => c.id === id);
    const matchPixelByCoord = (x, y) => _.find(this.state.cells, (c) => c.x === x && c.y === y);

    const matchStartColor = (id) => {
      const pixel = matchPixel(id);
      return pixel.color === startColor;
    };

    const colorPixel = (id) => {
      const pixel = matchPixel(id);
      const rgba = rgbaToArray(this.state.color);
      pixel.color = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`;
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

  shiftPixels(direction) {
    const newCells = this.state.cells.map((c) => {
      switch (direction) {
        case 'left':
          if (c.x >= 0 && c.x <= this.state.gridWidth) {
            if (c.x === 0) {
              c.x = this.state.gridWidth - 1;
            } else {
              c.x--;
            }
          }
          break;
        case 'right':
          if (c.x >= 0 && c.x <= this.state.gridWidth) {
            if (c.x === this.state.gridWidth - 1) {
              c.x = 0;
            } else {
              c.x++;
            }
          }
          break;
        case 'up':
          if (c.y >= 0 && c.y <= this.state.gridHeight) {
            if (c.y === 0) {
              c.y = this.state.gridHeight - 1;
            } else {
              c.y--;
            }
          }
          break;
        case 'down':
          if (c.y >= 0 && c.y <= this.state.gridHeight) {
            if (c.y === this.state.gridHeight - 1) {
              c.y = 0;
            } else {
              c.y++;
            }
          }
          break;
        default:
          break;
      }
      return c;
    });
    this.createCells(this.state.cellSize, this.state.gridWidth, this.state.gridHeight, newCells, false);
  }

  handleKeyPress(key) {
    switch (key) {
      case 'ArrowLeft':
        this.shiftPixels('left');
        break;
      case 'ArrowRight':
        this.shiftPixels('right');
        break;
      case 'ArrowUp':
        this.shiftPixels('up');
        break;
      case 'ArrowDown':
        this.shiftPixels('down');
        break;
      default:
        break;
    }
  }

  onGridMouseDown() {
    if (this.state.eyedropper) { return; }
    const currentCells = JSON.parse(JSON.stringify(this.state.cells));
    this.state.history.push(currentCells);
    this.setState({ mousedown: true, future: [] });
  }

  onGridMouseUp() {
    this.setState({ mousedown: false, paletteColors: this.getPaletteColors(), cells: this.state.cells });
  }

  onCellMouseMove(cell) {
    if (!this.state.mousedown || this.state.bucket) { return; }
    this.onCellClick(cell);
  }

  onCellClick(cell) {
    if (this.state.pen) {
      const rgba = rgbaToArray(this.state.color);
      const colorString = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`;
      cell.color = colorString ;

      // Bit of a non-React hack, but a necessary optimization for larger canvases.
      document.getElementById(cell.id).style.backgroundColor = colorString;
    }

    if (this.state.eraser) {
      cell.color = TRANSPARENT;
      document.getElementById(cell.id).style.backgroundColor = TRANSPARENT;
    }

    if (this.state.bucket) {
      this.fill(cell);
    }

    if (this.state.eyedropper) {
      if (cell.color !== TRANSPARENT) {
        this.onColorChanged(cell.color);
      }
    }
  }

  onColorChanged(color) {
    let colorString = TRANSPARENT;
    let opacity = this.state.opacity;
    if (color.includes('#')) { // Color originated from color picker.
      let rgba = hexToRgb(color);
      rgba.a = this.state.opacity;
      colorString = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${opacity})`;
    } else { // RGBA color was picked from palette or eyedropper.
      let rgba = rgbaToArray(color);
      opacity = rgba[3];
      colorString = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${opacity})`;
    }
    this.setState({ color: colorString, opacity });
  }

  onOpacityChanged(value) {
    const rgba = rgbaToArray(this.state.color);
    const opacity = (value / 100).toFixed(2);
    const color = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${opacity})`;
    this.setState({ opacity, color });
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
                onOpacityChanged={(opacity) => this.onOpacityChanged(opacity)}
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
                opacity={this.state.opacity}
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