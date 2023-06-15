export default class Apishe4ka {
  constructor() {
    this.BASE_URL = 'https://api.themoviedb.org/3'
    this.API_KEY = '87816a77eb101eb61635d1fc67cd33f4'
    this.state = {}
  }

  async searchMovies(query, page) {
    const url = `${this.BASE_URL}/search/movie?api_key=${this.API_KEY}&query=${query}&page=${page}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Проблема: ${response.status}`)
      }

      const data = await response.json()
      const movies = data.results

      return { movies, data }
    } catch (error) {
      console.error(error)
      throw new Error('Произошла ошибка при поиске фильмов')
    }
  }

  fetchGenres = () => {
    const url = `${this.BASE_URL}/genre/movie/list?api_key=${this.API_KEY}`

    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Проблема: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        const { genres } = data
        return genres
      })
      .catch((error) => {
        throw new Error('Ошибка при получении жанров', error)
      })
  }

  async createGuestSession() {
    const guestSessionId = localStorage.getItem('guestSessionId')

    if (guestSessionId) {
      return guestSessionId
    } else {
      const url = `${this.BASE_URL}/authentication/guest_session/new?api_key=${this.API_KEY}`

      return fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Проблема: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
          const { guest_session_id } = data
          localStorage.setItem('guestSessionId', guest_session_id)
          console.log(guest_session_id)
          this.state({ guestSessionId: guest_session_id })
          return guest_session_id
        })
        .catch((error) => {
          throw new Error('Ошибка при создании гостевой сессии:', error)
        })
    }
  }

  getRatedMovies = (guestSessionId) => {
    const url = `${this.BASE_URL}/guest_session/${guestSessionId}/rated/movies?api_key=${this.API_KEY}`

    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Проблема: ${response.status}`)
        }
        return response.json()
      })
      .catch((error) => {
        throw new Error('Ошибка при получении оцененных фильмов:', error)
      })
  }
}
