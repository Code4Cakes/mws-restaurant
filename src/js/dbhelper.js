/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(`${DBHelper.DATABASE_URL}/restaurants`).then(res => {
      if (res.status === 200) {
        // Got a success response from server!
        res.json().then((restaurants) => {
          callback(null, restaurants)
        })
      } else {
        // Oops!. Got an error from server.
        const error = `Request failed. Returned status of ${xhr.status}`
        callback(error, null)
      }
    }).catch(error => {
      // console.log(error)
    })
  }

  /**
   * Fetch all reviews.
   */
  static fetchReviews(callback) {
    fetch(`${DBHelper.DATABASE_URL}/reviews`).then(res => {
      if (res.status === 200) {
        // Got a success response from server!

        res.json().then((reviews) => {
          callback(null, reviews)
        })
      } else {
        // Oops!. Got an error from server.
        const error = `Request failed. Returned status of ${xhr.status}`
        callback(error, null)
      }
    }).catch(error => {
      // console.log(error)
    })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null)
      } else {
        const restaurant = restaurants.find(r => r.id == id)
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant)
        } else {
          // Restaurant does not exist in the database
          callback('Restaurant does not exist', null)
        }
      }
    })
  }

  /**
   * Fetch all review by restaurant ID.
   */
  static fetchReviewsByRestaurantId(id, callback) {
    // fetch all reviews with proper error handling.
    fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${id}`)
      .then(res => {
        if (res.status === 200) {
          // Got a success response from server!
          res.json().then((reviews) => {
            callback(null, reviews)
          })
        } else {
          // Oops!. Got an error from server.
          const error = `Request failed. Returned status of ${xhr.status}`
          callback(error, null)
        }
      }).catch(error => {
        // console.log(error)
      })
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null)
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine)
        callback(null, results)
      }
    })
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null)
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood)
        callback(null, results)
      }
    })
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null)
      } else {
        let results = restaurants
        if (cuisine != 'all') {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine)
        }
        if (neighborhood != 'all') {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood)
        }
        callback(null, results)
      }
    })
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null)
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        )
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        )
        callback(null, uniqueNeighborhoods)
      }
    })
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null)
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        )
        callback(null, uniqueCuisines)
      }
    })
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `public/img/${restaurant.id}.jpg`
  }

  /**
   * Restaurant image alt tag
   */
  static imageAltforRestaurant(restaurant) {
    return restaurant.imageAlt
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker(
      [restaurant.latlng.lat, restaurant.latlng.lng],
      {
        title: restaurant.name,
        alt: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant)
      }
    )
    marker.addTo(newMap)
    return marker
  }

  static sendToggleFav(id, add) {
    let favHeaders = new Headers()
    favHeaders.append('Content-Type', 'application/json')
    console.log(add);
    
    let url = `http://localhost:1337/restaurants/${id}/?is_favorite=${add}`
    let options = {
      method: 'PUT',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
    }
    this.sendRequest(url, options)
  }

  static addReviews(review) {
    let reviewHeaders = new Headers()
    reviewHeaders.append('Content-Type', 'application/json')

    let options = {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: reviewHeaders,
      body: JSON.stringify(review)
    }

    this.sendRequest('http://localhost:1337/reviews/', options)
  }

  static sendRequest(url, options) {
    fetch(url, options)
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText)
        }
        return response.json()
      })
      .then((data) => {
        console.log('Sent', data)
      })
      .catch(error => console.log('Failed', error))
  }
}
