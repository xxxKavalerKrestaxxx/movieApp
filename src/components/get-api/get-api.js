export default async function searchMovies(query, page) {
  const apiKey = '87816a77eb101eb61635d1fc67cd33f4'
  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}&page=${page}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Ошибка при выполнении запроса')
    }

    const data = await response.json()
    const movies = data.results

    return { movies, data }
  } catch (error) {
    console.error(error)
    throw new Error('Произошла ошибка при поиске фильмов')
  }
}
