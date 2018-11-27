let cacheName = 'v1'
let dbName = 'restaurandDb'

//if idb not loaded
if (typeof idb === 'undefined') {
  self.importScripts('/public/js/idb.min.js')
}

//db promise creation
var dbPromise = idb.open(dbName, 3, upgradeDb => {
  switch (upgradeDb.oldVersion) {
    case 0:
      const restaurantStore = upgradeDb.createObjectStore('restaurants')
    case 1:
      const reviewStore = upgradeDb.createObjectStore('reviews')
  }
})

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
  // event.waitUntil(
  //   caches.open(cacheName).then(cache => {
  //     cache.addAll(urlList, {
  //       mode: 'no-cors'
  //     })
  //   })
  // )
})

//intercept fetch requests
self.addEventListener('fetch', event => {
  let request = event.request
  //if it's going to the api

  if (request.url.includes('localhost:1337')) {
    //reviews or restaurants for object store name
    const splitUrl = request.url.split('/')
    const storeName = splitUrl[3]

    //Requesting info, try to pull, get from browser if fail
    if (request.method === 'GET') {
      const storeKey = splitUrl[4] ? parseInt(splitUrl[4].split('=').pop()) : 0
      event.respondWith(
        fetch(request).then(response => {
          const cloneResponse = response.clone()
          //store the results wit the clone
          cloneResponse.json().then(responseData => {
            dbPromise.then(db => {
              db.transaction(storeName, 'readwrite')
                .objectStore(storeName)
                .put(responseData, storeKey)
            })
          })
          return response
        })
          .catch(() => {
            return dbPromise.then(db => {
              return db.transaction(storeName)
                .objectStore(storeName)
                .get(storeKey)
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

    } else {

      let splitUrl = request.referrer.indexOf('id=') ? request.referrer.split('=') : request.url.split('/')
      let restaurantId = splitUrl[4] ? splitUrl[4] - 1 : undefined
      let storeKey = splitUrl[4] ? 0 : splitUrl[1]
      let cloneRequest = request.clone()

      event.respondWith(
        fetch(request).then(response => {
          let cloneResponse = response.clone()
          cloneResponse.json().then(data => {
            if (data.is_favorite) {
              let id = data.id
              dbPromise.then(db => {
                return db.transaction('restaurants')
                  .objectStore('restaurants')
                  .get(0)
              })
                .then(data => {
                  data[id].is_favorite = !data[id].is_favorite
                  dbPromise.then(db => {
                    db.transaction('restaurants', 'readwrite')
                      .objectStore('restaurants')
                      .put(data, 0)
                  })

                })
            } else {
              let review = data
              dbPromise.then(db => {
                return db.transaction('reviews')
                  .objectStore('reviews')
                  .get(review.restaurant_id)
              })
                .then(data => {
                  data.push(review)
                  return dbPromise.then(db => {
                    db.transaction('reviews', 'readwrite')
                      .objectStore('reviews')
                      .put(data, review.restaurant_id)
                  })
                })
            }
          })
          return response
        })
          .catch(() => {
            cloneRequest.json().then(data => {
              if (data.is_favorite) {
                let id = data.id
                dbPromise.then(db => {
                  return db.transaction('restaurants')
                    .objectStore('restaurants')
                    .get(0)
                })
                  .then(data => {
                    data[id].is_favorite = !data[id].is_favorite
                    dbPromise.then(db => {
                      db.transaction('restaurants', 'readwrite')
                        .objectStore('restaurants')
                        .put(data, 0)
                    })

                  })
              } else {
                let review = data
                dbPromise.then(db => {
                  return db.transaction('reviews')
                    .objectStore('reviews')
                    .get(review.restaurant_id)
                })
                  .then(data => {
                    data.push(review)
                    return dbPromise.then(db => {
                      db.transaction('reviews', 'readwrite')
                        .objectStore('reviews')
                        .put(data, review.restaurant_id)
                    })
                  })
              }
            })
          })
      )
    }
  } else {
    //all other fetch requests
    // event.respondWith(
    //   caches.match(request).then(response => {
    //     if (response) {
    //       return response
    //     }
    //     return fetch(request).then(response => {
    //       const cloneResponse = response.clone()
    //       caches
    //         .open(cacheName)
    //         .then(cache => cache.put(request, cloneResponse))
    //       return response
    //     })
    //   })
    // )
  }
})