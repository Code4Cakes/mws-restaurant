let cacheName = 'v1';
let dbName = 'restaurandDb';

if (typeof idb === 'undefined') {
  self.importScripts('js/idb.js');
}

var dbPromise = idb.open(dbName, 1, upgradeDB => {
  const objStore = upgradeDB.createObjectStore('restaurants');
});

const urlList = [
  '.',
  '/',
  '/index.html',
  '/restaurant.html',
  './css/styles.css',
  './js/main.js',
  './js/restaurant_info.js',
  './js/dbhelper.js',
  './js/idb.js',
  './img/1.jpg',
  './img/2.jpg',
  './img/3.jpg',
  './img/4.jpg',
  './img/5.jpg',
  './img/6.jpg',
  './img/7.jpg',
  './img/8.jpg',
  './img/9.jpg',
  './img/10.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(urlList, { mode: 'no-cors' });
    })
  );
});

self.addEventListener('fetch', event => {
  let request = event.request;

  if (request.url.includes('localhost:1337')) {
    event.respondWith(
      dbPromise
        .then(db => {
          const tx = db.transaction('restaurants');
          const restStore = tx.objectStore('restaurants');
          const dbData = restStore.get(0);
        })
        .then(data => {
          if (data) {
            data = JSON.stringify(data);
            const myResponse = new Response(data, {
              status: 200
            });
            return myResponse;
          } else {
            return fetch(request).then(response => {
              const cloneResponse = response.clone();
              cloneResponse.json().then(restaurants => {
                dbPromise.then(db => {
                  db.transaction('restaurants', 'readwrite')
                    .objectStore('restaurants')
                    .put(restaurants, 0);
                });
              });
              return response;
            }); 
          }
        })
    );
  } else {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response;
        }
        return fetch(request).then(response => {
          const cloneResponse = response.clone();
          caches
            .open(cacheName)
            .then(cache => cache.put(request, cloneResponse));
          return response;
        });
      })
    );
  }
});

getRestaurants = () => {
  let req = window.indexedDB.open('restaurantDB', 1);

  req.onsuccess = e => {
    let db = event.result;

    let tx = db.transaction('restaurants');
    let objStore = tx.objectStore('restaurants');
    let getReq = objStore.getAll();

    getReq.onerror(e => {
      console.log(e);
    });
    getReq.oncomplete(e => {
      return req.result;
    });
  };
};
