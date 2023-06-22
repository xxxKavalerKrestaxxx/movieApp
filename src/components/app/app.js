import React from 'react'
import { Pagination, Alert } from 'antd'

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
      server: true,
    }
  }

  fetcher = new MovieAPI()

  async componentDidMount() {
    try {
      const serverResponse = await this.fetcher.checkServerConnection()
      this.setState({ server: serverResponse })

      if (this.state.server) {
        const guestSessionId = await this.fetcher.createGuestSession()
        this.setState({ guestSessionId })

        const genres = await this.fetcher.fetchGenres()
        this.setState({ genres })

        await this.searchMovie('in')
      }
    } catch (error) {
      this.setState((prevState) => ({
        warning: prevState.warning.concat(error),
        server: false,
      }))
    }

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

  setMenu = async (value) => {
    this.setState({ menu: value, currentPage: 1 })
    try {
      if (value === 'rated') {
        await this.getRatedMovies(1)
      } else {
        await this.searchMovieFirst(this.state.currentValue, 1)
      }
    } catch (error) {
      this.setState((prevState) => ({
        warning: prevState.warning.concat(error),
        server: false,
      }))
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
          server: false,
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
          server: false,
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
          server: false,
        }))
      })
  }

  handlePageChange = async (page) => {
    this.setState({ currentPage: page })

    try {
      if (this.state.menu === 'rated') {
        await this.getRatedMovies(page)
      } else {
        await this.searchMovie(this.state.currentValue, page)
      }
    } catch (error) {
      this.setState((prevState) => ({
        warning: prevState.warning.concat(error),
        server: false,
      }))
    }
  }
  handleRatingChange = (rating, id) => {
    try {
      this.fetcher.handleRating(id, this.state.guestSessionId, rating)
    } catch (error) {
      this.setState((prevState) => ({
        warning: prevState.warning.concat(error),
        server: false,
      }))
    }
  }

  render() {
    const { films, ratedFilms, loading, currentPage, menu, isOnline, warning, server } = this.state
    if (warning.length > 0 || !server) {
      return (
        <section className="main">
          <Menus setMenu={() => null} />
          <SearchForm searchMovie={() => null} menu={this.state.menu} />
          <div className="no_internet_container">
            {warning.map((item, index) => (
              <Alert key={index} message="Ошибка соединения с сервером" description={item.toString()} type="error" />
            ))}
          </div>
        </section>
      )
    }
    if (!isOnline || !server) {
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
                <MovieList films={ratedFilms} handleRatingChange={this.handleRatingChange} />
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
                <MovieList
                  films={films}
                  guest_session_id={this.state.guestSessionId}
                  handleRatingChange={this.handleRatingChange}
                />
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
