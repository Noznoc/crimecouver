import React from 'react'
import ReactDOM from 'react-dom'
import mapboxgl from 'mapbox-gl'
import Popups from './components/popups'

mapboxgl.accessToken = 'pk.eyJ1IjoianVsY29ueiIsImEiOiJjajJjbWxieGswNDJxMzNvOHk4dXptNXE5In0.k5Ie7obbnnl49UWLOf6PJw';

const years = [{name: 'all'}, {name: '2016'}, {name: '2015'}, {name: '2014'}, {name: '2013'}, {name: '2012'}, {name: '2011'}, {name: '2010'}, {name: '2009'}, {name: '2008'}, {name: '2007'}, {name: '2006'}, {name: '2005'}, {name: '2004'}, {name: '2003'}];
const types = [{name: 'all', value: 'all'}, {name: 'Break & Enter Commercial', value: 'Break and Enter Commercial'}, {name: 'Break & Enter Residential / Other', value: 'Break and Enter Residential/Other'}, {name: 'Mischief', value: 'Mischief'}, {name: 'Other Theft', value: 'Other Theft'}, {name: 'Theft from Vehicle', value: 'Theft from Vehicle'}, {name: 'Theft of Bicycle', value: 'Theft of Bicycle'}, {name: 'Theft of Vehicle', value: 'Theft of Vehicle'}, {name: 'Vehicle Collision or Pedestrian Struck (with Injury)', value: 'Vehicle Collision or Pedestrian Struck (with Injur'}, {name: 'Vehicle Collision or Pedestrian Struck (with Fatality)', value: 'Vehicle Collision or Pedestrian Struck (with Fatal'}];

// remove this at some point and make script pull stops from layer... const stops = this.map.getPaintProperty(layer, 'fill-color');
const stops = [[7500, 'rgba(253, 197, 190, 0.7)'],[15000, 'rgba(252, 162, 152, 0.7)'], [22500, 'rgba(251, 128, 114, 0.7)'], [30000, 'rgba(206, 105, 94, 0.7)'],[37500, 'rgba(137, 70, 63, 0.7)'],[45000, 'rgba(69, 35, 32, 0.7)']]

// info for toggle options
const options = [{
  name: 'Crime by Neighbourhood 2016',
  layer: 'vancouver-crime-nhoods',
  otherLayer: '2016',
  stops: stops},
  {name: 'All Crime 2016',
  layer: '2016',
  otherLayer: 'vancouver-crime-nhoods',
  stops: []
}]

class Application extends React.Component {
  map;
  popupContainer;

  constructor(props: Props) {
    super(props);
    this.state = {
      active: options[1],
      selectValues: {type: 'all', year: '2016'}
    };
  }

  componentDidUpdate() {
    this.handleToggle();
  }

