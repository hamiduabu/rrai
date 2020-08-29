import UI from './app-view.js';
import DataService from './data-service.js';
import DATA_REPOSITORY from './data-repository.js';
import MAP_SERVICE from './map-components.js';

/**
 * Store parameters to be used for geolocation
 * @typedef {object} LOCATION_PARAMETERS
 * @property {function} locationSuccess - Executes if user location is successful
 * @property {function} locationError - Executes if user location is not successful
 * @property {function} locationOptions - Returns other location options
 */
const LOCATION_PARAMETERS = {
  locationSuccess(position) {
    const userPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    MAP_SERVICE.map.setCenter(userPosition);
    let positionMarker = MAP_SERVICE.createMarker(
      userPosition,
      'You are Here',
      '../assets/map-icons/icons8-user-location-40-green.png'
    );
    positionMarker.setMap(MAP_SERVICE.map);
    MAP_SERVICE.addInfoWindow(
      positionMarker,
      MAP_SERVICE.map,
      `<b>You are Here<b>`
    );

    DataService.getRestaurants(userPosition);
    DATA_REPOSITORY.userLocation = userPosition;
    UI.displaySearchForm();
  },

  locationError(error) {
    console.warn(`ERROR(${error.code}): ${error.message}`);
    UI.renderLocationError(error);
  },

  locationOptions() {
    return {
      enableHighAccuracy: true,
      timeout: 15000,
    };
  },
};

export default LOCATION_PARAMETERS;
