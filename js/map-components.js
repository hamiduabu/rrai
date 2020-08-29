import UI from './app-view.js';
import DataService from './data-service.js';

const MAP = window.google.maps;
const mapContainer = document.querySelector('#google-map');

/**
 * Google Maps API related services
 * @typedef {object} MAP_SERVICE
 */

const MAP_SERVICE = {
  map: new google.maps.Map(mapContainer, {
    zoom: 15,
  }),

  mapBounds: function () {
    return this.map.getBounds();
  },

  // Store restaurant markers
  restaurantMarkers: [],

  // Store restaurant markers from search results
  searchResultMarkers: [],

  searchService() {
    const service = new MAP.places.PlacesService(this.map);
    return service;
  },

  streetViewImgService() {
    const service = new MAP.StreetViewService();
    return service;
  },

  setInfoWindowContent(restaurant) {
    let rating = UI.formatRestaurantRating(restaurant);
    if (rating !== 'No Reviews') {
      rating += ` From ${restaurant.totalRatings} Review(s)`;
    }

    let photoUrl = '../assets/img/default/default_geocode-1x.png';
    if (restaurant.placePhotoUrl && restaurant.placePhotoUrl !== '') {
      photoUrl = restaurant.placePhotoUrl;
    } else if (restaurant.customImg && restaurant.customImg !== '') {
      photoUrl = restaurant.customImg;
    }

    return `<section class="map-infowindow-content">
    <figure>
  <img src=${photoUrl}>
  <figcaption>
  <p>${restaurant.restaurantName}</p>
    <p>${restaurant.address}</p>
    <p>${rating}</p>
  </figcaption>
</figure>

</section>`;
  },

  // Create marker
  createMarker(
    location = {},
    title = '',
    icon = '../assets/map-icons/icons8-restaurant-location-edited-purple-30.png'
  ) {
    const marker = new MAP.Marker({
      position: location,
      title: title,
      icon: icon,
      clickable: true,
    });

    return marker;
  },

  // Set Up Restaurant Markers
  setRestaurantMarkers(
    restaurantData,
    markerData = 'restaurantMarkers',
    markerIcon
  ) {
    for (const marker of this[markerData]) {
      marker.setMap(null);
    }
    this[markerData] = [];
    for (const restaurant of restaurantData) {
      const marker = this.createMarker(
        restaurant.location,
        `${restaurant.restaurantName} \n${restaurant.address}`,
        markerIcon
      );
      this[markerData].push(marker);
      marker.setMap(this.map);
      this.addInfoWindow(
        marker,
        this.map,
        this.setInfoWindowContent(restaurant)
      );
    }
  },

  // Create InfoWindow and set content when marker is clicked
  addInfoWindow(marker, map, infoContent = marker.title) {
    const infoWindow = new MAP.InfoWindow();
    MAP.event.addListener(marker, 'click', function (event) {
      infoWindow.setContent(infoContent);
      infoWindow.open(map, marker);
    });
  },

  // Map click event: add new restaurant
  displayAddRestaurantDialog(callback) {
    MAP.event.addListener(MAP_SERVICE.map, 'click', function (event) {
      callback(event);
    });
  },

  // Search for Restaurants
  startSearch() {
    const query = UI.searchQuery.value;
    if (!query) {
      return UI.toggleNotificationAlert(UI.searchQueryErrorMsg);
    }

    DataService.makeSearchRequest(query);
  },
};

export default MAP_SERVICE;
