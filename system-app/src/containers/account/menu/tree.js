import { connect } from 'react-redux';

import { findAllMenus } from '../../../actions/account/menu';

import MenuTree from '../../../components/account/menu/tree';

const mapStateToProps = state => ({
  loading: state.menu.loading,
  tree: state.menu.menuTree
});

const mapDispatchToProps = dispatch => ({
  findAllMenus: () => dispatch(findAllMenus())
});

export default connect(mapStateToProps, mapDispatchToProps)(MenuTree);
