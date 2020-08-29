import API from './api-config.js';

/**
 * Restaurant Base Class
 * @class Restaurant
 */
class Restaurant {
  constructor({
    restaurantName,
    address,
    lat,
    lng,
    averageRating = 0,
    totalRatings = 0,
    reviews = [],
    placeId,
    photos = [],
    customImg = '',
    source,
    placePhotoUrl = '',
  }) {
    this.restaurantName = restaurantName;
    this.address = address;
    this.lat = lat;
    this.lng = lng;
    this.location = new google.maps.LatLng(lat, lng);
    this.averageRating = averageRating;
    this.totalRatings = totalRatings;
    this.reviews = reviews;
    this.restaurantId = placeId;
    this.photos = photos;
    this.customImg = customImg;
    this.source = source;
    this.placePhotoUrl = placePhotoUrl;
    this.ratingStars = Restaurant.createRatingArray(averageRating);
  }

  /**
   * Store rating star images in an array
   * @static
   * @param {number} rating - The average rating of the restaurant
   * @returns An array with paths to the rating star image file
   */
  static createRatingArray(rating) {
    const imgPath = 'assets/rating-stars/';
    const ratingArray = [];
    const maxRating = 5;
    for (let i = 0; i < maxRating; i += 1) {
      if (rating === 0) {
        ratingArray.push(`${imgPath}empty.png`);
      } else if (rating > 0 && rating < 0.5) {
        ratingArray.push(`${imgPath}quarter.png`);
        rating = 0;
      } else if (rating === 0.5) {
        ratingArray.push(`${imgPath}half.png`);
        rating = 0;
      } else if (rating > 0.5 && rating < 1) {
        ratingArray.push(`${imgPath}three-quarter.png`);
        rating = 0;
      } else if (rating >= 1) {
        ratingArray.push(`${imgPath}full.png`);
        rating -= 1;
      }
    }
    return ratingArray;
  }

  /**
   * calculates and returns the average rating
   * when a new rating is given
   * @param  {number} newRating
   * @returns Number representing the new average rating
   * @memberof Restaurant
   */
  updateAverageRating(newRating) {
    return Number(
      (
        this.averageRating +
        (newRating - this.averageRating) / this.totalRatings
      ).toFixed(1)
    );
  }
}

/**
 * Restaurant Review Information Class
 * @class ReviewInfo
 */
class ReviewInfo {
  constructor(name, stars, comment) {
    this.name = ReviewInfo.setName(name.trim());
    this.stars = Number(stars);
    this.comment = ReviewInfo.setComment(comment.trim());
  }

  /**
   * Sets reviewer's name to 'anonymous' when no name is given.
   * @static
   * @param {string} name
   * @returns {string}
   * @memberof ReviewInfo
   */
  static setName(name) {
    return !name ? 'Anonymous' : name;
  }

  /**
   * Sets reviewer's comment to 'No Comment' when no comment is given.
   * @static
   * @param {string} comment
   * @returns
   * @memberof ReviewInfo
   */
  static setComment(comment) {
    return !comment ? 'No Comment' : comment;
  }
}

/**
 * Sub-Class for Restaurants
 * Sourced from local JSON(Db) file
 * @class LocalDbRestaurant
 * @extends {Restaurant}
 */
class LocalDbRestaurant extends Restaurant {
  constructor({
    restaurantName,
    address,
    lat,
    lng,
    averageRating = 0,
    totalRatings = 0,
    reviews = [],
    restaurantId,
    photos = [],
    customImg = '',
  }) {
    super({
      restaurantName,
      address,
      lat,
      lng,
      averageRating,
      totalRatings,
      reviews,
      photos,
      customImg,
    });
    this.restaurantName = restaurantName;
    this.address = address;
    this.lat = lat;
    this.lng = lng;
    this.location = new google.maps.LatLng(lat, lng);
    this.averageRating = averageRating;
    this.totalRatings = totalRatings;
    this.reviews = reviews;
    this.restaurantId = restaurantId;
    this.photos = photos;
    this.customImg = customImg;
    this.source = 'local';
    this.placePhotoUrl = LocalDbRestaurant.getPhotoUrl(photos);
    this.ratingStars = Restaurant.createRatingArray(this.averageRating);
  }

