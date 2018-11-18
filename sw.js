let cacheName = 'v1'
let dbName = 'restaurandDb'

//if idb not loaded
if (typeof idb === 'undefined') {
  self.importScripts('/public/js/idb.min.js')
}

//db promise creation
var dbPromise = idb.open(dbName, 2, upgradeDb => {
  switch (upgradeDb.oldVersion) {
    case 0:
      const restaurantStore = upgradeDb.createObjectStore('restaurants')
    case 1:
      const reviewStore = upgradeDb.createObjectStore('reviews')
    case 2:
      const offlineStore = upgradeDb.createObjectStore('pending', { autoincrement: true })
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

  if (request.url.includes('localhost:1337')) {
    //reviews or restaurants for object store name
    const splitUrl = request.url.split('/')
    storeName = splitUrl[3]
    //restaurant id for reviews reqests
    const storeKey = splitUrl[4] ? parseInt(splitUrl[4].split('=').pop()) : 0
    if (request.method === 'GET') {
      event.respondWith(
        //check for data already in local db
        dbPromise.then(db => {
          return db.transaction(storeName)
            .objectStore(storeName)
            .get(storeKey)
        })
          //if data extracted from local db
          .then(data => {
            if (data) {
              data = JSON.stringify(data)
              const myResponse = new Response(data, {
                status: 200
              })
              return myResponse

            } else {
              //make the request
              return fetch(request).then(response => {
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
            }
          })
      )
    } else {
      fetch(request).then(response => {
        if (!response.ok) {
          dbPromise.then(db => {
            return db.transaction('pending', 'readwrite')
              .objectStore('pending')
              .put('test')
          })
          return new Response('....', {
            ok:true,
            staus: 200
          })
        }
        return response
      })
      // .catch((e) => {
      //   dbPromise.then(db => {
      //     db.transaction('pending', 'readwrite')
      //       .objectStore('pending')
      //       .put('test')
      //   })
      // })
    }
  } else {
    //all other fetch requests
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