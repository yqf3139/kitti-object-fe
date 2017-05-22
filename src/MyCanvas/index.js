import React from 'react';
import PropTypes from 'prop-types';
import Dimensions from 'react-dimensions'
import { Layer, Stage, Image, Rect, Text } from 'react-konva';

class MyCanvas extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { image, objects } = this.props;
    let { width, height, oriwidth, oriheight } = image;
    const ratio1 = this.props.containerWidth / width;
    const ratio2 = this.props.containerWidth / oriwidth;
    image.width = this.props.containerWidth;
    image.height = height * ratio1;
    return (
    <Stage width={image.width} height={image.height}>
      <Layer>
        <Image image={image} />
        {
          objects.map((item, idx) => {
            const x = item.b1 * ratio2;
            const y = item.b2 * ratio2;
            const w = (item.b3 - item.b1) * ratio2;
            const h = (item.b4 - item.b2) * ratio2;
            return <Rect
              key={`rect-${idx}`}
              x={x} y={y} width={w} height={h}
              fill='rgba(63, 191, 191, 0.3)'
            />
          })
        }
        {
          objects.map((item, idx) => {
            const x = item.b1 * ratio2;
            const y = item.b2 * ratio2;
            const w = (item.b3 - item.b1) * ratio2;
            const h = (item.b4 - item.b2) * ratio2;
            return <Text
              key={`text-${idx}`}
              x={x} y={y}
              fontSize={16}
              fill='white'
              shadowBlur={8}
              text={`${item.type}:${item.pred.toFixed(2)}`}
            />
          })
        }
      </Layer>
    </Stage>
    );
  }
}

MyCanvas.propTypes = {
    image: PropTypes.object,
    objects: PropTypes.array,
};

export default Dimensions()(MyCanvas);
