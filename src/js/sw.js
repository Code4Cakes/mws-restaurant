let cacheName = 'v1'
let dbName = 'restaurandDb'

if (typeof idb === 'undefined') {
  self.importScripts('idb.min.js')
}

var dbPromise = idb.open(dbName, 1, upgradeDB => {
  const objStore = upgradeDB.createObjectStore('restaurants')
})

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
  '/public/img/10.jpg'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(urlList, {
        mode: 'no-cors'
      })
    })
  )
})

self.addEventListener('fetch', event => {
  let request = event.request

  if (request.url.includes('localhost:1337')) {
    event.respondWith(
      dbPromise
        .then(db => {
          const tx = db.transaction('restaurants')
          const restStore = tx.objectStore('restaurants')
          const dbData = restStore.get(0)
        })
        .then(data => {
          if (data) {
            data = JSON.stringify(data)
            const myResponse = new Response(data, {
              status: 200
            })
            return myResponse
          } else {
            return fetch(request).then(response => {
              const cloneResponse = response.clone()
              cloneResponse.json().then(restaurants => {
                dbPromise.then(db => {
                  db.transaction('restaurants', 'readwrite')
                    .objectStore('restaurants')
                    .put(restaurants, 0)
                })
              })
              return response
            })
          }
        })
    )
  } else {
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