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

  static get dbPromise() {
    return idb.open('restaurandDb', 3, upgradeDb => {
      switch (upgradeDb.oldVersion) {
        case 0:
          const restaurantStore = upgradeDb.createObjectStore('restaurants')
        case 1:
          const reviewStore = upgradeDb.createObjectStore('reviews')
      }
    })
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

  /*
  * Set a restaurant as favorite or not
  */
  static sendToggleFav(id, add) {
    if (navigator.onLine) {
      fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=${add}`, {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: new Headers({ 'Content-Type': 'application/json' })
      })
        .then(response => {
          return this.setFavoriteLocalDb({
            id: id,
            is_favorite: add
          })
        })
        .catch(() => {
          // console.warn('Your attempt to contact the server failed. Storing locally and will try again later.')
          this.setFavoriteLocalDb({
            id: id - 1,
            is_favorite: add
          })
        })
    } else {
      // console.info('Your browser is currently offline. Storing locally and will try again later.')
      console.log(id)
      console.log(add)
      this.setFavoriteLocalDb({
        id: id,
        is_favorite: add
      })
    }
  }

  /*
  * get from local db
  */
  static fetchLocalDb(store, key) {
    return this.dbPromise
      .then(db => {
        return db.transaction(store)
          .objectStore(store)
          .get(key)
      })
  }

  /*
  * Write list to local DB
  */
  static putLocalDb(data, store, key) {
    this.dbPromise
      .then(db => {
        db.transaction(store, 'readwrite')
          .objectStore(store)
          .put(data, key)
      })
      .catch(e => {
        console.log(e)
      })
  }

  /*
  *Handle changing restaurant as favoirite in local DB
  */
  static setFavoriteLocalDb(restaurant) {
    // store whole response or just change attr if that's it
    const jsonIndex = restaurant.id - 1
    this.fetchLocalDb('restaurants', 0)
      .then(restaurantList => {
        restaurantList[jsonIndex].is_favorite = restaurant.is_favorite
        this.putLocalDb(restaurantList, 'restaurants', 0)
      })
  }

  /*
  * Add a review
  */
  static addReview(review) {
    if (navigator.onLine) {
      fetch('http://localhost:1337/reviews/', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(review)
      })
        .then(response => {
          // console.warn('Your attempt to contact the server failed. Storing locally and will try again later.')
          this.storeReviewLocalDb(response)
        })
        .catch(() => {
          this.storeReviewLocalDb(review)
        })
    } else {
      this.storeReviewLocalDb(review)
      // console.info('Your browser is currently offline. Storing locally and will try again later.')
    }
  }

  static storeReviewLocalDb(review) {
    const id = review.restaurant_id
    this.fetchLocalDb('reviews', id)
      .then(reviewList => {
        reviewList.push(review)
        this.putLocalDb(reviewList, 'reviews', id)
      })
  }
}
