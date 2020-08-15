const initialState = {
  loading: false,
  tableData: [],
  modifyMode: '',
  modifyingTitle: '',
  modifying: false,
  modifyingData: {},
  menuTree: []
};

const role = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_LOADING_ROLE':
      return {
        ...state,
        loading: action.loading
      };
    case 'UPDATE_TABLE_DATA_ROLE':
      return {
        ...state,
        tableData: action.data
      };
    case 'SET_MODIFYING_ROLE':
      return {
        ...state,
        modifyingMode: action.mode,
        modifyingTitle: action.title,
        modifying: action.modifying,
        modifyingData: action.data,
        menuTree: action.tree
      }
    default:
      return state;
  }
};

export default role;
