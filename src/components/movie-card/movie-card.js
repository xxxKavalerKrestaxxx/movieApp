import React from 'react'
import { format } from 'date-fns'
import { Rate } from 'antd'

import './movie-card.css'
import noposter from '../../img/noposter.png'

export default class MovieCard extends React.Component {
  handleRating = (rating) => {
    const { id, handleRatingChange } = this.props
    handleRatingChange(rating, id)
  }
  getPoster = (poster) => {
    return <img className="movie_poster" src={`https://image.tmdb.org/t/p/w500${poster}`} alt="Movie Poster" />
  }

  render() {
    const { tittle, poster, star, time, genre, genres, overview, ratingRated } = this.props

    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString)
        const formattedDate = format(date, 'MMMM d, yyyy')
        return formattedDate
      } catch (error) {
        return 'no relize date'
      }
    }

    const getGenreName = (genreIds) => {
      const genreArray = []
      genreIds.forEach((genreId) => {
        const genre = genres.find((genre) => genre.id === genreId)
        if (genre) {
          genreArray.push(genre.name)
        }
      })
      return genreArray
    }

    const getColor = (star) => {
      const starNumber = parseFloat(star)

      if (starNumber >= 0 && starNumber < 3) {
        return { borderColor: '#E90000' }
      } else if (starNumber >= 3 && starNumber < 5) {
        return { borderColor: '#E97E00' }
      } else if (starNumber >= 5 && starNumber < 7) {
        return { borderColor: '#E9D100' }
      } else if (starNumber >= 7) {
        return { borderColor: '#66E900' }
      } else {
        return { borderColor: 'black' }
      }
    }

    return (
      <li className="movie_card">
        {poster === null ? <img src={noposter} alt="no poster" /> : this.getPoster(poster)}

        <div className="card_info">
          <div>
            <div className="card_container_first">
              <div className="card_tittle">{tittle}</div>
              <span className="card_star" style={getColor(star)}>
                {parseFloat(star).toFixed(1)}
              </span>
            </div>

            <div className="card_time">{formatDate(time)}</div>
            <div className="card_genres">
              {getGenreName(genre).map((genreName) => (
                <div className="card_genre" key={genreName}>
                  {genreName}
                </div>
              ))}
            </div>
            <div className="card_overview">{overview.split(' ').slice(0, 20).join(' ')}...</div>
            <Rate
              count={10}
              defaultValue={ratingRated || 0}
              allowHalf
              onChange={this.handleRating}
              style={{ fontSize: '17px' }}
            />
          </div>
        </div>
      </li>
    )
  }
}
