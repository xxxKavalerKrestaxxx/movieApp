import React from 'react'
import { Menu } from 'antd'
import './menus.css'

class Menus extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      current: 'search',
    }
  }

  handleClick = (e) => {
    const { setMenu } = this.props
    setMenu(e.key)
    console.log('click ', e.key)
    this.setState({ current: e.key })
  }

  render() {
    const { current } = this.state

    return (
      <Menu className="menu" onClick={this.handleClick} selectedKeys={[current]} mode="horizontal">
        <Menu.Item key="search">Search</Menu.Item>
        <Menu.Item key="rated">Rated</Menu.Item>
      </Menu>
    )
  }
}

export default Menus
