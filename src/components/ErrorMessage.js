import React, { Component } from 'react';

class ErrorMessage extends Component {
  render() {
    return (
      <div className="errorMessage">
        Error! {this.props.error}
      </div>
    );
  }
}

export default ErrorMessage;
