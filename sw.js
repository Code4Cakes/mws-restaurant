
let cacheName = 'v1'

if (typeof DBHelper === 'undefined') self.importScripts('public/js/dbhelper.min.js')

//if idb not loaded
if (typeof idb === 'undefined') self.importScripts('/public/js/idb.min.js')

//local storage list
const urlList = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/public/css/main.min.css',
  '/public/js/main.min.js',
  '/public/js/restaurant_info.min.js',
  '/public/js/dbhelper.min.js',
  '/public/js/idb.min.js',
  '/public/img/1.jpg',
  '/public/img/2.jpg',
  '/public/img/3.jpg',
  '/public/img/4.jpg',
  '/public/img/5.jpg',
  '/public/img/6.jpg',
  '/public/img/7.jpg',
  '/public/img/8.jpg',
  '/public/img/9.jpg',
  '/public/img/10.jpg',
  '/public/img/icon.png'
]

//put everything into cache when service worker installed
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(urlList, {
        mode: 'no-cors'
      })
    })
  )
})

//intercept fetch requests
self.addEventListener('fetch', event => {
  let request = event.request
  //if it's going to the api
  if (request.url.includes(DBHelper.DATABASE_URL)) {
    //Requesting info, try to pull, get from browser if fail
    if (request.method === 'GET') {
      let url = request.referrer

      event.respondWith(
        fetch(request).then(response => {
          const cloneResponse = response.clone()
          cloneResponse.json().then(responseData => {
            if (cloneResponse.url.indexOf('reviews') === -1) {
              //compare and store restaurant data
              DBHelper.fetchLocalDb('restaurants', 0)
                .then(currentStorage => {
                  if (currentStorage) {
                    const toUpdate = currentStorage.filter(review => {
                      return responseData.map(({ is_favorite }) => is_favorite) !== review.is_favorite
                    })
                    if (toUpdate.length) {
                      response = new Response(JSON.stringify(currentStorage), {
                        status: 200
                      })
                      toUpdate.forEach(restaurant => {
                        DBHelper.sendToggleFav(restaurant.id, restaurant.is_favorite)
                      })
                    } else {
                      DBHelper.putLocalDb(responseData, 'restaurants', 0)
                    }
                  } else {
                    DBHelper.putLocalDb(responseData, 'restaurants', 0)
                  }
                })
            } else {
              //compare and store review data
              DBHelper.fetchLocalDb('reviews', parseInt(url.split('=').pop()))
                .then(currentStorage => {
                  if (currentStorage.length > responseData.length) {
                    response = new Response(JSON.stringify(currentStorage), {
                      status: 200
                    })
                    const toUpdate = currentStorage.filter(review => {
                      return responseData.map(({ id }) => id).indexOf(review.id) === -1
                    })
                    toUpdate.forEach(review => {
                      DBHelper.addReview(review)
                    })
                  } else {
                    DBHelper.putLocalDb(responseData, 'reviews', responseData[0].restaurant_id)
                  }
                })
            }
          })
          return response
        })
          .catch(() => {
            return DBHelper.dbPromise.then(db => {
              if (url.indexOf('restaurant.html') === -1) {
                return DBHelper.fetchLocalDb('restaurants', 0)
              } else {
                return DBHelper.fetchLocalDb('reviews', url.split('=').pop())
              }
            })
              .then(data => {
                if (data) {
                  data = JSON.stringify(data)
                  const myResponse = new Response(data, {
                    status: 200
                  })
                  console.info('There was an error connecting to the server, showing last retrieved results')
                  return myResponse
                }
              })
          })
      )
    }
  } else {
    // all other fetch requests
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response
        }
        return fetch(request).then(response => {
          const cloneResponse = response.clone()
          caches
            .open(cacheName)
            .then(cache => cache.put(request, cloneResponse))
          return response
        })
      })
    )
  }
})