import React, {useRef, useEffect, useState} from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client'

import {
  message,
  Row,
  Col,
  Select,
  Table
} from 'antd'

import * as config from './config'

const { Option } = Select

const file = config.topofile
const { dates } = config

const delay = 0

export default function BarChart( props ) {
  const scale = 1500;

  const _svg = useRef()

  const [ _loading, setLoading ] = useState( false )
  const [ _prefData, setPrefData ] = useState( null )
  const [ _bedData, setBedData ] = useState( [] )
  const [ _dateUpdated, setDateUpdated ] = useState(dates[0])
  const [ _tableData, setTableData ] = useState( [] )
  const [ _columns, setColumns ] = useState( [] )
  const [ _target , setTarget ] = useState( 'ratioInpatient' )

  useEffect( () => {
    ( async () => {
      setLoading( true )

      if( !!delay ) await new Promise( r => setTimeout(r, delay * 2) )
      const topo = await fetch( file ).then( res => res.json() )
      const prefData = topojson.feature( topo, 'japan' )

      setPrefData( prefData )
    })()
  }, [])

  useEffect(() => {
    ( async () => {
      setLoading( true )

      if( !!delay ) await new Promise( r => setTimeout(r, delay) )
      const date = _dateUpdated.split("-").join("")
      const apiBed = `/data/beds_${date}.json`
      const bedData = await fetch( apiBed ).then( res => res.json() )

      setBedData( bedData )
    })()
  }, [ _dateUpdated ])

  useEffect(() => {
    if( _loading ) {
      message.loading('loading data...', 0)
    } else {
      message.destroy()
    }
  }, [_loading])

  useEffect( () => {
    if( !_prefData || _bedData.length === 0 ) return 

    setLoading( false )

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
        const [ bedData ] = _bedData.filter( item => item.prefectureId === id )
        const ratio = bedData[_target]
        const num = Math.ceil(255 * ( 1 - ratio / 100 ) )
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
      key: idx,
      name: item.name,
      ratioHeavyInpatient: `${(item.ratioHeavyInpatient)}%`,
      ratioInpatient: `${(item.ratioInpatient)}%`,
      ratioAccomInpatient: `${(item.ratioAccomInpatient)}%`,
    }))

    const columns = [
      { 
        title: '都道府県名',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '値',
        dataIndex: _target,
        key: _target
      }
    ]

    setTableData( tableData )
    setColumns( columns )
  }, [_prefData, _bedData, _target])

  return (
    <div className="MapView" style={{height: "100%"}}>
      <Row style={{height: "100%"}}>
        <Col span={18} style={{height: "100%"}}>
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
              <Select defaultValue="ratioInpatient" style={{width: "100%"}} onChange={setTarget}>
                <Option value="ratioInpatient">入院患者病床使用率</Option>
                <Option value="ratioHeavyInpatient">重傷者病床使用率</Option>
                <Option value="ratioAccomInpatient">宿泊療養施設居室使用率</Option>
              </Select>
              <Table size="small" dataSource={_tableData} columns={_columns} />
              <div style={{ 
                borderLeft: "5px solid orange",
                paddingLeft: "6px",
                textAlign: "leff", 
                marginTop: "1em" 
              }}>
                更新日:
              </div>
              <Select defaultValue={dates[0]} style={{width: "100%"}} onChange={ setDateUpdated }>
                { dates.map( (date, idx) => (
                  <Option key={idx} value={date}>{date}</Option>
                ))}
              </Select>
            </div>
        </Col>
      </Row>
    </div>
  );
}
