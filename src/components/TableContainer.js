import React, { Component } from 'react';

class TableContainer extends Component {
  render() {
    return (
      <div className="card card-full-width">
        <div className="card-header">
          <i className={`fas fa-${this.props.titleIcon}`}></i> {
            this.props.title
          }
        </div>
        <div className="card-body">
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default TableContainer;
