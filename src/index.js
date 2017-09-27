import React from 'react'
import ReactDOM from 'react-dom'
import mapboxgl from 'mapbox-gl'
import data from './chloropleth.geojson'

mapboxgl.accessToken = 'pk.eyJ1IjoianVsY29ueiIsImEiOiJjajJjbWxieGswNDJxMzNvOHk4dXptNXE5In0.k5Ie7obbnnl49UWLOf6PJw';

const choropleth = [{
  name: 'Crime',
  description: 'Total crime records by Vancouver neighbourhood',
  property: 'count',
  stops: [[5000, 'rgba(172, 242, 229, 0.5)'],[10000, 'rgba(131, 236, 217, 0.5)'], [15000, 'rgba(90, 230, 204, 0.5)'],[20000, 'rgba(27, 201, 170, 0.5)'],[25000, 'rgba(27, 201, 170, 0.5)'],[30000, 'rgba(16, 121, 102, 0.5)'],[35000, 'rgba(  16, 121, 102, 0.5)'],[40000, 'rgba(11, 81, 68, 0.5)'],[45000, 'rgba(11, 81, 68, 0.5)']]
}];

const years = [{name: '2016'}, {name: '2015'}, {name: '2014'}, {name: '2013'}, {name: '2012'}, {name: '2011'}, {name: '2010'}, {name: '2009'}, {name: '2008'}, {name: '2007'}, {name: '2006'}, {name: '2005'}, {name: '2004'}, {name: '2003'}, {name: 'all'}];
const types = [{name: 'all'}, {name: 'Break and Enter Commercial'}, {name: 'Break and Enter Residential'}, {name: 'Mischief'}, {name: 'Other Theft'}, {name: 'Theft From Vehicle'}, {name: 'Theft of Bicycle'}, {name: 'Theft of Vehicle'}, {name: 'Vehicle Collision or Pedesitran Struck'}];

class Application extends React.Component {
  map;

  constructor(props: Props) {
    super(props);
    this.state = {
      years: years,
      types: types,
      choropleth: choropleth[0]
    };
  }

  componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/julconz/cj7rpgkw4e3yl2smwad8ddg7c',
      center: [-123.1258, 49.2574],
      zoom: 12
    });

    const submit = document.getElementById('submit');
    const choroplethSubmit = document.getElementById('choropleth');
    const layers = ['all', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016'];

     map.on('load', function() {
      map.addSource('neighbourhoods', {
        type: 'geojson',
        data: data
      });

      map.addLayer({
        id: 'neighbourhoods',
        type: 'fill',
        source: 'neighbourhoods'
      });

      map.setLayoutProperty('neighbourhoods', 'visibility', 'none');
    });

    choroplethSubmit.onclick = function(e){

      document.getElementById('years').value = ' ';
      document.getElementById('types').value = ' ';
      document.getElementById('legend-choropleth').style.display = 'block';

      layers.forEach(function(layer){
        map.setLayoutProperty(layer, 'visibility', 'none');
      });

      if (map.getLayer('neighbourhoods').layout.visibility === 'none') {
        map.setPaintProperty('neighbourhoods', 'fill-color', {
          property: 'count',
          stops: [[5000, 'rgba(172, 242, 229, 0.5)'],[10000, 'rgba(131, 236, 217, 0.5)'], [15000, 'rgba(90, 230, 204, 0.5)'],[20000, 'rgba(27, 201, 170, 0.5)'],[25000, 'rgba(27, 201, 170, 0.5)'],[30000, 'rgba(16, 121, 102, 0.5)'],[35000, 'rgba(  16, 121, 102, 0.5)'],[40000, 'rgba(11, 81, 68, 0.5)'],[45000, 'rgba(11, 81, 68, 0.5)']]
        });
         map.setLayoutProperty('neighbourhoods', 'visibility', 'visible');
      } else {
        map.setLayoutProperty('neighbourhoods', 'visibility', 'none');
      }
    }

    submit.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();

      var year = document.getElementById('years').value,
          type = document.getElementById('types').value;

      layers.forEach(function(layer){
        map.setLayoutProperty(layer, 'visibility', 'none');
        map.setLayoutProperty('neighbourhoods', 'visibility', 'none');
      });

      document.getElementById('legend-choropleth').style.display = 'none';

      if (type !== 'all' && year !== 'all'){
        map.setFilter(year, ['all', ['==', 'TYPE', type], ['==', 'YEAR', parseInt(year)]]);
      } else if (year === 'all' && type !== 'all') {
        map.setFilter(year, ['==', 'TYPE', type]);
      } else if (year !== 'all' && type === 'all') {
        map.setFilter(year, ['==', 'YEAR', parseInt(year)]);
      }  

      map.on('sourcedata', function(e){
        stats(year, type);
      })

      map.setLayoutProperty(year, 'visibility', 'visible');

      function stats(year, type){
        var features = map.queryRenderedFeatures(e.point, {
          layers: [year] // replace this with the name of the layer
        });

        if (type == 'Vehicle Collision or Pedestrian Struck (with Injur') {
          type = 'Vehicle Collision or Pedestrian Struck (with Injury)';
        }

        if (year == 'all'){
          year = 'all years';
        }

        document.getElementById('stats').innerHTML =  features.length + " records of " + type + " crime in " + year;
      }

      map.on('click', function(e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: [year] // replace this with the name of the layer
        });

        if (!features.length) {
          return;
        }

        var feature = features[0];

        if (feature.properties.TYPE == 'Vehicle Collision or Pedestrian Struck (with Injur') {
          feature.properties.TYPE = 'Vehicle Collision or Pedestrian Struck (with Injury)'
        }

        var popup = new mapboxgl.Popup({ offset: [0, -15] })
          .setLngLat(feature.geometry.coordinates)
          .setHTML('<div class="popup"><p>' + feature.properties.TYPE + '</p><p>' + feature.properties.DAY + '/' + feature.properties.MONTH + '/' + feature.properties.YEAR + '</p></div>')
          .setLngLat(feature.geometry.coordinates)
          .addTo(map);
      });
    };
  }

  render() {
   const { name, description, stops, property } = this.state.choropleth;
   const renderLegendKeys = (stop, i) => {
      if (i === 0) {
        stop[0] = "< " + stop[0];
      } 

      if (i === stops.length - 1){
        stop[0] = "> " + stop[0];
      }
      return (
        <div key={i} className='txt-s'>
          <span className='mr6 round-full w12 h12 inline-block align-middle' style={{ backgroundColor: stop[1] }} />
          <span>{`${stop[0].toLocaleString()}`}</span>
        </div>
      );
    }

    const renderYears = (years, i) => {
      return (
        <option key={i}>{years.name}</option>
      );
    }

    const renderTypes = (types, i) => {
      return (
        <option key={i}>{types.name}</option>
      );
    }

    return (
      <div>
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
        <div id="legend" className="absolute">
          <select id="years">
            {years.map(renderYears)}
          </select>
          <select id="types">
            {types.map(renderTypes)}
          </select>
          <button id="submit"> SUBMIT </button>
          <button id="choropleth"> CHOROPLETH </button>
          <div id="stats"></div>
          <div id="legend-choropleth">
            <div className='mb6'>
              <h2>{name}</h2>
              <p>{description}</p>
            </div>
            {stops.map(renderLegendKeys)}
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Application />, document.getElementById('app'));
