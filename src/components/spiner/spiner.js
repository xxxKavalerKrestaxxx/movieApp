import React from 'react'
import { Spin } from 'antd'
import './spiner.css'

export default class Spinner extends React.Component {
  render() {
    return (
      <div className="spinner-container">
        <Spin className="spinner" />
      </div>
    )
  }
}
