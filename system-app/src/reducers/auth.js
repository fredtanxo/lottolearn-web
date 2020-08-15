const initialState = {};

const auth = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_AUTH':
      return {
        ...state,
        ...action.auth
      };
    default:
      return state;
  }
}

export default auth;
