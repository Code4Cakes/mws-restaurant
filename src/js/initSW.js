/**
 * Service Worker
 */
let registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(
        function() {
          // console.log('ServiceWorker registration successful')
        },
        function() {
          // console.log('ServiceWorker registration failed')
        }
      )
    })
  }
}

document.addEventListener('DOMContentLoaded', event => {
  registerServiceWorker()
})