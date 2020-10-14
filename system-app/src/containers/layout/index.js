import { connect } from 'react-redux';

import AppLayout from '../../components/layout';

import { updateCurrentUserAuth } from '../../actions/auth';

const mapStateToProps = state => ({
  user: state.auth.user || {}
});

const mapDispatchToProps = dispatch => ({
  updateCurrentUser: () => dispatch(updateCurrentUserAuth())
});

export default connect(mapStateToProps, mapDispatchToProps)(AppLayout);
