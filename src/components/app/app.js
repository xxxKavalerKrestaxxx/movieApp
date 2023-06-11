import React from 'react'
import { Pagination } from 'antd'

import SearchForm from '../search-form/search-form'
import searchMovies from '../get-api/get-api'
import MovieList from '../movie-list/movie-list'
import Menus from '../menu/menus'
import Spiner from '../spiner/spiner'
import { GenreProvider } from '../context/context'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      films: [],
      loading: true,
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

  componentDidMount() {
    this.createGuestSession()
    this.fetchGenres()
  }

  fetchGenres = () => {
    fetch('https://api.themoviedb.org/3/genre/movie/list?api_key=87816a77eb101eb61635d1fc67cd33f4')
      .then((response) => response.json())
      .then((data) => {
        const { genres } = data
        this.setState({ genres })
      })
      .catch((error) => {
        console.error('Ошибка при получении жанров', error)
      })
  }

  setMenu = (value) => {
    this.setState({ menu: value })
    if (value === 'rated') {
      this.getRatedMovies()
    }
  }

  createGuestSession = () => {
    fetch('https://api.themoviedb.org/3/authentication/guest_session/new?api_key=87816a77eb101eb61635d1fc67cd33f4')
      .then((response) => response.json())
      .then((data) => {
        const { guest_session_id } = data
        this.setState({ guestSessionId: guest_session_id })
        console.log(guest_session_id)
        if (this.state.menu === 'rated') {
          this.getRatedMovies()
        }
      })
      .catch((error) => {
        console.error('Ошибка при создании гостевой сессии:', error)
      })
  }

  getRatedMovies = () => {
    const { guestSessionId } = this.state
    fetch(
      `https://api.themoviedb.org/3/guest_session/${guestSessionId}/rated/movies?api_key=87816a77eb101eb61635d1fc67cd33f4`
    )
      .then((response) => response.json())
      .then((data) => {
        this.setState({ ratedFilms: data.results, totalRated: data.total_results })
      })
      .catch((error) => {
        console.error('Ошибка при получении оцененных фильмов:', error)
        this.setState({ ratedFilms: [] })
      })
  }

  searchMovie = (value, page) => {
    this.setState({ loading: true, currentValue: value })

    searchMovies(value, page || 1)
      .then(({ movies, data }) => {
        const totalResults = data.total_results || 0
        this.setState({ films: movies, loading: false, totalResults })
      })
      .catch((error) => {
        console.error(error)
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
