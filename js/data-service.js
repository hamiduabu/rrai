import UI from './app-view.js';
import API from './api-config.js';
import MAP_SERVICE from './map-components.js';
import {
  LocalDbRestaurant,
  GoogleSourcedRestaurant,
  SearchResult,
} from './restaurant-class.js';
import DATA_REPOSITORY from './data-repository.js';

/**
 * Handles querying and receiving remote data
 * @class DataService
 */

class DataService {
  /**
   * Get restaurants from all API sources
   * (local JSON, Google) and formats the data
   * @static
   * @param {number} lat - location latitude
   * @param {number} lng - location longitude
   * @memberof DataService
   */

  static getRestaurants(lat, lng) {
    DataService._handleRestaurantData([
      DataService._getLocalDbData(),
      DataService._getGoogleAPIData(lat, lng),
    ]);
  }

  /**
   * Retrieves Restaurant Street View Image for a restaurant where it is available
   * If Street View Image is not available, a Google Place Photo is used
   * If no Google Place Photo,a custom image is used(especially for user added restaurants)
   * A default generic image is used with the error 'No Image Found' where all the above fails
   * @static
   * @param {object} restaurant - restaurant data for which image is to be reteieved
   * @memberof DataService
   */

  static getAvailableImage(restaurant) {
    const streetViewImgService = MAP_SERVICE.streetViewImgService();
    streetViewImgService.getPanorama(
      { location: restaurant.location, radius: 50 },
      function (result, status) {
        if (status === 'OK') {
          UI.restaurantImage.src = API.googleMaps.getGoogleStreetViewImage(
            result.location.pano
          );
        } else if (restaurant.placePhotoUrl !== '') {
          UI.restaurantImage.src = restaurant.placePhotoUrl;
        } else if (restaurant.customImg !== '') {
          UI.restaurantImage.src = restaurant.customImg;
        } else {
          UI.imgErrorMsg.textContent = 'NO IMAGE TO DISPLAY';
          UI.imgErrorMsg.classList.add('error-msg');
          UI.restaurantImage.src =
            '../assets/img/default/default_geocode-1x.png';
        }
      }
    );
  }

  /**
   * Google API requests to search for restaurants in
   * other locations off the map center
   * @static
   * @param {string} query - search keyword
   * @memberof DataService
   */

  static makeSearchRequest(query) {
    const searchService = MAP_SERVICE.searchService();
    const searchRequest = {
      location: MAP_SERVICE.map.getCenter(),
      radius: 500,
      keyword: query,
    };
    searchService.nearbySearch(searchRequest, function (results, status) {
      if (status === 'OK') {
        const foundRestaurantsData = [];
        for (const result of results) {
          let foundRestaurant = new SearchResult({
            restaurantName: result.name,
            address: result.vicinity,
            location: result.geometry.location,
            averageRating: result.rating,
            totalRatings: result.user_ratings_total,
            photos: result.photos,
            restaurantId: result.place_id,
          });
          foundRestaurantsData.push(foundRestaurant);
        }
        MAP_SERVICE.setRestaurantMarkers(
          foundRestaurantsData,
          'searchResultMarkers',
          '../assets/map-icons/icons8-restaurant-location-edited-orange-32.png'
        );
      }
      if (status === 'ZERO_RESULTS') {
        UI.toggleNotificationAlert(UI.zeroResultsearchMsg);
      }
    });
  }

  /**
   * Fetch restaurants from local JSON file
   * @static
   * @returns {Promise} - data sourced from local JSON
   * @memberof DataService
   */

