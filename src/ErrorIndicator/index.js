/**
*
* ErrorIndicator
*
*/

import React from 'react';
import PropTypes from 'prop-types';

function ErrorIndicator({ errors }) {
  return (
    <div className="alert alert-danger" >
      <ul>
        {errors.map((e, i) => <li key={`error-item${i}`}>{e}</li>)}
      </ul>
    </div>
  );
}

ErrorIndicator.propTypes = {
  errors: PropTypes.array,
};

export default ErrorIndicator;
