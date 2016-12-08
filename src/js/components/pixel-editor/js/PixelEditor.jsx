import React, { Component, PropTypes } from 'react';

export default class PixelEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gridSize: props.gridSize,
      cellSize: props.cellSize,
      cells: [],
    }
  }

  componentDidMount() {
    this.createCells();
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
    cell.background = 'red';
    this.setState({ cells: this.state.cells });
  }

  createCells() {
    const cells = [];
    let offsetX = 0;
    let offsetY = 0;
    for (let i = 1; i < this.state.gridSize * this.state.gridSize + 1; i++) {
      cells.push({ id: i, x: offsetX, y: offsetY, background: 'white', size: this.state.cellSize });
      offsetX += this.state.cellSize + 1;
      if (i % this.state.gridSize === 0) {
        offsetY += this.state.cellSize + 1;
        offsetX = 0;
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
          left: c.x,
          top: c.y
        }}
             onClick={() => this.onCellClick(c)}
             onMouseMove={() => this.onCellMouseMove(c)}>
        </div>
      );
    });
  }

  render() {
    const grid = this.createGrid();
    return (
      <div
        onMouseDown={() => this.onGridMouseDown()}
        onMouseUp={() => this.onGridMouseUp()}
        onMouseLeave={() => this.onGridMouseUp()}
        style={{ position: 'relative' }}>
        {grid}
      </div>
    );
  }
}

PixelEditor.propTypes = {
  gridSize: PropTypes.number.isRequired,
  cellSize: PropTypes.number.isRequired,
};

PixelEditor.defaultProps = {
  gridSize: 16,
  cellSize: 20,
};