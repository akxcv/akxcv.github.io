"use strict";

(function () {
  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyAD0zaRcNL1mkbWYYJEzI4wgrNeX3kyJjw",
    authDomain: "akxcvlol.firebaseapp.com",
    databaseURL: "https://akxcvlol.firebaseio.com",
    projectId: "akxcvlol",
    storageBucket: "akxcvlol.appspot.com",
    messagingSenderId: "533141923096"
  }

  firebase.initializeApp(FIREBASE_CONFIG)

  var database = firebase.database()
  var reactionsRef = database.ref('reactions')

  var buttonsInitialised = false

  reactionsRef.on('value', function (v) {
    var values = v.val()
    if (!buttonsInitialised) {
      initialiseButtons(values)
    } else {
      updateReactionCounts(values)
    }
  })

  function initialiseButtons (values) {
    var footer = document.querySelector('footer')
    // sort by # of reactions
    Object.entries(values).sort(function (a, b) {
      return a[1] > b[1] ? -1 : 1
    }).forEach(function (vals) {
      var reactionName = vals[0]
      footer.innerHTML += '<a href="#" class="js-reaction reaction-button" data-reaction-name="' + reactionName + '">' +
        '<img src="pics/' + reactionName + '.png" />' +
        '<div class="js-reaction-count reaction-count"></div></a>'
    })

    document.querySelectorAll('.js-reaction').forEach(function (button) {
      var activeTimeout
      function clickListener (e) {
        e.preventDefault()
        clearTimeout(activeTimeout)
        button.classList.add('active')
        activeTimeout = setTimeout(function () {
          button.classList.remove('active')
        }, 100)
        var reactionName = button.dataset.reactionName
        reactionsRef.child(reactionName).transaction(function (reaction) {
          return reaction + 1
        })
      }
      button.addEventListener('click', debounce(clickListener, 100))
    })

    updateReactionCounts(values)

    footer.classList.add('visible')
    buttonsInitialised = true
  }

  function updateReactionCounts (data) {
    document.querySelectorAll('.js-reaction').forEach(function (button) {
      var reactionName = button.dataset.reactionName
      button.querySelector('.js-reaction-count').innerText = formatNumber(data[reactionName])
    })
  }

  function formatNumber (number) {
    if (number < 1000) {
      return number
    }
    if (number < 1000000) {
      return (number / 1000).toFixed(1) + 'K'
    }
    if (number < 1000000000) {
      return (number / 1000000).toFixed(1) + 'M'
    }
    return (number / 1000000000).toFixed(1) + 'B'
  }

  function debounce (fn, time) {
    var timeoutId
    return function () {
      var args = arguments
      clearTimeout(timeoutId)
      timeoutId = setTimeout(function () {
        fn.apply(null, args)
      }, time)
    }
  }
})()
