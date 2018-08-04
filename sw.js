let cacheName = "v1";

const urlList = [
  ".",
  "/",
  "/index.html",
  "/restaurant.html",
  "./css/styles.css",
  "./js/main.js",
  "./js/restaurant_info.js",
  "./js/dbhelper.js",
  "./data/restaurants.json",
  "./img/1.jpg",
  "./img/2.jpg",
  "./img/3.jpg",
  "./img/4.jpg",
  "./img/5.jpg",
  "./img/6.jpg",
  "./img/7.jpg",
  "./img/8.jpg",
  "./img/9.jpg",
  "./img/10.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(urlList, { mode: "no-cors" });
    })
  );
});

self.addEventListener("fetch", event => {
  let request = event.request;

  if (event.request.url.includes("/restaurant.html")) {
    request = new Request("/restaurant.html");
  }

  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response;
      }

      return fetch(request).then(response => {
        const cloneResponse = response.clone();
        caches.open(cacheName).then(cache => cache.put(request, cloneResponse));

        return response;
      });
    })
  );
});
