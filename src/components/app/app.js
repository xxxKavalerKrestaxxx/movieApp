import React from 'react'
import { Pagination } from 'antd'
import { Alert } from 'antd'

import SearchForm from '../search-form/search-form'
import MovieList from '../movie-list/movie-list'
import Menus from '../menu/menus'
import Spiner from '../spiner/spiner'
import { GenreProvider } from '../../context/context'
import MovieAPI from '../../MovieAPI/MovieAPI'
import './app.css'

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
      isOnline: navigator.onLine,
      warning: [],
    }
  }

  fetcher = new MovieAPI()

  componentDidMount() {
    this.fetcher.createGuestSession().then((response) => {
      this.setState({ guestSessionId: response })
    })

    this.fetcher
      .fetchGenres()
      .then((res) => {
        this.setState({ genres: res })
      })
      .catch((error) => {
        this.setState((prevState) => ({
          warning: prevState.warning.concat(error),
        }))
      })

    this.searchMovie('in')
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  }
  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  }

  handleOnline = () => {
    this.setState({ isOnline: true })
  }

  handleOffline = () => {
    this.setState({ isOnline: false })
  }

  setMenu = (value) => {
    this.setState({ menu: value, currentPage: 1 })
    if (value === 'rated') {
      this.getRatedMovies(1)
    } else {
      this.searchMovieFirst(this.state.currentValue, 1)
    }
  }

  getRatedMovies = (page) => {
    this.setState({ loading: true })
    this.fetcher
      .getRatedMovies(this.state.guestSessionId, page || 1)
      .then((data) => {
        this.setState({ ratedFilms: data.results, totalRated: data.total_results, loading: false })
      })
      .catch((error) => {
        this.setState({ ratedFilms: [] })
        this.setState((prevState) => ({
          warning: prevState.warning.concat(error),
        }))
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
        this.setState((prevState) => ({
          warning: prevState.warning.concat(error),
        }))
      })
  }
  searchMovieFirst = (value) => {
    this.setState({ currentPage: 1 })
    this.setState({ loading: true, currentValue: value })

    this.fetcher
      .searchMovies(value, 1)
      .then(({ movies, data }) => {
        const totalResults = data.total_results || 0
        this.setState({ films: movies, loading: false, totalResults })
      })
      .catch((error) => {
        this.setState((prevState) => ({
          warning: prevState.warning.concat(error),
        }))
      })
  }

  handlePageChange = (page) => {
    this.setState({ currentPage: page })
    if (this.state.menu === 'rated') {
      this.getRatedMovies(page)
    } else this.searchMovie(this.state.currentValue, page)
  }

  render() {
    const { films, ratedFilms, loading, currentPage, menu, isOnline, warning } = this.state
    if (warning.length > 0) {
      return (
        <section className="main">
          <Menus setMenu={this.setMenu} />
          <SearchForm searchMovie={this.searchMovie} menu={this.state.menu} />
          <div className="no_internet_container">
            {warning.map((item, index) => {
              return <Alert key={index} message="Ошибка " description={item} type="error" />
            })}
          </div>
        </section>
      )
    }
    if (!isOnline) {
      return (
        <section className="main">
          <Menus
            setMenu={() => {
              return null
            }}
          />
          <SearchForm
            searchMovie={() => {
              return null
            }}
            menu={this.state.menu}
          />
          <div className="no_internet_container">
            <Alert
              message="Отсутствует интернет подключение"
              description="Пожалуйста, проверьте ваше интернет-соединение."
              type="error"
            />
          </div>
        </section>
      )
    }
    if (loading) {
      return (
        <GenreProvider value={this.state.genres}>
          <section className="main">
            <Menus setMenu={this.setMenu} />
            <SearchForm searchMovie={this.searchMovieFirst} />
            <Spiner />
          </section>
        </GenreProvider>
      )
    } else {
      return (
        <GenreProvider value={this.state.genres}>
          <section className="main">
            <Menus setMenu={this.setMenu} />
            <SearchForm searchMovie={this.searchMovieFirst} menu={this.state.menu} />
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
