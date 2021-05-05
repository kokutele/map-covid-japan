import React from 'react';
import * as d3 from 'd3';

export default function useD3(renderChartFn, dependencies) {
    const ref = React.useRef();

    React.useEffect(() => {
      renderChartFn( d3.select(ref.current) );
      return () => {};
      // we will not specify `renderChartFn` in dependency list
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies]);
    return ref;
}