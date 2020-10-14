const initialState = {};

const auth = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_CURRENT_USER':
      return {
        ...state,
        user: action.user
      };
    case 'UPDATE_CURRENT_USER_ROLES':
      return {
        ...state,
        roles: action.roles
      }
    default:
      return state;
  }
}

export default auth;
