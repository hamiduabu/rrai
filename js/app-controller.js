import DataService from './data-service.js';
import MAP_SERVICE from './map-components.js';
import LOCATION_PARAMETERS from './location-parameters.js';
import UI from './app-view.js';
import DATA_REPOSITORY from './data-repository.js';

/**
 * Takes a model(DATA_REPOSITORY) and view(UI)
 * and acts as the controller between them
 * @class Controller
 */
class Controller {
  /**
   *Creates an instance of Controller.
   * @param {!object} ui - An instance of AppView
   * @param {!object} dataRepository - An Instance of DataRepository
   */
  constructor(ui, dataRepository) {
    this.ui = ui;
    this.dataRepository = dataRepository;
    this.ui.displayRestaurantReviews(
      this.handleDisplayReviews,
      this.handleDisplayImage
    );
    this.ui.applyReviewRatingEffect(this.handleReviewRatingEffect());
    this.ui.executeFilterOptions(this.handleFilter);
    this.ui.manageReviewsModal(this.handleReviewModalActions);
    this.ui.manageAddRestaurantDialog(this.handleAddNewRestaurantFormActions);
    this.ui.manageSearchActions(
      this.handleSearchActionsService(),
      this.handleSearchActionsRepository()
    );
    MAP_SERVICE.displayAddRestaurantDialog(
      this.handleLaunchAddNewRestaurantForm
    );
  }

  /**
   * Handles Retrieval of restaurant data that matches id
   * @param {String} id - Restaurant's restaurantId
   * @returns A callback that on execution returns a restaurant object
   * @memberof Controller
   */
  handleDisplayReviews = (id) => {
    return this.dataRepository.getRestaurantDataFromId(id);
  };

  /**
   * Handles Retrieval of available restaurant image
   * @param {object} - A restaurant object
   * @returns A callback that retrieves a restaurant image
   * @memberof Controller
   */
  handleDisplayImage = (restaurant) => {
    return DataService.getAvailableImage(restaurant);
  };

  /**
   * Handles visual effects
   * on mouseover and on mouseout
   * over the review rating stars
   * @memberof Controller
   */
  handleReviewRatingEffect = () => {
    return this.ui.reviewRatingStars;
  };

  /**
   * Handles filtering restaurants based on rating
   * @param {object} options - Filter from and to rating values
   * @memberof Controller
   */
  handleFilter = (options) => {
    const filtered = this.dataRepository.filterRestaurant(options);
    this.ui.renderRestaurants(filtered);
    MAP_SERVICE.setRestaurantMarkers(filtered);
  };

  /**
   * Handles actions on displayed review modal
   * Mainly, add/submit new reviews and close the modal
   * @param {string} id - restaurant id
   * @param {object} data - new review data
   * @memberof Controller
   */
  handleReviewModalActions = (id, data) => {
    const restaurant = this.dataRepository.addRestaurantReview(id, data);
    this.ui.updateModalReviewDetails(restaurant);
    this.handleFilter(this.ui.filterValues());
  };

  /**
   * Handles submission of new restaurant data
   * or cancel/close submission
   * @param {object} restaurant - new restaurant data
   * @memberof Controller
   */
  handleAddNewRestaurantFormActions = (restaurant) => {
    this.dataRepository.addRestaurant(restaurant);
    this.handleFilter(this.ui.filterValues());
  };

  /**
   * Returns the service used to perform a search
   * on the map
   * @memberof Controller
   */
  handleSearchActionsService = () => {
    return MAP_SERVICE;
  };

  /**
   * Returns the repository where
   * the users location is saved
   * @memberof Controller
   */
  handleSearchActionsRepository = () => {
    return this.dataRepository;
  };

  /**
   * Handles the display of form required
   * to enter restaurant details
   * when adding a new restaurant
   * @param {object} event - event object
   * @memberof Controller
   */
  handleLaunchAddNewRestaurantForm = (event) => {
    this.ui.displayAddNewRestaurantForm(event);
  };

  /**
   * Handles Geolocation options
   * initilises app on success
   * handles error on failure
   * @memberof Controller
   */
  initApp = () => {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        LOCATION_PARAMETERS.locationSuccess,
        LOCATION_PARAMETERS.locationError,
        LOCATION_PARAMETERS.locationOptions
      );
    } else {
      LOCATION_PARAMETERS.locationError(error);
    }
  };
}

const APP_CONTROLLER = new Controller(UI, DATA_REPOSITORY);
export default APP_CONTROLLER;
