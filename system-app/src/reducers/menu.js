const initialState = {
  loading: true,
  menuTree: []
};

const menu = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_LOADING_MENU':
      return {
        ...state,
        loading: action.loading
      };
    case 'UPDATE_MENU_TREE':
      return {
        ...state,
        menuTree: action.tree
      };
    default:
      return state;
  }
};

export default menu;
