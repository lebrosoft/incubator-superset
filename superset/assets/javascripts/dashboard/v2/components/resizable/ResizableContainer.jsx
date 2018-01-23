import React from 'react';
import PropTypes from 'prop-types';
import Resizable from 're-resizable';
import cx from 'classnames';

import ResizableHandle from './ResizableHandle';
import resizableConfig from '../../util/resizableConfig';
import { GRID_BASE_UNIT } from '../../util/constants';
import './resizable.css';

const propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node,
  adjustableWidth: PropTypes.bool,
  adjustableHeight: PropTypes.bool,
  gutterWidth: PropTypes.number,
  widthStep: PropTypes.number,
  heightStep: PropTypes.number,
  widthMultiple: PropTypes.number,
  heightMultiple: PropTypes.number,
  minWidthMultiple: PropTypes.number,
  maxWidthMultiple: PropTypes.number,
  minHeightMultiple: PropTypes.number,
  maxHeightMultiple: PropTypes.number,
  onResizeStop: PropTypes.func,
  onResize: PropTypes.func,
  onResizeStart: PropTypes.func,
};

const defaultProps = {
  children: null,
  adjustableWidth: true,
  adjustableHeight: true,
  gutterWidth: 0,
  widthStep: GRID_BASE_UNIT,
  heightStep: GRID_BASE_UNIT,
  widthMultiple: 1,
  heightMultiple: 1,
  minWidthMultiple: 1,
  maxWidthMultiple: Infinity,
  minHeightMultiple: 1,
  maxHeightMultiple: Infinity,
  onResizeStop: null,
  onResize: null,
  onResizeStart: null,
};

// because columns are not actually multiples of a single variable (width = n*cols + (n-1)*gutters)
// we snap to the base unit and then snap to columns on resize stop
const snapToGrid = [GRID_BASE_UNIT, GRID_BASE_UNIT];

class ResizableContainer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isResizing: false,
    };

    this.handleResizeStart = this.handleResizeStart.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleResizeStop = this.handleResizeStop.bind(this);
  }

  handleResizeStart(event, direction, ref) {
    const { id, onResizeStart } = this.props;

    if (onResizeStart) {
      onResizeStart({ id, direction, ref });
    }

    this.setState(() => ({ isResizing: true }));
  }

  handleResize(event, direction, ref) {
    const { onResize, id } = this.props;
    if (onResize) {
      onResize({ id, direction, ref });
    }
  }

  handleResizeStop(event, direction, ref, delta) {
    const {
      id,
      onResizeStop,
      widthStep,
      heightStep,
      widthMultiple,
      heightMultiple,
      adjustableHeight,
      adjustableWidth,
    } = this.props;

    if (onResizeStop) {
      const nextWidthMultiple = Math.round(widthMultiple + (delta.width / widthStep));
      const nextHeightMultiple = Math.round(heightMultiple + (delta.height / heightStep));

      onResizeStop({
        id,
        widthMultiple: adjustableWidth ? nextWidthMultiple : null,
        heightMultiple: adjustableHeight ? nextHeightMultiple : null,
      });

      this.setState(() => ({ isResizing: false }));
    }
  }

  render() {
    const {
      children,
      adjustableWidth,
      adjustableHeight,
      widthStep,
      heightStep,
      widthMultiple,
      heightMultiple,
      minWidthMultiple,
      maxWidthMultiple,
      minHeightMultiple,
      maxHeightMultiple,
      gutterWidth,
    } = this.props;

    const size = {
      width: adjustableWidth ? (widthStep * widthMultiple) - gutterWidth : 'auto',
      height: (adjustableHeight || heightMultiple) ? heightStep * heightMultiple : 'auto',
    };

    let enableConfig = resizableConfig.widthAndHeight;
    if (!adjustableHeight) enableConfig = resizableConfig.widthOnly;
    else if (!adjustableWidth) enableConfig = resizableConfig.heightOnly;

    const { isResizing } = this.state;

    return (
      <Resizable
        enable={enableConfig}
        grid={snapToGrid}
        minWidth={adjustableWidth ? minWidthMultiple * widthStep - gutterWidth : size.width}
        minHeight={adjustableHeight ? minHeightMultiple * heightStep : size.height}
        maxWidth={adjustableWidth ? maxWidthMultiple * widthStep - gutterWidth : size.width}
        maxHeight={adjustableHeight ? maxHeightMultiple * heightStep : size.height}
        size={size}
        onResizeStart={this.handleResizeStart}
        onResize={this.handleResize}
        onResizeStop={this.handleResizeStop}
        handleComponent={ResizableHandle}
        className={cx(
          'grid-resizable-container',
          isResizing && 'grid-resizable-container--resizing',
        )}
      >
        {children}
      </Resizable>
    );
  }
}

ResizableContainer.propTypes = propTypes;
ResizableContainer.defaultProps = defaultProps;

export default ResizableContainer;