  /**
   * Gets the URL for place photo
   * Alternative image when Street view image is unavailable
   * @static
   * @param {object[]} photos - An array with an object item with place photo details
   * @returns {string} - a url to google place photo image
   * @memberof LocalDbRestaurant
   */
  static getPhotoUrl(photos) {
    let placePhotoUrl = '';
    if (photos.length > 0) {
      placePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photoreference=${photos[0].photo_reference}&key=${API.googleMaps.apiKey}`;
    }
    return placePhotoUrl;
  }
}

/**
 * Restaurant Sub-Class for Restaurants
 * Sourced from Google
 * @class GoogleSourcedRestaurant
 * @extends {Restaurant}
 */
class GoogleSourcedRestaurant extends Restaurant {
  constructor({
    restaurantName,
    address,
    lat,
    lng,
    averageRating,
    totalRatings,
    placeId,
    photos = [],
    customImg = '',
  }) {
    super({
      restaurantName,
      address,
      lat,
      lng,
      averageRating,
      totalRatings,
      placeId,
      customImg,
    });
    this.restaurantName = restaurantName;
    this.address = address;
    this.lat = lat;
    this.lng = lng;
    this.location = new google.maps.LatLng(lat, lng);
    this.averageRating = averageRating;
    this.totalRatings = totalRatings;
    this.reviews = [];
    this.restaurantId = placeId;
    this.photos = GoogleSourcedRestaurant.managePhotos(photos).preferredPhoto;
    this.customImg = customImg;
    this.source = 'GOOGLE';
    this.placePhotoUrl = GoogleSourcedRestaurant.managePhotos(
      photos
    ).placePhotoUrl;
    this.ratingStars = Restaurant.createRatingArray(this.averageRating);
  }

  /**
   * Selects only required information
   * (name, rating and reviewer's comment)
   * from all review information provided
   * @static
   * @param {object[]} reviews
   * @returns {ReviewInfo[]} - A array with review information
   * as intances of class ReviewInfo
   * @memberof GoogleSourcedRestaurant
   */
  static selectReviewInfo(reviews) {
    const selectedReviewInfo = [];
    if (reviews !== undefined && reviews.length > 0) {
      for (const review of reviews) {
        let reviewInfo = new ReviewInfo(
          review.author_name,
          review.rating,
          review.text
        );
        selectedReviewInfo.push(reviewInfo);
      }
    }
    return selectedReviewInfo;
  }

  /**
   * Selects a prefered place photo array
   * from all photos retrieved through the maps api and
   * retrieves the place photo url for the selected photo
   * @static
   * @param {object[]} photos - An array with object item(s) with place photo details
   * @returns {Object.<Array, string>}  - @property {object[]} preferredPhoto @property {string} placePhotoUrl
   * @memberof GoogleSourcedRestaurant
   */
  static managePhotos(photos) {
    let preferredPhoto = [];
    let placePhotoUrl = '';
    if (photos.length > 1) {
      for (const photo of photos) {
        if (
          preferredPhoto.length < 1 &&
          photo.height >= 600 &&
          photo.width >= 600
        ) {
          preferredPhoto.push(photo);
          placePhotoUrl = photo.getUrl();
        }
      }
      return { preferredPhoto, placePhotoUrl };
    }
    if (photos.length > 0) {
      preferredPhoto.push(photos[0]);
      placePhotoUrl = photos[0].getUrl();
      return { preferredPhoto, placePhotoUrl };
    }

    return { preferredPhoto, placePhotoUrl };
  }
}

/**
 * Restaurant Sub-Class for Restaurants added
 * by users (when the map is clicked)
 * @class UserGeneratedRestaurant
 * @extends {Restaurant}
 */
class UserGeneratedRestaurant extends Restaurant {
  constructor({ restaurantName, address, lat, lng, customImg = '' }) {
    super({
      restaurantName,
      address,
      lat,
      lng,
      customImg,
    });
    this.restaurantName = restaurantName;
    this.address = address;
    this.lat = lat;
    this.lng = lng;
    this.location = new google.maps.LatLng(lat, lng);
    this.averageRating = 0;
    this.totalRatings = 0;
    this.reviews = [];
    this.restaurantId = UserGeneratedRestaurant.generateRestaurantId();
    this.photos = [];
    this.customImg = customImg;
    this.source = 'user';
    this.placePhotoUrl = '';
    this.ratingStars = Restaurant.createRatingArray(this.averageRating);
  }

  /**
   * Creates a closure to be used as a reataurant id generator
   * @static
   * @returns {function}
   * @memberof UserGeneratedRestaurant
   */
  static generateId() {
    // Prefix 'uGId'(User Generated ID)
    // To differentiate from Google placeIds
    // When a user adds a new restaurant location
    // to the app
    const idPrefix = 'uGId';
    const validIdCharacters = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
      'q',
      'r',
      's',
      't',
      'u',
      'v',
      'w',
      'x',
      'y',
      'z',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
      '-',
      '_',
    ];
    const maxLength = 27;
    const existingIds = [];
    /**
     * @returns {string} - restaurant id
     */
    function getId() {
      let newId = idPrefix;
      while (newId.length !== maxLength) {
        const randomIndex = Math.floor(
          Math.random() * validIdCharacters.length
        );
        newId += validIdCharacters[randomIndex];
      }
      if (!existingIds.includes(newId)) {
        existingIds.push(newId);
      } else {
        getId();
      }
      return newId;
    }
    return getId;
  }

  /**
   * Generate restaurant ids for restaurants added by the user
   * @static
   * @memberof UserGeneratedRestaurant
   */
  static generateRestaurantId = UserGeneratedRestaurant.generateId();
}

/**
 * For restaurants from search results
 * @class SearchResult
 */
class SearchResult {
  constructor({
    restaurantName,
    address,
    location,
    averageRating,
    totalRatings,
    photos,
    restaurantId,
  }) {
    this.restaurantName = restaurantName;
    this.address = address;
    this.location = location;
    this.averageRating = averageRating;
    this.totalRatings = totalRatings;
    this.placePhotoUrl = SearchResult.getPhotoUrl(photos);
    this.restaurantId = restaurantId;
  }

  /**
   * Retrieve google place photos URL of search results
   * To be used as part of Info-Window content
   * @static
   * @param {object[]} photos - An array with an object item with place photo details
   * @returns {string} - url or empty string
   * @memberof SearchResult
   */
  static getPhotoUrl(photos) {
    if (photos && photos.length > 0) {
      return photos[0].getUrl();
    }
    return '';
  }
}

export {
  Restaurant,
  LocalDbRestaurant,
  GoogleSourcedRestaurant,
  UserGeneratedRestaurant,
  SearchResult,
  ReviewInfo,
};
