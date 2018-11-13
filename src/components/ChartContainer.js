import React, { Component } from 'react';

class ChartContainer extends Component {
  render() {
    return (
      <div className="card">
        <div className="card-header">
          <i className={`fas fa-chart-${this.props.titleIcon}`}></i> {
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

export default ChartContainer;
