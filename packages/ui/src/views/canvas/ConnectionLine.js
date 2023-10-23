import React from 'react';
import PropTypes from 'prop-types';

const ConnectionLine = ({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
  connectionLineType,
  connectionLineStyle,
}) => {
  return (
    <g>
      <path
        fill="none"
        stroke="#222"
        strokeWidth={1.5}
        className="animated"
        d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
      />
      <circle cx={toX} cy={toY} fill="#fff" r={3} stroke="#222" strokeWidth={1.5} />
    </g>
  );
};

ConnectionLine.displayName = 'ConnectionLine';

ConnectionLine.propTypes = {
  fromX: PropTypes.number.isRequired,
  fromY: PropTypes.number.isRequired,
  fromPosition: PropTypes.string.isRequired,
  toX: PropTypes.number.isRequired,
  toY: PropTypes.number.isRequired,
  toPosition: PropTypes.string.isRequired,
  connectionLineType: PropTypes.string.isRequired,
  connectionLineStyle: PropTypes.string.isRequired,
};

export default ConnectionLine;
