import {
  Restaurant,
  UserGeneratedRestaurant,
  ReviewInfo,
} from './restaurant-class.js';

/**
 * Creates a 'model' instance to handle data
 * @class DataRepository
 */

class DataRepository {
  constructor() {
    this.restaurantDb = [];
    this.userPosition = {};
  }

  /**
   * Gets a restaurant matching passed in id
   * @param {string} id - restaurant id
   * @returns {object}
   * @memberof DataRepository
   */

  getRestaurantDataFromId = (id) => {
    let restaurantData = null;
    for (const restaurant of this.restaurantDb) {
      if (restaurant.restaurantId === id) {
        restaurantData = restaurant;
      }
    }
    return restaurantData;
  };

  /**
   * Filters restaurants based on average rating value
   * @param {object} filterOptions - filter from and to values
   * @returns {object[]} - an array containing restaurant objects that match the filter criteria
   * @memberof DataRepository
   */

  filterRestaurant = (filterOptions) => {
    const filtered = this.restaurantDb.filter((restaurant) => {
      return (
        Math.floor(restaurant.averageRating) >= filterOptions.fromValue &&
        Math.floor(restaurant.averageRating) <= filterOptions.toValue
      );
    });
    return filtered;
  };

  /**
   * Adds a new review, made by a user to a restaurants data
   * Updates Restaurant's average and total reviews
   * @param {string} restaurantId
   * @param {object} reviewData
   * @returns {object} - restaurant that has been reviewed
   * @memberof DataRepository
   */

  addRestaurantReview = (restaurantId, reviewData) => {
    const reviewInfo = this._createReviewInfo(reviewData);
    for (const restaurant of this.restaurantDb) {
      if (restaurant.restaurantId === restaurantId) {
        restaurant.reviews.unshift(reviewInfo);
        restaurant.totalRatings += 1;
        restaurant.averageRating = restaurant.updateAverageRating(
          reviewInfo.stars
        );
        restaurant.ratingStars = Restaurant.createRatingArray(
          restaurant.averageRating
        );
        return restaurant;
      }
    }
  };

  /**
   * Add a new restaurant (from a user) to the database
   * @param {object} restaurant - Restaurant information gotten from the users entry
   * @memberof DataRepository
   */

  addRestaurant = (restaurant) => {
    this.restaurantDb.unshift(new UserGeneratedRestaurant(restaurant));
  };

  /**
   * Creates an instance of @class ReviewInfo
   * @param {object} inputData - Review information gotten from the users entry
   * @returns {object} - An instance of @class ReviewInfo
   * @memberof DataRepository
   */

  _createReviewInfo(inputData) {
    return new ReviewInfo(inputData.name, inputData.stars, inputData.comment);
  }
}

const DATA_REPOSITORY = new DataRepository();

export default DATA_REPOSITORY;
