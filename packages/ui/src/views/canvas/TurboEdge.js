import React, { memo } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { Handle, NodeProps, Position } from 'reactflow';

const TurboNode = ({ data }) => {
  return (
    <>
      <div className="cloud gradient">
        <div></div>
      </div>
      <div className="wrapper gradient">
        <div className="inner">
          <div className="body">
            {data.icon && <div className="icon">{data.icon}</div>}
            <div>
              <div className="title">{data.title}</div>
              {data.subline && <div className="subline">{data.subline}</div>}
            </div>
          </div>
          <Handle type="target" position={Position.Left} />
          <Handle type="source" position={Position.Right} />
        </div>
      </div>
    </>
  );
};

TurboNode.propTypes = {
  data: PropTypes.shape({
    icon: PropTypes.node,
    title: PropTypes.string.isRequired,
    subline: PropTypes.string,
  }),
};

export default memo(TurboNode);
