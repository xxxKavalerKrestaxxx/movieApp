import React from 'react'
import { Pagination } from 'antd'

import SearchForm from '../search-form/search-form'
import MovieList from '../movie-list/movie-list'
import Menus from '../menu/menus'
import Spiner from '../spiner/spiner'
import { GenreProvider } from '../../context/context'
import Apishe4ka from '../../apishe4ka/apishe4ka'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      films: [],
      loading: false,
      currentValue: '',
      currentPage: 1,
      totalRated: 0,
      totalResults: 0,
      menu: 'search',
      ratedFilms: [],
      guestSessionId: null,
      genres: '',
    }
  }

  fetcher = new Apishe4ka()

  componentDidMount() {
    this.fetcher.createGuestSession().then((response) => {
      this.setState({ guestSessionId: response })
    })

    this.fetcher.fetchGenres().then((res) => {
      this.setState({ genres: res })
    })

    this.searchMovie('in')
    if (!navigator.onLine) {
      throw new Error('Нет интернета')
    }
  }

  setMenu = (value) => {
    this.setState({ menu: value })
    if (value === 'rated') {
      this.getRatedMovies()
    }
  }

  getRatedMovies = () => {
    this.setState({ loading: true })
    this.fetcher
      .getRatedMovies(this.state.guestSessionId)
      .then((data) => {
        this.setState({ ratedFilms: data.results, totalRated: data.total_results, loading: false })
      })
      .catch((error) => {
        this.setState({ ratedFilms: [] })
        throw new Error('Ошибка при получении оцененных фильмов:', error)
      })
  }

  searchMovie = (value, page) => {
    this.setState({ loading: true, currentValue: value })

    this.fetcher
      .searchMovies(value, page || 1)
      .then(({ movies, data }) => {
        const totalResults = data.total_results || 0
        this.setState({ films: movies, loading: false, totalResults })
      })
      .catch((error) => {
        throw new Error(error)
      })
  }

  handlePageChange = (page) => {
    this.setState({ currentPage: page })
    this.searchMovie(this.state.currentValue, page)
  }

  render() {
    const { films, ratedFilms, loading, currentPage, menu } = this.state

    if (loading) {
      return (
        <GenreProvider value={this.state.genres}>
          <section className="main">
            <Menus setMenu={this.setMenu} />
            <SearchForm searchMovie={this.searchMovie} />
            <Spiner />
          </section>
        </GenreProvider>
      )
    } else {
      return (
        <GenreProvider value={this.state.genres}>
          <section className="main">
            <Menus setMenu={this.setMenu} />
            <SearchForm searchMovie={this.searchMovie} menu={this.state.menu} />
            {menu === 'rated' ? (
              <>
                <MovieList films={ratedFilms} guest_session_id={this.state.guestSessionId} />
                {films.length > 0 && (
                  <Pagination
                    showSizeChanger={false}
                    pageSize={20}
                    current={currentPage}
                    total={this.state.totalRated}
                    onChange={this.handlePageChange}
                  />
                )}
              </>
            ) : (
              <>
                <MovieList films={films} guest_session_id={this.state.guestSessionId} />
                {films.length > 0 && (
                  <Pagination
                    showSizeChanger={false}
                    pageSize={20}
                    current={currentPage}
                    total={this.state.totalResults}
                    onChange={this.handlePageChange}
                  />
                )}
              </>
            )}
          </section>
        </GenreProvider>
      )
    }
  }
}
