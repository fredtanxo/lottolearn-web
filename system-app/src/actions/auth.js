export const updateCurrentUser = user => ({
  type: 'UPDATE_CURRENT_USER',
  user
});

export const updateCurrentUserRoles = roles => ({
  type: 'UPDATE_CURRENT_USER_ROLES',
  roles
})

export const updateCurrentUserAuth = () => {
  return (dispatch, getState, api) => {
    api.auth.currentUser()
      .then(response => {
        const data = response.data;
        dispatch(updateCurrentUser(data.payload));
      });
  };
};
