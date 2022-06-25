"use strict";

(function () {
  const root = document.querySelector('.spotify-now-playing')

  function renderNowPlaying() {
    fetch('https://jerry.the418.gg/akxcvapi/spotify/now_playing')
      .then(function (res){ return res.json() })
      .then(function (data) {
        if (data.is_playing) {
          root.innerHTML =
            '<div class="label">Now Playing</div>' +
            '<a href="' + data.item.external_urls.spotify + '">' +
            '<img src="' + data.item.album.images.find(function (i) { return i.height <= 64 }).url + '" />' +
            '<div class="track-name">' + data.item.artists.map(function (artist) { return artist.name }).join(', ') + ' &mdash; ' + data.item.name + '</div></a>'
        } else {
          root.innerHTML = ''
        }
      })
  }

  renderNowPlaying()

  setInterval(renderNowPlaying, 3000)
})()
