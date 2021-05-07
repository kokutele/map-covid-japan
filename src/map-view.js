import React, {useRef, useEffect, useState} from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client'

import {
  Row,
  Col,
  Select,
  Table
} from 'antd'

const { Option } = Select

const file = '/data/japan_topo.json'
const apiBed = '/data/beds.json'
// from https://github.com/dataofjapan/land

export default function BarChart( props ) {
  const scale = 1500;

  const _svg = useRef()

  const [ _prefData, setPrefData ] = useState( null )
  const [ _bedData, setBedData ] = useState( [] )
  const [ _dateUpdated /*, setDateUpdated */ ] = useState('2021-04-28')
  const [ _tableData, setTableData ] = useState( [] )
  const [ _columns, setColumns ] = useState( [] )
  const [ _target , setTarget ] = useState( 'heavyBedUsedRatio' )

  useEffect( () => {
    ( async () => {
      const topo = await fetch( file ).then( res => res.json() )
      console.log( topo )
      const prefData = topojson.feature( topo, 'japan' )

      setPrefData( prefData )
    })()
  }, [])

  useEffect(() => {
    ( async () => {
      const bedData = await fetch( apiBed ).then( res => res.json() )
      console.log( bedData )
        // .map( item => {
        //   const id = parseInt(item['都道府県番号'])
        //   return { ...item, id }
        // })

      setBedData( bedData.map( item => {
        const id = parseInt(item['都道府県番号'])
        const bedUsedRatio = parseInt(item['入院患者病床使用率'].slice(0, -1)) / 100
        const heavyBedUsedRatio = parseInt(item['重症患者病床使用率'].slice(0, -1)) / 100
        const roomUsedRatio = parseInt(item['宿泊療養施設居室使用率'].slice(0, -1)) / 100
        return { ...item, id, bedUsedRatio, heavyBedUsedRatio, roomUsedRatio }
      }) )
    })()
  }, [])

  useEffect( () => {
    if( !_prefData || _bedData.length === 0 ) return 

    console.log( _target )

    const svg = d3.select(_svg.current)
    const width = _svg.current.scrollWidth
      , height = _svg.current.scrollHeight 
    const aProjection = d3.geoMercator()
      .center([ 136.0, 35.6 ])
      .translate([width/2, height/2])
      .scale(scale);
    const geoPath = d3.geoPath().projection(aProjection);

    const features = _prefData.features // .filter( item => item.properties.id < 48 )

    svg.selectAll("path").remove()

    const map = svg.selectAll("path")
      .data(features)
      .enter()
      .append("path")
      .attr("d", geoPath)
      .style("stroke", "#404040")
      .style("stroke-width", 0.5)
      .style("fill", d => {
        const id = d.properties.id
        console.log( id )
        const [ bedData ] = _bedData.filter( item => item.id === id )
        console.log( bedData )
        const num = Math.ceil(255 * ( 1 - bedData[_target] ) )
        // const num = Math.ceil(255 * ( 1 - bedData.bedUsedRatio ) )
        // const num = Math.ceil(255 * ( 1 - bedData.roomUsedRatio ) )
        return `rgb(255, ${num}, ${num})`
      });

    const zoom = d3.zoom().on('zoom', event => {
      aProjection.scale(scale * event.transform.k);
      map.attr('d', geoPath);
    });
    svg.call(zoom);

    //ドラッグイベント設定
    const drag = d3.drag().on('drag', event => {
      const tl = aProjection.translate();
      aProjection.translate([tl[0] + event.dx, tl[1] + event.dy]);
      map.attr('d', geoPath);
    });
    map.call(drag);

    const tableData = _bedData.map( ( item, idx ) => ({
      ...item,
      key: idx,
      heavyBedUsedRatio: `${(item.heavyBedUsedRatio * 100).toFixed(0)}%`,
      bedUsedRatio: `${(item.bedUsedRatio * 100).toFixed(0)}%`,
      roomUsedRatio: `${(item.roomUsedRatio * 100).toFixed(0)}%`,
    }))

    const columns = [
      { 
        title: '都道府県名',
        dataIndex: '都道府県名',
        key: '都道府県名'
      },
      {
        title: '値',
        dataIndex: _target,
        key: _target
      }
    ]

    setTableData( tableData )
    setColumns( columns )

    // console.log( _bedData )
    //             <Option value="heavyBedUsedRatio">重傷者病床使用率</Option>
    //             <Option value="bedUsedRatio">入院患者病床使用率</Option>
    //             <Option value="roomUsedRatio">宿泊療養施設居室使用率</Option>
    //           </Select>
    //           <ul>
    //           { _bedData.map( item => {
    //             const ratio = `${(item[ _target ] * 100).toFixed(0)}%`

    //               <li>{item['都道府県名']}: {ratio}</li>
 
  }, [_prefData, _bedData, _target])

  return (
    <div className="MapView" style={{height: "100%"}}>
      <Row style={{height: "100%"}}>
        <Col span={18}>
          <svg
            ref={elem => _svg.current = elem }
            style={{
              height: "100%",
              width: "100%",
              marginRight: "0px",
              marginLeft: "0px",
            }}
          >
          </svg>
        </Col>
        <Col span={6}>
            <div style={{
              padding: "0 3px",
              height: '100%',
              overflowY: 'auto',
              background: '#66b3ff'
            }}>
              <div style={{ textAlign: "right"}}>
                更新日: <span style={{fontWeight: "bold"}}>{_dateUpdated}</span>
              </div>
              <Select defaultValue="heavyBedUsedRatio" style={{width: "100%"}} onChange={setTarget}>
                <Option value="heavyBedUsedRatio">重傷者病床使用率</Option>
                <Option value="bedUsedRatio">入院患者病床使用率</Option>
                <Option value="roomUsedRatio">宿泊療養施設居室使用率</Option>
              </Select>
              <Table size="small" dataSource={_tableData} columns={_columns} />
            </div>
        </Col>
      </Row>
    </div>
  );
}