  componentDidMount() {
    this.map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/julconz/cj7rpgkw4e3yl2smwad8ddg7c',
      center: [-123.1846069, 49.265],
      zoom: 11.7,
      maxZoom: 18,
      minZoom: 11
    });

    this.popupContainer = document.createElement('div');
    const popup = new mapboxgl.Marker(this.popupContainer, {
      offset: [-122, 0]
    }).setLngLat([0,0]).addTo(this.map);

    this.map.on('mousemove', (e) => {
      const features = this.map.queryRenderedFeatures(e.point, {layers: [this.state.selectValues.year]});
      popup.setLngLat(e.lngLat);
      this.map.getCanvas().style.cursor = features.length ? 'pointer' : '';
      this.setPopups(features);

      if (this.state.active.layer === 'vancouver-crime-nhoods'){
        const features = this.map.queryRenderedFeatures(e.point, {layers: [this.state.active.layer]});
        if (features.length){
          document.getElementById("stats-choropleth").innerHTML = '<h2> Neighbourhood: ' + features[0].properties.NAME + '</h2><h2> Count: ' + features[0].properties.count + '</h2>'
        }
      } else {
        document.getElementById("stats-choropleth").innerHTML = '';
      }
    });
  }

  //https://stackoverflow.com/questions/41030025/react-updating-state-in-two-input-fields-from-form-submission
  handleChange(event) {
    // remove the layers that already exist
    this.map.setLayoutProperty(this.state.selectValues.year, 'visibility', 'none');

    // get the values from the select tags
    let selectValues = this.state.selectValues;
    let name = event.target.name;
    let value = event.target.value;
    selectValues[name] = value;
    this.setState({selectValues});
  }

  handleSubmit(event) {
    event.preventDefault();

    this.map.setLayoutProperty('2016', 'visibility', 'none');
    
    // input the selected values
    this.setFilter(this.state.selectValues); 
    this.setStats(this.state.selectValues);
  }

  handleToggle(event) {
    let layer = this.state.active.layer;
    let otherLayer = this.state.active.otherLayer;

    /*if (layer === 'vancouver-crime-nhoods'){
      this.setLegend(layer);
    }*/
    
    this.map.setLayoutProperty(otherLayer, 'visibility', 'none');
    this.map.setLayoutProperty(layer, 'visibility', 'visible');
  }

  setFilter(values){
    var filter = [];

    // hide legend & toggle if it is not 2016 data
    if (values.year !== '2016'){
      document.getElementById('legend-choropleth').style.display = 'none';
      document.getElementById('toggle').style.display = 'none';
      this.map.setLayoutProperty('vancouver-crime-nhoods', 'visibility', 'none');
    }
    
    // based on selection, output the following filter
    if (values.type !== 'all' && values.year !== 'all'){
      filter = ['all', ['==', 'TYPE', values.type], ['==', 'YEAR', parseInt(values.year)]];
    } else if (values.year === 'all' && values.type !== 'all') {
      filter = ['==', 'TYPE', values.type];
    } else if (values.year !== 'all' && values.type === 'all') {
      filter = ['==', 'YEAR', parseInt(values.year)];
    }

    // apply the filter and then make the layer visible on the map
    this.map.setFilter(values.year, filter)
    this.map.setLayoutProperty(values.year, 'visibility', 'visible');
  }

  setPopups(features){
    if (features.length) {
      ReactDOM.render(
        React.createElement(
          Popups, {
            features
          }
        ),
        this.popupContainer
      );
    } else if (this.state.selectValues.layer === 'vancouver-crime-nhoods'){

    } else {
      this.popupContainer.innerHTML = '';
    }
  }

  setStats(values){

    // need to figure out how to get all data from layer, not just what is rendered
    //var features = this.map.queryRenderedFeatures({layers:[values.year]});

    if (values.type === 'Vehicle Collision or Pedestrian Struck (with Injur') {
      values.type = 'Vehicle Collision or Pedestrian Struck (with Injury)';
    }

    if (values.type === 'Vehicle Collision or Pedestrian Struck (with Fatal') {
      values.type = 'Vehicle Collision or Pedestrian Struck (with Fatality)';
    }

    if (values.year === 'all'){
      values.year = 'all years';
    }

    document.getElementById('stats').innerHTML =  values.type + " in " + values.year;
  }

  /*setLegend(layer){
    const stops = this.map.getPaintProperty(layer, 'fill-color');
  }*/

  render() {
   const { name, layer, stops } = this.state.active;
   const renderLegendKeys = (stop, i) => {
      console.log(stop)
      if (stop.length){  
        return (
            <div key={i} className='txt-s'>
              <span className='mr6 round-full w12 h12 inline-block align-middle' style={{ backgroundColor: stop[1] }} />
              <span>{`${stop[0].toLocaleString()}`}</span>
            </div>
        );
      }
    }

    const renderYears = (years, i) => {
        return (
          <option key={i} value={years.name}>{years.name}</option>
        );
    }

    const renderTypes = (types, i) => {
      return (
        <option key={i} value={types.value}>{types.name}</option>
      );
    }

    const renderToggle = (option, i) => {
      return (
        <label key={i} className="toggle-container">
          <input onChange={() => this.setState({ active: options[i] })} checked={option.layer === layer} name="toggle" type="radio" />
          <div className="toggle txt-s py3">{option.name}</div>
        </label>
      );
    }

    return (
      <div>
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
        <a id="data" className="absolute bottom" rel="noopener noreferrer" href="http://data.vancouver.ca/datacatalogue/crime-data-details.htm?" target="_blank"><strong> source data </strong></a>
        <div id="legend" className="absolute">
          <p className="txt-bold">Vancouver Crime Data (2003 - 2016)</p>
          <div className="filters">
            <form onClick={this.handleSubmit.bind(this)}>
              <div className="filter-container">
                <label>Crime Type</label>
                <select name="type" className="filter" id="types" value={this.state.selectValues["type"]} onChange={this.handleChange.bind(this)}>
                  {types.map(renderTypes)}
                </select>
              </div>
              <div className="filter-container">
                <label>Year</label>
                <select name="year" className="filter" id="years" value={this.state.selectValues["year"]} onChange={this.handleChange.bind(this)}>
                  {years.map(renderYears)}
                </select>
              </div>
              <div className="filter-container" >
                <label>Filter Data</label>
               <input id="submit" type="submit" value="SUBMIT" />
              </div>
            </form>
            <div id="stats" className="txt-bold"></div>
          </div>
        </div>
        <div id="toggle" className="legend toggle-group border border--1 shadow-darken10 z1">
          {options.map(renderToggle)}
        </div>
        <div id="legend-choropleth" className="legend absolute top left shadow-darken10 round wmax180">
          <h2 className="txt-bold block">{name}</h2>
          {stops.map(renderLegendKeys)}
          <p className="txt-bold block" id="stats-choropleth"></p>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Application />, document.getElementById('app'));
