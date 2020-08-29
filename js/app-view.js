class AppView {
  constructor() {
    this.restaurantsListContainer = document.querySelector('#restaurants');
    this.restaurantsList = document.querySelector('#restaurants-list');
    this.filterOptions = document.querySelector('#filter');
    this.filterBtn = document.querySelector('#filter-btn');
    this.filterFrom = document.querySelector('#filter-rating-from');
    this.filterTo = document.querySelector('#filter-rating-to');
    this.mapContainer = document.querySelector('#google-map');
    this.searchContainer = document.querySelector('#search-container');
    this.searchForm = document.querySelector('#search-form');
    this.searchQuery = document.querySelector('#query');
    this.searchBtn = document.querySelector('#search-btn');
    this.clearSearchBtn = document.querySelector('#clear-search-btn');
    this.addRestaurantDialog = document.querySelector('#new-restaurant-form');
    this.addRestaurantForm = document.querySelector(
      '#new-restaurant-form form'
    );
    this.addRestaurantBtn = document.querySelector('#new-restaurant-btn');
    this.cancelAddRestaurant = document.querySelector(
      '#cancel-add-restaurant-btn'
    );
    this.restaurantName = document.querySelector('#new-restaurant-name');
    this.restaurantAddress = document.querySelector('#new-restaurant-address');
    this.newRestaurantLat = document.querySelector('#latitude');
    this.newRestaurantLng = document.querySelector('#longitude');
    this.newRestaurantImg = document.querySelector('#new-restaurant-img-url');
    this.reviewModal = document.querySelector('#review-modal');
    this.closeModalBtn = document.querySelector('button#close-modal-btn');
    this.modalRestaurantName = document.querySelector('#restaurant-name');
    this.modalRatingStars = document.querySelector('#modal-restaurant-stars');
    this.modalRestaurantRating = document.querySelector('#restaurant-rating');
    this.restaurantImage = document.querySelector('#restaurant-image');
    this.imgErrorMsg = document.querySelector('#img-error-msg');
    this.reviewsList = document.querySelector('#reviews-list');
    this.reviewForm = document.querySelector('#add-review-form');
    this.addNewReviewForm = document.querySelector('section.new-review');
    this.reviewListContainer = document.querySelector(
      '#restaurant-reviews-container'
    );
    this.addReviewBtn = document.querySelector('button#add-review');
    this.reviewRatingStars = [...document.querySelectorAll('.rating-star-img')];
    this.submitReviewBtn = document.querySelector('#submit-review');
    this.reviewerName = document.querySelector('#reviewer-name');
    this.reviewerRatingOptions = [
      ...document.querySelectorAll('#rating-stars input[name="rating"]'),
    ];
    this.reviewerComment = document.querySelector('#reviewer-comment');
    this.notificationAlert = document.querySelector('#alert-msg');
    this.ratingErrorMsg = 'A rating value is required';
    this.filterErrorMsg =
      'Filter From Value should not be greater than Filter To Value';
    this.searchInProcessMsg = 'Searching .........';
    this.searchQueryErrorMsg = 'Please Enter Keyword to Search';
    this.zeroResultsearchMsg = 'No Results Found';
    this.addRestaurantFormErrorMsg =
      'Restaurant Name and Address must be filled';
  }

  /**
   * Renders list of restaurants on the client
   * @param {object[]} list - list ofrestaurants
   * @memberof AppView
   */

  renderRestaurants = (list) => {
    this._clearDomNodeList(this.restaurantsList);
    if (list.length === 0) {
      return (this.restaurantsList.textContent = 'No Results to Display');
    }

    const listFragment = this._createDomProp('DocumentFragment');
    for (const listItem of list) {
      const restaurantLi = this._createDomProp('Element', 'li');
      restaurantLi.dataset.restaurantId = `${listItem.restaurantId}`;
      restaurantLi.innerHTML = this._createListItemDetails(listItem);
      listFragment.appendChild(restaurantLi);
    }

    this.restaurantsList.textContent = '';
    this.restaurantsList.appendChild(listFragment);
  };

  /**
   * Add event listener to the filter button
   * @param {function} callback - acts on retrieved filter values
   * @memberof AppView
   */

  executeFilterOptions = (callback) => {
    this.filterBtn.addEventListener('click', () => {
      let { fromValue, toValue } = this.filterValues();
      return fromValue > toValue
        ? this.toggleNotificationAlert(this.filterErrorMsg)
        : callback({
            fromValue,
            toValue,
          });
    });
  };

  /**
   * Retrieves filter from and to values
   * @returns {object} - filter from and to values
   * @memberof AppView
   */

  filterValues = () => {
    let fromValue =
      this.filterFrom.value === '' ? 0 : Number(this.filterFrom.value);
    let toValue = this.filterTo.value === '' ? 5 : Number(this.filterTo.value);
    return { fromValue, toValue };
  };

  /**
   * Display location error message on the client
   * @param {object} error - error object
   * @memberof AppView
   */

  renderLocationError = (error) => {
    return (this.mapContainer.textContent = `${error.message}`);
  };

  /**
   * Display the add new restaurant form when map is clicked
   * @param {object} event - google event object
   * @memberof AppView
   */

  displayAddNewRestaurantForm = (event) => {
    event.stop();
    this.newRestaurantLat.value = event.latLng.lat();
    this.newRestaurantLng.value = event.latLng.lng();
    this.addRestaurantDialog.classList.remove('hidden');
  };

  /**
   * Adds an event listener to the add restaurant form for various actions
   * (submit new restaurant data entered by user, cancel action/close form)
   * @param {function} callback - acts on the submitted restaurant data
   * @memberof AppView
   */

  manageAddRestaurantDialog = (callback) => {
    this.addRestaurantDialog.addEventListener('click', (event) => {
      if (event.target === this.addRestaurantBtn) {
        event.preventDefault();
        if (
          this.restaurantName.value === '' ||
          this.restaurantAddress.value === ''
        ) {
          return this.toggleNotificationAlert(this.addRestaurantFormErrorMsg);
        }
        const newRestaurantInfo = {
          restaurantName: this.restaurantName.value,
          address: this.restaurantAddress.value,
          lat: Number(this.newRestaurantLat.value),
          lng: Number(this.newRestaurantLng.value),
          customImg: this.newRestaurantImg.value,
        };
        this.addRestaurantForm.reset();
        this.addRestaurantDialog.classList.add('hidden');

        callback(newRestaurantInfo);
      }
      if (event.target === this.cancelAddRestaurant) {
        event.preventDefault();
        this.addRestaurantDialog.classList.add('hidden');
        this.addRestaurantForm.reset();
      }
    });
  };

  /**
   * Displays search form when map is loaded
   * @memberof AppView
   */

  displaySearchForm = () => {
    this.searchContainer.classList.remove('invisible');
  };

  /**
   * Adds a listener to the search form on the client for various actions
   * (start search, clear search results, return to user location)
   * @param {Object} service - search service
   * @param {object[]} dataRepository - repository where user location is saved
   * @memberof AppView
   */

  manageSearchActions = (service, dataRepository) => {
    this.searchContainer.addEventListener('click', (event) => {
      if (event.target.id === 'search-btn') {
        event.preventDefault();
        this.toggleNotificationAlert(this.searchInProcessMsg);
        service['startSearch']();
      }
      if (event.target.id === 'clear-search-btn') {
        event.preventDefault();

        service['searchResultMarkers'].forEach((marker) => {
          marker.setMap(null);
        });
        service['searchResultMarkers'] = [];
        this.searchForm.reset();
      }
      if (event.target.id === 'user-location-btn') {
        event.preventDefault();
        service['map'].setCenter(dataRepository['userLocation']);
      }
    });
  };

  /**
   * Displays restaurant reviews and image on the modal
   * @param {function} handleReviews
   * @param {function} handleImage
   * @memberof AppView
   */

  displayRestaurantReviews = (handleReviews, handleImage) => {
    this.restaurantsList.addEventListener('click', (event) => {
      if (!event.target.closest('li')) {
        return;
      }
      this._displayReviewModal(event);

      let restaurant = handleReviews(this._getRestaurantId(event));

      this._loadModalDetails(restaurant, handleImage);
    });
  };

  /**
   * Format appearance of rating on client
   * @param {selector} listItem
   * @memberof AppView
   */

  formatRestaurantRating = (listItem) => {
    return listItem.averageRating === 0
      ? 'No Reviews'
      : `${listItem.averageRating} Stars`;
  };

  /**
   * Update review modal details on the client
   * @param {object} restaurant
   * @memberof AppView
   */

  updateModalReviewDetails = (restaurant) => {
    // Rating Stars
    this._setModalHeaderRatingStars(restaurant);

    // restaurant rating
    this._setModalHeaderRatingValue(restaurant);

    // load review comments
    this._loadReviewComments(restaurant);
  };

  /**
   * Rating stars change color on mouseover and on click
   * to give a highligting effect
   * @param {selector} reviewRatingStars
   * @memberof AppView
   */

  applyReviewRatingEffect = (reviewRatingStars) => {
    this._highlightRatingStarsOnHover(reviewRatingStars);
    this._removeHighlightOnMouseout(reviewRatingStars);
    this._clickToSelectRating(reviewRatingStars);
  };

  /**
   * Adds listener for various events on the review modal
   * (close modal, display/hide add review form, submit new review)
   * @param {function} callback - executed when a new review is submitted
   * @memberof AppView
   */

  manageReviewsModal = (callback) => {
    this.reviewModal.addEventListener('click', (event) => {
      if (event.target.id === 'close-modal-btn') {
        return this._closeReviewModal();
      }
      if (event.target.id === 'add-review') {
        return this._displayAddReviewForm();
      }
      if (event.target.id === 'submit-review') {
        event.preventDefault();
        this._getNewReviewInfo(callback);
      }
    });
  };

  /**
   * Displays various notification messages
   * @param {string} message - alert/notification message
   * @memberof AppView
   */

  toggleNotificationAlert = (message) => {
    this.notificationAlert.lastElementChild.textContent = message;
    this.notificationAlert.classList.remove('hidden');
    setTimeout(() => {
      this.notificationAlert.classList.add('fade');
    }, 2000);
    setTimeout(() => {
      this.notificationAlert.classList.add('hidden');
      this.notificationAlert.lastElementChild.textContent = '';
      this.notificationAlert.classList.remove('fade');
    }, 3000);
  };

  /**
   * Get restaurant id for restaurant when restaurant is clicked
   * @param {object} event - event object
   * @memberof AppView
   */

  _getRestaurantId = (event) => {
    return !event
      ? this.reviewModal.dataset.restaurantId
      : event.target.closest('li').dataset.restaurantId;
  };

  /**
   * Get new review details from add review form
   * @param {function} callback - acts on the review info for a restaurant id
   * @memberof AppView
   */

  _getNewReviewInfo = (callback) => {
    const restaurantId = this.reviewModal.dataset.restaurantId;
    const name = this.reviewerName.value;
    const [checkedOption] = [
      ...this.reviewerRatingOptions.filter((option) => option.checked),
    ];

    if (checkedOption === undefined) {
      return this.toggleNotificationAlert(this.ratingErrorMsg);
    }

    const stars = checkedOption.value;
    const comment = this.reviewerComment.value;
    const reviewInfo = { name, stars, comment };

    this._resetAddReviewForm();
    callback(restaurantId, reviewInfo);
  };

  /**
   * Displays Modal that shows restaurant reviews and image
   * when a restaurant is clicked from the list of restaurants
   * @param {object} event - event object
   * @memberof AppView
   */

  _displayReviewModal = (event) => {
    this.reviewModal.classList.add('modal-display');
    this.reviewModal.dataset.restaurantId = this._getRestaurantId(event);
  };

  /**
   * Closes the review modal
   * @memberof AppView
   */

  _closeReviewModal = () => {
    this._resetAddReviewForm();
    this.reviewModal.dataset.restaurantId = '';
    this.reviewModal.classList.remove('modal-display');
  };

  /**
   * Displays the add review form on the review modal
   * @memberof AppView
   */

  _displayAddReviewForm = () => {
    this.reviewListContainer.classList.add('hidden');
    this.addNewReviewForm.classList.remove('hidden');
  };

  /**
   * Sets the restaurant details on the review modal
   * @param {object} restaurant
   * @param {function} callback
   * @memberof AppView
   */

  _loadModalDetails = (restaurant, callback) => {
    // Restaurant Name
    this._setModalHeaderRestaurantName(restaurant);

    // Rating Stars
    this._setModalHeaderRatingStars(restaurant);

    // restaurant rating
    this._setModalHeaderRatingValue(restaurant);

    // restaurant image
    this._setModalRestaurantImage(restaurant, callback);

    // load review comments
    this._loadReviewComments(restaurant);
  };

  /**
   * Sets the restaurant comments on the review modal body
   * @param {object} restaurant
   * @memberof AppView
   */

  _loadReviewComments = (restaurant) => {
    this._clearDomNodeList(this.reviewsList);
    if (restaurant.reviews.length === 0) {
      return (this.reviewsList.textContent = 'No Reviews to Display');
    }
    const reviewsFragment = this._createDomProp('DocumentFragment');
    for (const review of restaurant.reviews) {
      let reviewItem = this._createDomProp('Element', 'li');
      reviewItem.innerHTML = this._createReviewCommentsList(review);
      reviewsFragment.appendChild(reviewItem);
    }
    this.reviewsList.appendChild(reviewsFragment);
  };

  /**
   * Sets the restaurant image on the review modal body
   * @param {object} restaurant
   * @param {function} callback
   * @memberof AppView
   */

  _setModalRestaurantImage = (restaurant, callback) => {
    this.imgErrorMsg.textContent = '';
    this.imgErrorMsg.classList.remove('error-msg');
    this.restaurantImage.src = '';

    callback(restaurant);
  };

  /**
   * Sets the restaurant rating value on the review modal heading
   * @param {object} restaurant
   * @memberof AppView
   */

  _setModalHeaderRatingValue = (restaurant) => {
    const restaurantRating = this.formatRestaurantRating(restaurant);
    this.modalRestaurantRating.textContent = restaurantRating;
  };

  /**
   * Sets the restaurant rating stars on the review modal heading
   * @param {object} restaurant
   * @memberof AppView
   */

  _setModalHeaderRatingStars = (restaurant) => {
    this._clearDomNodeList(this.modalRatingStars);
    const ratingStarsFragment = this._createDomProp('DocumentFragment');
    for (const ratingStar of restaurant.ratingStars) {
      let ratingStarImg = this._createDomProp('Element', 'img');
      ratingStarImg.src = ratingStar;
      ratingStarImg.classList.add('rating-stars');
      ratingStarsFragment.appendChild(ratingStarImg);
    }
    this.modalRatingStars.appendChild(ratingStarsFragment);
  };

  /**
   * Sets the restaurant name on the review modal heading
   * @param {object} restaurant
   * @memberof AppView
   */

  _setModalHeaderRestaurantName = (restaurant) => {
    this.modalRestaurantName.textContent = restaurant.restaurantName;
  };

  /**
   * Adds highlighting effect on review rating stars
   * when mouse is over them
   * @param {NodeList} reviewRatingStars
   * @memberof AppView
   */

  _highlightRatingStarsOnHover = (reviewRatingStars) => {
    reviewRatingStars.forEach((star) =>
      star.addEventListener('mouseenter', (event) => {
        for (let i = 0; i < reviewRatingStars.length; i += 1) {
          if (
            reviewRatingStars.indexOf(reviewRatingStars[i]) <=
            reviewRatingStars.indexOf(event.target)
          ) {
            reviewRatingStars[i].classList.add('highlighting');
          } else {
            reviewRatingStars[i].classList.remove('highlighting');
          }
        }
      })
    );
  };

  /**
   * Remove highlighting effect on review rating stars
   * when mouse is no longer over them
   * @param {NodeList} reviewRatingStars
   * @memberof AppView
   */

  _removeHighlightOnMouseout = (reviewRatingStars) => {
    reviewRatingStars.forEach((star) =>
      star.addEventListener('mouseout', () => {
        for (let i = 0; i < reviewRatingStars.length; i += 1) {
          reviewRatingStars[i].classList.remove('highlighting');
        }
      })
    );
  };

  /**
   * Highlight selected rating stars
   * @param {NodeList} reviewRatingStars
   * @memberof AppView
   */

  _clickToSelectRating = (reviewRatingStars) => {
    reviewRatingStars.forEach((star) => {
      return star.addEventListener('click', (event) => {
        for (let i = 0; i < reviewRatingStars.length; i += 1) {
          reviewRatingStars[i].classList.remove('highlighting');
          if (
            reviewRatingStars.indexOf(reviewRatingStars[i]) <=
            reviewRatingStars.indexOf(event.target)
          ) {
            reviewRatingStars[i].classList.add('highlighted');
          } else {
            reviewRatingStars[i].classList.remove('highlighted');
          }
        }
      });
    });
  };

  /**
   * Undo rating stars highlighted after a review is submitted
   * Or when the modal is closed
   * @memberof AppView
   */

  _resetReviewStars = () => {
    this.reviewRatingStars.forEach((star) =>
      star.classList.remove('highlighted')
    );
  };

  /**
   * Resets the add review form after review is submitted
   * or the review modal is closed
   * @memberof AppView
   */

  _resetAddReviewForm = () => {
    this.reviewForm.reset();
    this._resetReviewStars();
    this.reviewListContainer.classList.remove('hidden');
    this.addNewReviewForm.classList.add('hidden');
  };

  /**
   * Clears a html nodelist by deleting all child elements
   * @param {NodeList} nodeList - dom nodelist
   * @memberof AppView
   */

  _clearDomNodeList = (nodeList) => {
    while (nodeList.hasChildNodes()) {
      nodeList.removeChild(nodeList.lastChild);
    }
  };

  /**
   * Creates and returns a html document element or fragment
   * @param {string} method - document or document fragment
   * @param {string} elementString - html element to be created
   * @memberof AppView
   */

  _createDomProp = (method, elementString = null) => {
    return document[`create${method}`](elementString);
  };

  /**
   * creates a restaurant template to be appended to the dom
   * as part of the restaurant list
   * @param {object} listItem - a restaurant object
   * @memberof AppView
   */

  _createListItemDetails = (listItem) => {
    let listItemRating = this.formatRestaurantRating(listItem);

    const template = `
        <section class="restaurant-details">
          <h3 class="restaurant-name">${listItem.restaurantName}</h3>
          <section>
            <img src="${listItem.ratingStars[0]}" class="rating-stars">
            <img src="${listItem.ratingStars[1]}" class="rating-stars">
            <img src="${listItem.ratingStars[2]}" class="rating-stars">
            <img src="${listItem.ratingStars[3]}" class="rating-stars">
            <img src="${listItem.ratingStars[4]}" class="rating-stars">
          </section>
          <p class="restaurant-rating">${listItemRating}</p>
          <p class="restaurant-address">${listItem.address}</p>
        </section>`;

    return template;
  };

  /**
   * Creates a review template to be appended to the dom
   * @param {object} review
   * @memberof AppView
   */

  _createReviewCommentsList = (review) => {
    const template = `
    <section>
      <h4>${review.name}</h4>
      <p>${review.stars} Stars</p>
      <p>${review.comment}</p>
    </section>
    `;
    return template;
  };
}

const UI = new AppView();

export default UI;
