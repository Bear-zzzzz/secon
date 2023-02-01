const parser = require('./parser')
const utils = require('./utils')
const blacklist = require('./blacklist.json')

async function main() {
  const playlists = parseIndex()
  for (const playlist of playlists) {
    await loadPlaylist(playlist.url).then(removeBlacklisted).then(savePlaylist).then(done)
  }

  finish()
}

function parseIndex() {
  console.info(`Parsing 'index.m3u'...`)
  let playlists = parser.parseIndex()
  console.info(`Found ${playlists.length} playlist(s)\n`)

  return playlists
}

async function loadPlaylist(url) {
  console.info(`Processing '${url}'...`)
  return parser.parsePlaylist(url)
}

async function removeBlacklisted(playlist) {
  console.info(`  Looking for blacklisted channels...`)
  playlist.channels = playlist.channels.filter(channel => {
    return !blacklist.find(i => {
      const channelName = channel.name.toLowerCase()
      return (
        (i.name.toLowerCase() === channelName ||
          i.aliases.map(i => i.toLowerCase()).includes(channelName)) &&
        i.country === channel.filename
      )
    })
  })

  return playlist
}

async function savePlaylist(playlist) {
  console.info(`  Saving playlist...`)
  const original = utils.readFile(playlist.url)
  const output = playlist.toString({ raw: true })

  if (original === output) {
    console.info(`No changes have been made.`)
    return false
  } else {
    utils.createFile(playlist.url, output)
    console.info(`Playlist has been updated.`)
  }

  return true
}

async function done() {
  console.info(` `)
}

function finish() {
  console.info('Done.')
}

main()