  static _getLocalDbData() {
    const LOCALDB_URL = '../data/restaurants.json';
    return fetch(LOCALDB_URL)
      .then((response) => {
        return response.ok
          ? response.json()
          : Promise.reject(response.statusText);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  /**
   * Google API requests for nearby restaurants
   * @static
   * @param {number} lat - latitude
   * @param {number} lng - longitude
   * @returns {Promise} - data sourced from google API
   * @memberof DataService
   */

  static _getGoogleAPIData(lat, lng) {
    return new Promise((resolve, reject) => {
      const infoRequest = {
        location: new google.maps.LatLng(lat, lng),
        radius: 500,
        keyword: 'restaurant',
      };
      const searchService = MAP_SERVICE.searchService();
      searchService.nearbySearch(infoRequest, function (places, status) {
        if (status === 'OK' || status === 'ZERO_RESULTS') {
          resolve(places);
        } else {
          reject(new Error(status));
        }
      });
    }).catch(console.error);
  }

  /**
   * Handles Formating of recieved data from API requests
   * @static
   * @param {Promise[]} restaurantDataPromiseArray - An array containing all promise(s) from API requests
   * @returns
   * @memberof DataService
   */

  static _handleRestaurantData(restaurantDataPromiseArray) {
    return Promise.all(restaurantDataPromiseArray)
      .then((restaurants) => {
        const mapBounds = MAP_SERVICE.mapBounds();
        const restaurantData = [];
        const localDbRestaurantIds = [];
        for (const restaurant of restaurants[0]) {
          if (
            mapBounds.contains({ lat: restaurant.lat, lng: restaurant.lng })
          ) {
            let localDbRestaurant = new LocalDbRestaurant({
              restaurantName: restaurant.restaurantName,
              address: restaurant.address,
              lat: restaurant.lat,
              lng: restaurant.lng,
              averageRating: restaurant.averageRating,
              totalRatings: restaurant.totalRatings,
              reviews: restaurant.reviews,
              restaurantId: restaurant.restaurantId,
              photos: restaurant.photos,
            });
            restaurantData.push(localDbRestaurant);
            localDbRestaurantIds.push(restaurant.restaurantId);
          }
        }
        for (const restaurant of restaurants[1]) {
          if (!localDbRestaurantIds.includes(restaurant.place_id)) {
            let googleAPIRestaurants = new GoogleSourcedRestaurant({
              restaurantName: restaurant.name,
              address: restaurant.vicinity,
              lat: restaurant.geometry.location.lat(),
              lng: restaurant.geometry.location.lng(),
              averageRating: restaurant.rating,
              totalRatings: restaurant.user_ratings_total,
              placeId: restaurant.place_id,
              photos: restaurant.photos,
            });
            restaurantData.push(googleAPIRestaurants);
          }
        }

        DataService._addReviewsFromGoogleAPI(restaurantData);
        DataService._storeRestaurantData(restaurantData);
        UI.renderRestaurants(DATA_REPOSITORY.restaurantDb);
        MAP_SERVICE.setRestaurantMarkers(DATA_REPOSITORY.restaurantDb);

        // Show filter options when restaurants have been loaded
        UI.filterOptions.classList.remove('invisible');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  /**
   * Add reviews from Google Maps API requests to
   * Google sourced reataurants
   * @static
   * @param {*} restaurantData
   * @memberof DataService
   */

  static _addReviewsFromGoogleAPI(restaurantData) {
    const googleAPIRestaurantIds = [];
    for (const restaurant of restaurantData) {
      if (restaurant.source === 'GOOGLE') {
        googleAPIRestaurantIds.push(restaurant.restaurantId);
      }
    }
    for (const id of googleAPIRestaurantIds) {
      DataService._getReviews(id, restaurantData);
    }
  }

  /**
   * Place details request to get reviews
   * for Google sourced restaurants
   * @static
   * @param {string} restaurantId
   * @param {object[]} restaurantData
   * @memberof DataService
   */

  static _getReviews(restaurantId, restaurantData) {
    const searchService = MAP_SERVICE.searchService();
    const request = {
      placeId: restaurantId,
      fields: ['reviews'],
    };
    searchService.getDetails(request, function (place, status) {
      if (status === 'OK') {
        for (const restaurant of restaurantData) {
          if (restaurant.restaurantId === restaurantId) {
            const reviews = GoogleSourcedRestaurant.selectReviewInfo(
              place.reviews
            );
            for (const review of reviews) {
              restaurant.reviews.push(review);
            }
          }
        }
      }
    });
  }

  /**
   * Store data in the data repository
   * @static
   * @param {object[]} restaurantData - All restaurant data
   * @memberof DataService
   */

  static _storeRestaurantData(restaurantData) {
    for (const restaurant of restaurantData) {
      DATA_REPOSITORY.restaurantDb.push(restaurant);
    }
  }
}

export default DataService;
