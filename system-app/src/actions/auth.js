export const updateAuthUser = user => ({
  type: 'UPDATE_AUTH',
  auth: user
});

export const updateAuth = () => {
  return (dispatch, getState, api) => {
    api.auth.currentUser()
      .then(response => {
        const data = response.data;
        dispatch(updateAuthUser(data.payload));
      });
  };
};
