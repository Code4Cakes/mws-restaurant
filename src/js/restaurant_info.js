let restaurant
var newMap

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', event => {
  initMap()
})

/**
 * Initialize leaflet map
 */
let initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      // console.error(error)
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
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
      fillBreadcrumb()
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap)
    }

    document
      .querySelector('img.leaflet-marker-icon')
      .setAttribute('aria-label', '')
  })
}

/**
 * Get current restaurant from page URL.
 */
let fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant)
    return
  }
  const id = getParameterByName('id')
  if (!id) {
    // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null)
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant
      if (!restaurant) {
        // console.error(error)
        return
      }
      DBHelper.fetchReviewsByRestaurantId(id, (error, reviews) => {
        self.restaurant.reviews = reviews
        fillRestaurantHTML()
        callback(null, restaurant)
      })
    })
  }
}

/**
 * Create restaurant HTML and add it to the page
 */
let fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name')
  const star = document.createElement('span')
  const classString = restaurant.is_favorite === true ? 'star favorite' : 'star'
  star.setAttribute('onclick', 'toggleFavorite()')
  star.setAttribute('class', classString)
  name.innerHTML = restaurant.name
  name.append(star)

  const address = document.getElementById('restaurant-address')
  address.innerHTML = restaurant.address

  const image = document.getElementById('restaurant-img')
  image.className = 'restaurant-img'
  image.alt = DBHelper.imageAltforRestaurant(restaurant)
  image.src = DBHelper.imageUrlForRestaurant(restaurant)

  const cuisine = document.getElementById('restaurant-cuisine')
  cuisine.innerHTML = restaurant.cuisine_type

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML()
  }
  // fill reviews
  fillReviewsHTML()
}

/**
 * Create restaurant operating hours HTML table and add it to the page.
 */
let fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById('restaurant-hours')
  for (let key in operatingHours) {
    const row = document.createElement('tr')

    const day = document.createElement('td')
    day.innerHTML = key
    row.appendChild(day)

    const time = document.createElement('td')
    time.innerHTML = operatingHours[key]
    row.appendChild(time)

    hours.appendChild(row)
  }
}

/**
 * Create all reviews HTML and add them to the jpgage.
 */
let fillReviewsHTML = (reviews = self.restaurant.reviews) => {

  const container = document.getElementById('reviews-container')
  const titleBox = document.createElement('div')
  titleBox.setAttribute('id', 'titleBox')
  const title = document.createElement('h2')
  title.innerHTML = 'Reviews'
  titleBox.append(title)
  container.prepend(titleBox)

  if (!reviews) {
    const noReviews = document.createElement('p')
    noReviews.innerHTML = 'No reviews yet!'
    titleBox.appendChild(noReviews)
    return
  }
  const ul = document.getElementById('reviews-list')
  while (ul.firstChild) ul.removeChild(ul.firstChild)
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review))
  })
  ul.appendChild(createForm())
  container.appendChild(ul)
}

/**
 * Create review HTML and add it to the jpgage.
 */
let createReviewHTML = review => {
  const li = document.createElement('article')
  li.setAttribute('tabindex', 0)
  const name = document.createElement('h3')
  name.innerHTML = review.name
  li.appendChild(name)

  const date = document.createElement('p')
  date.innerHTML = new Date(review.updatedAt).toLocaleString()
  li.appendChild(date)

  const rating = document.createElement('p')
  rating.innerHTML = `Rating: ${review.rating}`
  li.appendChild(rating)

  const comments = document.createElement('p')
  comments.innerHTML = review.comments
  li.appendChild(comments)

  return li
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
let fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb')
  const li = document.createElement('li')
  li.innerHTML = restaurant.name
  breadcrumb.appendChild(li)
}

/**
 * Get a parameter by name from page URL.
 */
let getParameterByName = (name, url) => {
  if (!url) url = window.location.href
  name = name.replace(/[\[\]]/g, '\\$&')
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

/**
 *Create form tile.
 */
let createForm = () => {
  const article = document.createElement('article')

  //Header
  const heading = document.createElement('h2')
  heading.innerHTML = 'Missing your favorite spot?'
  article.append(heading)
  const subheading = document.createElement('h3')
  subheading.innerHTML = 'Add a restaurant to our listings below.'
  article.append(subheading)

  //Form
  const form = document.createElement('form')
  form.setAttribute('action', 'javascript:void(0)')
  form.setAttribute('onsubmit', 'submitReview()')

  //First Input
  const div1 = document.createElement('div')

  const label1 = document.createElement('label')
  label1.innerHTML = 'Your Name'
  label1.setAttribute('for', 'reviewerName')
  div1.append(label1)

  const input1 = document.createElement('input')
  input1.setAttribute('type', 'text')
  input1.setAttribute('name', 'reviewerName')
  input1.setAttribute('id', 'reviewerName')
  input1.setAttribute('required', 'required')
  div1.append(input1)

  form.append(div1)

  //Second Input
  const div2 = document.createElement('div')

  const label2 = document.createElement('label')
  label2.innerHTML = 'Rating (1-5)'
  label2.setAttribute('for', 'newReviewRating')
  div2.append(label2)

  const input2 = document.createElement('input')
  input2.setAttribute('type', 'number')
  input2.setAttribute('min', '1')
  input2.setAttribute('max', '5')
  input2.setAttribute('name', 'newReviewRating')
  input2.setAttribute('id', 'newReviewRating')
  input2.setAttribute('required', 'required')
  div2.append(input2)

  form.append(div2)

  //Last User Input
  const div3 = document.createElement('div')

  const label3 = document.createElement('label')
  label3.innerHTML = 'Comments'
  label3.setAttribute('for', 'newReviewComments')
  div3.append(label3)

  const input3 = document.createElement('textarea')
  input3.setAttribute('name', 'newReviewComments')
  input3.setAttribute('id', 'newReviewComments')
  input3.setAttribute('rows', '5')
  input3.setAttribute('required', 'required')
  div3.append(input3)

  form.append(div3)

  //submit button
  const button = document.createElement('button')
  button.setAttribute('type', 'submit')
  button.innerHTML = 'Submit'

  form.append(button)

  article.append(form)

  return article
}

let toggleFavorite = () => {
  let thisStar = document.querySelector('.star')
  if (thisStar.className.indexOf('favorite') !== -1) {
    thisStar.className = 'star'
    DBHelper.sendToggleFav(self.restaurant.id, 'false')
  } else {
    thisStar.className = 'star favorite'
    DBHelper.sendToggleFav(self.restaurant.id, 'true')
  }

}

let submitReview = () => {
  let params = {
    id: self.restaurant.reviews.length + 1,
    restaurant_id: self.restaurant.id,
    name: document.getElementById('reviewerName').value,
    createdAt: new Date(),
    rating: parseInt(document.getElementById('newReviewRating').value),
    comments: document.getElementById('newReviewComments').value
  }

  DBHelper.addReviews(params)
  self.restaurant.reviews.push(params)
  fillReviewsHTML()

}