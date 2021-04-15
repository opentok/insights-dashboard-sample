import React, { Component } from 'react';
import '../css/Loading.css';

class Loading extends Component {
  render() {
    return (
      <div className="loading" style={{background: 'url(/images/spinner.gif)'}}></div>
    );
  }
}

export default Loading;
