let restaurants,
  neighborhoods,
  cuisines,
  newMap,
  markers = [],
  db

/**
 * Fetch all neighborhoods and set their HTML.
 */
let fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) {
      // Got an error
      // console.error(error)
    } else {
      self.neighborhoods = neighborhoods
      fillNeighborhoodsHTML()
    }
  })
}

/**
 * Set neighborhoods HTML.
 */
let fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select')
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option')
    option.innerHTML = neighborhood
    option.value = neighborhood
    select.append(option)
  })
}

/**
 * Fetch all cuisines and set their HTML.
 */
let fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) {
      // Got an error!
      // console.error(error)
    } else {
      self.cuisines = cuisines
      fillCuisinesHTML()
    }
  })
}

/**
 * Set cuisines HTML.
 */
let fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select')

  cuisines.forEach(cuisine => {
    const option = document.createElement('option')
    option.innerHTML = cuisine
    option.value = cuisine
    select.append(option)
  })
}

/**
 * Initialize leaflet map, called from HTML.
 */
let initMap = () => {
  self.newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false
  })
  L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}',
    {
      mapboxToken:
        'pk.eyJ1IjoiYnJhZHl0Zm9yZCIsImEiOiJjamlydTVnZngwMXlhM3dxbTE2NzNhbWNjIn0.vP54TruwPoPWQLYZdPKcug',
      maxZoom: 18,
      id: 'mapbox.streets'
    }
  ).addTo(newMap)

  updateRestaurants()
}

/**
 * Update page and map for current restaurants.
 */
let updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select')
  const nSelect = document.getElementById('neighborhoods-select')

  const cIndex = cSelect.selectedIndex
  const nIndex = nSelect.selectedIndex

  const cuisine = cSelect[cIndex].value
  const neighborhood = nSelect[nIndex].value

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    (error, restaurants) => {
      if (error) {
        // Got an error!
        // console.error(error)
      } else {
        resetRestaurants(restaurants)
        fillRestaurantsHTML()
      }
    }
  )
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
let resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = []
  const ul = document.getElementById('restaurants-list')
  ul.innerHTML = ''

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove())
  }
  self.markers = []
  self.restaurants = restaurants
}

/**
 * Create all restaurants HTML and add them to the jpgage.
 */
let fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list')
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant))
  })
  ul.append(createForm())

  addMarkersToMap()
}

/**
 * Create restaurant HTML.
 */
let createRestaurantHTML = restaurant => {
  const art = document.createElement('article')

  const image = document.createElement('img')
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant)
  image.alt = DBHelper.imageAltforRestaurant(restaurant)
  art.append(image)

  const header = document.createElement('header')
  const name = document.createElement('h2')
  name.innerHTML = restaurant.name
  header.appendChild(name)
  art.append(header)

  const neighborhood = document.createElement('p')
  neighborhood.innerHTML = restaurant.neighborhood
  art.append(neighborhood)

  const address = document.createElement('p')
  address.innerHTML = restaurant.address
  art.append(address)

  const more = document.createElement('a')
  more.innerHTML = 'View Details'
  more.href = DBHelper.urlForRestaurant(restaurant)
  more.setAttribute('role', 'button')

  art.append(more)

  return art
}

/**
 * Add markers for current restaurants to the map.
 */
let addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap)
    marker.on('click', onClick)
    function onClick() {
      window.location.href = marker.options.url
    }
    marker.on('keydown', e => {
      alert()
      event.preventDefault()
      if (e.keyCode === 13) onClick()
    })
    self.markers.push(marker)
  })
  document.querySelectorAll('img.leaflet-marker-icon').forEach(elem => {
    elem.setAttribute('role', 'link')
  })
}

let submitEntry = (form) => {}

let createForm = () => {
  const article = document.createElement('article')
  article.setAttribute('id', 'form-tile')

  //Header
  const header = document.createElement('header')
  const heading = document.createElement('h2')
  heading.innerHTML = 'Missing your favorite spot?'
  header.append(heading)
  const subheading = document.createElement('h3')
  subheading.innerHTML = 'Add a restaurant to our listings below.'
  header.append(subheading)
  article.append(header)

  //Form
  const form = document.createElement('form')
  form.setAttribute('action', 'javascript:void  (0)')
  form.setAttribute('onsubmit', 'submitEntry(this)')

  //First Input
  const div1 = document.createElement('div')

  const label1 = document.createElement('label')
  label1.innerHTML = 'Name of Establishment'
  label1.setAttribute('for', 'newPlaceName')
  div1.append(label1)

  const input1 = document.createElement('input')
  input1.setAttribute('type', 'text')
  input1.setAttribute('name', 'newPlaceName')
  input1.setAttribute('id', 'newPlaceName')
  div1.append(input1)

  article.append(div1)

  //Second Input
  const div2 = document.createElement('div')

  const label2 = document.createElement('label')
  label2.innerHTML = 'Rating'
  label2.setAttribute('for', 'newPlaceRating')
  div2.append(label2)

  const input2 = document.createElement('input')
  input2.setAttribute('type', 'number')
  input2.setAttribute('name', 'newPlaceRating')
  input2.setAttribute('id', 'newPlaceRating')
  div2.append(input2)

  article.append(div2)

  //Last User Input
  const div3 = document.createElement('div')

  const label3 = document.createElement('label')
  label3.innerHTML = 'Comments'
  label3.setAttribute('for', 'newPlaceComments')
  div3.append(label3)

  const input3 = document.createElement('textarea')
  input3.setAttribute('name', 'newPlaceComments')
  input3.setAttribute('id', 'newPlaceComments')
  div3.append(input3)

  article.append(div3)

  //submit button
  const button = document.createElement('button')
  button.setAttribute('type', 'submit')
  button.innerHTML = 'Submit'

  article.append(button)

  article.append(form)

  return article
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  initMap() // added
  fetchNeighborhoods()
  fetchCuisines()
})