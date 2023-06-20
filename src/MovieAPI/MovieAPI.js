export default class MovieAPI {
  constructor() {
    this.BASE_URL = 'https://api.themoviedb.org/3'
    this.API_KEY = '87816a77eb101eb61635d1fc67cd33f4'
  }

  async searchMovies(query, page) {
    const url = `${this.BASE_URL}/search/movie?api_key=${this.API_KEY}&query=${query}&page=${page}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        console.error(`Проблема: ${response.status}`)
      }

      const data = await response.json()
      const movies = data.results

      return { movies, data }
    } catch (error) {
      return [], {}
    }
  }

  fetchGenres = () => {
    const url = `${this.BASE_URL}/genre/movie/list?api_key=${this.API_KEY}`

    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          console.error(`Проблема: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        const { genres } = data
        return genres
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
            console.error(`Проблема: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
          const { guest_session_id } = data
          localStorage.setItem('guestSessionId', guest_session_id)
          console.log(guest_session_id)

          return guest_session_id
        })
    }
  }

  getRatedMovies = (guestSessionId, page) => {
    const url = `${this.BASE_URL}/guest_session/${guestSessionId}/rated/movies?api_key=${this.API_KEY}&page=${page}`

    return fetch(url).then((response) => {
      if (!response.ok) {
        console.error(`Проблема: ${response.status}`)
      }
      return response.json()
    })
  }
  handleRating = (id, guest_session_id, rating) => {
    fetch(`${this.BASE_URL}/movie/${id}/rating?api_key=${this.API_KEY}&guest_session_id=${guest_session_id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: rating,
      }),
    }).then((response) => {
      if (response.ok) {
        console.log('Рейтинг успешно отправлен:', response)
      }
    })
  }
  getPoster = (poster) => {
    return <img className="movie_poster" src={`https://image.tmdb.org/t/p/w500${poster}`} alt="Movie Poster" />
  }
}
