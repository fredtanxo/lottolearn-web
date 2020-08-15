const initialState = {
  loading: false,
  query: {},
  tableData: [],
  modifyingMode: '',
  modifyingTitle: '',
  modifying: false,
  modifyingData: {},
  roleOptions: []
};

const user = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_LOADING_USER':
      return {
        ...state,
        loading: action.loading
      };
    case 'UPDATE_TABLE_DATA_USER':
      return {
        ...state,
        query: action.query,
        tableData: action.data
      };
    case 'SET_MODIFYING_USER':
      return {
        ...state,
        modifyingMode: action.mode,
        modifyingTitle: action.title,
        modifying: action.modifying,
        modifyingData: action.data,
        roleOptions: action.roleOptions
      };
    default:
      return state;
  }
};

export default user;
