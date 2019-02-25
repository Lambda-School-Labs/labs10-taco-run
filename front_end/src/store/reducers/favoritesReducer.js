import {
  FAVORITES_SEARCH_START,
  FAVORITES_SEARCH_COMPLETE,
  FAVORITES_SEARCH_ERROR,

  FAVORITES_DELETE_START,
  FAVORITES_DELETE_COMPLETE,
  FAVORITES_DELETE_ERROR,
} from "../actions/favoritesActions";

const initialState = {
  locations: [],
  searchingFavorites: false,
  searchedFavorites: false,
  deletingFavorite: false,
  deletedFavorite: false,
  error: null
};

const favoritesReducer = (state = initialState, action) => {
  switch (action.type) {
    case FAVORITES_SEARCH_START:
      return {
        ...state,
        searchingFavorites: true,
        searchedFavorites: false
      };
    case FAVORITES_SEARCH_COMPLETE:
      return {
        ...state,
        locations: action.payload,
        searchingFavorites: false,
        searchedFavorites: true,
        error: null
      };

    case FAVORITES_SEARCH_ERROR:
      return {
        ...state,
        error: "Error searching favorites"
      };
    
    case FAVORITES_DELETE_START:
      return {
        ...state,
        deletingFavorite: true
      }
    case FAVORITES_DELETE_COMPLETE:
      return {
        ...state,
        deletingFavorite: false,
        deletedFavorite: true
      }

    case FAVORITES_DELETE_ERROR:
      return {
        ...state,
        error: "Error deleting a favorite"
      }
    
    default:
      return state;
  }
};

export default favoritesReducer;
