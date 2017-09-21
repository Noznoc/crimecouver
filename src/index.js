import React from 'react'
import ReactDOM from 'react-dom'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = 'pk.eyJ1IjoianVsY29ueiIsImEiOiJjajJjbWxieGswNDJxMzNvOHk4dXptNXE5In0.k5Ie7obbnnl49UWLOf6PJw';

class Application extends React.Component {

  componentDidMount() {
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/julconz/cj7rpgkw4e3yl2smwad8ddg7c',
      center: [-123.1258, 49.2574],
      zoom: 11.3
    });

    map.on('load', function() {

      var layers = ['all', '2003', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016'];
      var submit = document.getElementById('submit');

      layers.forEach(function(layer){
        console.log(map.getLayer(layer));
        //var content = '<h2>Type: </h2>' + layer.feature.properties;
        //layer.bindPopup(content);
      });
      
      submit.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        var year = document.getElementById('year').value,
            type = document.getElementById('type').value;

        layers.forEach(function(layer){
          map.setLayoutProperty(layer, 'visibility', 'none');
        });


        if ((type !== 'all' && year !== 'all')){
          map.setFilter(year, ['all', ['==', 'TYPE', type], ['==', 'YEAR', parseInt(year)]]);
        } else if (year === 'all' && type !== 'all') {
          map.setFilter(year, ['==', 'TYPE', type]);
        }  

        map.setLayoutProperty(year, 'visibility', 'visible');

        map.on('click', function(e) {
          var features = map.queryRenderedFeatures(e.point, {
            layers: [year] // replace this with the name of the layer
          });

          if (!features.length) {
            return;
          }

          var feature = features[0];

          var popup = new mapboxgl.Popup({ offset: [0, -15] })
            .setLngLat(feature.geometry.coordinates)
            .setHTML('<div class="popup"><p>' + feature.properties.TYPE + '</p><p>' + feature.properties.DAY + '/' + feature.properties.MONTH + '/' + feature.properties.YEAR + '</p></div>')
            .setLngLat(feature.geometry.coordinates)
            .addTo(map);
        });
      };
    });
  }

  render() {

    return ( < div > 
      < div id = "legend"
      className = "inline-block absolute top left z1 py6 px12"
      >
      < h1 >CRIME IN VANCOUVER< /h1>
      <select id = "year" >
      <option default>2016</option>
      <option>2015</option>
      <option>2014</option>
      <option>2013</option>
      <option>2012</option>
      <option>2011</option>
      <option>2010</option>
      <option>2009</option>
      <option>2008</option>
      <option>2007</option>
      <option>2006</option>
      <option>2005</option>
      <option>2004</option>
      <option>2003</option>
      <option>all</option>
      < /select>
      <select id = "type">
        <option default>all</option>
        <option>Break and Enter Commercial</option>
        <option>Break and Enter Residential/Other</option>
        <option>Mischief</option>
        <option>Other Theft</option>
        <option>Theft from Vehicle</option>
        <option>Theft of Bicycle</option>
        <option>Theft of Vehicle</option>
        <option>Vehicle Collision or Pedestrian Struck</option>
      < /select>
      <button id="submit"> SUBMIT
      </button>
      <div id="stats">
        <div id="total"> </div>
      </div>
      < /div> < div ref = {
        el => this.mapContainer = el
      }
      className = "absolute top right left bottom txt-bold" / >
      < /div>
    );
  }
}

ReactDOM.render( < Application / > , document.getElementById('app'));