/**
 * Store API related Information
 * @typedef {object} API
 */
const API = {
  googleMaps: {
    apiHost: 'https://maps.googleapis.com/maps/api/js',
    // Replace API_KEY with valid Google Maps API key
    apiKey: 'API_KEY',
    libraries: 'geometry,places',

    // Gets the url to restaurant street view image
    // takes a string argument - pano(Google street view panorama id)
    // returns A url (string) to street view image
    getGoogleStreetViewImage(pano) {
      return `https://maps.googleapis.com/maps/api/streetview?size=600x600&pano=${pano}&heading=151.78&pitch=-0.76&key=${API.googleMaps.apiKey}`;
    },
  },
};

export default API;
