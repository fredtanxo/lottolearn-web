import { connect } from 'react-redux';

import PrivateRoute from '../../router/private';

const mapStateToProps = state => ({
  permit: state.auth.roles && state.auth.roles.some(r => r.code === 'SUPERUSER' || r.code === 'ADMIN')
});

export default connect(mapStateToProps, null)(PrivateRoute);
