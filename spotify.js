"use strict";

(function () {
  const body = document.querySelector('body')
  const root = document.querySelector('.spotify-now-playing')
  const styleRoot = document.querySelector(':root')
  const colorThief = new ColorThief()

  function luminance(r, g, b) {
    var a = [r, g, b].map(function(v) {
      v /= 255;
      return v <= 0.03928 ?
        v / 12.92 :
        Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function contrast(rgb1, rgb2) {
    var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
    var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) /
      (darkest + 0.05);
  }

  function toRgb(color) {
    return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')'
  }

  function getPalette(img, ...args) {
    const [fg, bg] = colorThief.getPalette(img, ...args)
    return { rgbs: [toRgb(fg), toRgb(bg)], raw: { fg, bg } }
  }

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
              var { rgbs: [fgColor, bgColor], raw: { fg, bg }} = getPalette(img, 2);

              if (contrast(fg, bg) < 3.5) {
                console.log('low contrast')
                var { rgbs: [fgColor, bgColor], raw: { fg, bg }} = getPalette(img);

                if (contrast(fg, bg) < 3.5) {
                  console.log('low contrast')
                  fgColor = luminance(bg) > 0.5 ? 'black' : 'white'
                }
              }

              root.innerHTML =
                '<div class="label">Now Playing</div>' +
                '<a href="' + data.item.external_urls.spotify + '">' +
                img.outerHTML +
                '<div class="track-name">' + data.item.artists.map(function (artist) { return artist.name }).join(', ') + ' &mdash; ' + data.item.name + '</div></a>'

              body.style.backgroundColor = bgColor
              styleRoot.style.setProperty("--fg", fgColor)

              resolve()
            }
            img.onerror = reject
          } else {
            root.innerHTML = ''
            body.style.backgroundColor = null
            styleRoot.style.setProperty("--fg", "#333")
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
