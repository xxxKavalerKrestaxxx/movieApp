import React from 'react'
import { debounce } from 'lodash'
import './search-form.css'

export default class SearchForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchValue: '',
    }
    this.debouncedSearchMovie = debounce(this.props.searchMovie, 500)
  }

  handleSearchInputChange = (event) => {
    const { value } = event.target
    this.setState({ searchValue: value })
    this.debouncedSearchMovie(value)
  }

  render() {
    const { menu } = this.props

    return (
      <div className="search">
        {menu !== 'rated' && (
          <input
            className="search_input"
            type="text"
            value={this.state.searchValue}
            onChange={this.handleSearchInputChange}
            placeholder="Type to search..."
          />
        )}
      </div>
    )
  }
}
