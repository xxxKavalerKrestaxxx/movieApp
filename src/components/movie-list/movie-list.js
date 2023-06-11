import React from 'react'

import './movie-list.css'
import { GenreConsumer } from '../context/context'
import MovieCard from '../movie-card/movie-card'

export default class MovieList extends React.Component {
  render() {
    const { films, guest_session_id } = this.props
    if (films.length === 0) return <span>No result</span>
    return (
      <GenreConsumer>
        {(genres) => (
          <ul className="card_list">
            {films.map((item) => (
              <MovieCard
                key={item.id}
                tittle={item.original_title}
                poster={item.poster_path}
                star={item.vote_average}
                time={item.release_date}
                genre={item.genre_ids}
                id={item.id}
                guest_session_id={guest_session_id}
                genres={genres}
                overview={item.overview}
                ratingRated={item.rating}
              />
            ))}
          </ul>
        )}
      </GenreConsumer>
    )
  }
}