import React, { Component, PropTypes } from 'react';

export default class Modal extends Component {
  render() {
    const negativeButton = this.props.negativeText && this.props.dismissCallback ? (
      <button className="button margin-right" onClick={() => this.props.dismissCallback(false)}>{this.props.negativeText}</button>
    ) : null;
    const positiveButton = this.props.positiveText && this.props.positiveCallback ? (
      <button className="button button-primary" onClick={() => this.props.positiveCallback()}>{this.props.positiveText}</button>
    ) : null;
    const closeButton = this.props.closeButton && this.props.dismissCallback ? (
      <i className="icon-cancel close-button" onClick={() => this.props.dismissCallback(false)}></i>
    ): null;
    return this.props.visible ? (
      <div className="modal-bg">
        <div className="modal" style={{ height: this.props.height }}>
          <div className="modal-title">
            <h5>{this.props.title}</h5>
            {closeButton}
          </div>
          <div className="modal-body">
            <span>{this.props.body}</span>
          </div>
          <div className="modal-buttons row center">
            <div className="ten columns center">
              {negativeButton}
              {positiveButton}
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }
}

Modal.PropTypes = {
  height: PropTypes.number,
  title: PropTypes.string,
  body: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  positiveText: PropTypes.string,
  negativeText: PropTypes.string,
  positiveCallback: PropTypes.func,
  dismissCallback: PropTypes.func,
  closeButton: PropTypes.bool,
};

Modal.defaultProps = {
  height: 200,
};