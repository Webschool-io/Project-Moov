/**
 * \libs\Show
 *
 * @TODO: [✔] List Show info
 * @TODO: [✔] List Seasons
 * @TODO: [✔] List Episodes
 * @TODO: [✔] Stream the ep
 */
'use strict'

const eztv = require('eztv-api')
    , subtitle = require('./subtitle')
    , _ = require('underscore')
    , ptn = require('parse-torrent-name')
    , stream = require('./stream')
    , helpers = require('./helpers')
    , list = require('./prompt').list
    , inquirer = require('inquirer')

/**
 * List shows for query search.
 * 
 * @param  String q query search
 */
const getShow = q => {
  let shows = []

  eztv.getShows({
    query: q
  }, (err, response) => {
    if (err) {
      throw err
    }

    for(let i in response) {
      if (response.hasOwnProperty(i)) {
        shows.push({
          name: response[i].title,
          value: response[i].id
        })
      }
    }

    list(shows, {
      name: 'id',
      message: 'Listing tv shows'
    }, show => {
      getSeason(show.id)
    })
  })
}

/** 
 * List Seasons for a tv-show.
 * 
 * @param  Integer showID id tv-show
 */
const getSeason = showID => {
  let season = []

  eztv.getShowEpisodes(showID, (err, response) => {
    let arr = helpers.groupBy(response.episodes, 'seasonNumber')

    arr.map( n => season.push({
      name: 'Season ' + n,
      value: n
    }))
    
    list(season, {
      name: 'season',
      message: 'Listing Seasons'
    }, e => {
      getEpisodes(showID, e.season)
    })
  })
}

/**
 * List episode for season.
 * 
 * @param  integer showID
 * @param  integer season Season Number
 */
const getEpisodes = (showID, season) => {
  let episodes = []
  let originalTitle

  eztv.getShowEpisodes(showID, (err, response) => {
    let arr = _.filter(response.episodes, e => {
      return e.seasonNumber === season
    })

    arr.map(episode => getEpisodeInfo(episode))

    // arr.map(i => {
    //   originalTitle = i.title
    //   let title = ptn(i.title)

    //   if (title.resolution === '720p') {
    //     episodes.push({
    //       name: 'Episode: ' + title.episode,
    //       value: i
    //     })  
    //   }
    // })

    // list(episodes, {
    //   name: 'info',
    //   message: 'Listing episodes for season: ' + season
    // }, e => {

    //   console.log(e.info)

    //   // subtitle({query: originalTitle}, e.url)
    // })
  })
}

/**
 * Get Episode info and stream.
 * 
 * @param  String   url [description]
 * @param  Callback cb  [description]
 */
const getEpisodeInfo = (episode) => {
  let eps = []

  for (let i in episode) {
    eps.push({
      info: ptn(episode.title),
      magnet: episode.magnet
    })
  }

  console.log(eps.length)

  // helpers.requestHttp(url, response => {
  //   response = JSON.parse(response)

  //   if (typeof cb === 'function') {
  //     cb(response)
  //   }
  // })
}

module.exports = query => {
  getShow(query)
}
