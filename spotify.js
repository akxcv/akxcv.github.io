"use strict";

(function () {
  const body = document.querySelector('body')
  const root = document.querySelector('.spotify-now-playing')
  const fac = new FastAverageColor()

  function renderNowPlaying() {
    return fetch('https://jerry.the418.gg/akxcvapi/spotify/now_playing')
      .then(function (res){ return res.json() })
      .then(function (data) {
        return new Promise((resolve, reject) => {
          if (data.is_playing) {
            const img = document.createElement('img')
            img.src = data.item.album.images.find(function (i) { return i.height <= 64 }).url
            img.crossOrigin = "anonymous"
            img.onload = function (_e) {
              fac.getColorAsync(img, { algorithm: 'dominant' })
                .then(function (color) {
                  root.innerHTML =
                    '<div class="label">Now Playing</div>' +
                    '<a href="' + data.item.external_urls.spotify + '">' +
                    img.outerHTML +
                    '<div class="track-name">' + data.item.artists.map(function (artist) { return artist.name }).join(', ') + ' &mdash; ' + data.item.name + '</div></a>'

                  body.style.backgroundColor = color.rgba
                  if (color.isDark) {
                    body.classList.add('dark')
                  } else {
                    body.classList.remove('dark')
                  }

                  root.style.backgroundColor = color.rgba

                  resolve()
                })
            }
            img.onerror = reject
          } else {
            root.innerHTML = ''
            body.style.backgroundColor = null
            body.classList.remove('dark')
            resolve()
          }
        })
      })
  }

  renderNowPlaying().then(function () {
    body.classList.remove('hidden')
  }).catch(function () {
    body.classList.remove('hidden')
  })

  setInterval(renderNowPlaying, 3000)
})()
