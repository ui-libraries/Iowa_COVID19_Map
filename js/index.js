// initialize our map
var map = L.map('map');

//add esri topo basemap
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 11,
  minZoom: 7,
  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
}).addTo(map);

//add a scale bar
L.control.scale({
  position: 'bottomleft'
}).addTo(map);


//load the data asynchronously
d3.queue()
  // .defer(d3.json, 'https://opendata.arcgis.com/datasets/6a84756c2e444a87828bb7ce699fdac6_0.geojson') //the Iowa COVID-19 geojson file
//   .defer(d3.json, 'http://localhost:31338/data_file.geojson') //the Iowa COVID-19 geojson file
  .defer(d3.json, 'https://mhetzel.github.io/Iowa_COVID19_Map/python/data_file.geojson') //the Iowa COVID-19 geojson file
  .await(drawMap); //load the layers after the map loads

//provide instructions for drawing the map
function drawMap(err, corona) {

  var curLegend = null;
  var curLabels = null;

  function getTotal(name) {
    return ss.sum(corona.features.map(function(feature) {
      return feature.properties[name];
    }));
  }

  function getStops(name, count) {
    return ss.ckmeans(corona.features.map(function(feature) {
      return feature.properties[name];
    }), count);
  }

  //get the total cases count for Iowa
  var caseTotal = getTotal('Confirmed');
  // Group totals of cases into 9 ckmeans categories
  var caseStops = getStops('Confirmed', 9);
  var caseLabels = [];


  //get the total death count for Iowa
  var deathTotal = getTotal('Deaths');
  // Group totals of deaths into 5 ckmeans categories
  var deathStops = getStops('Deaths', 5);
  var deathLabels = [];

  // Add a function to style the counties by their confirmed deaths (ck means)
  function getDeathColor(d) {
    return d >= ss.min(deathStops[4]) ? '#08519c' :
      d >= ss.min(deathStops[3]) ? '#3182bd' :
      d >= ss.min(deathStops[2]) ? '#6baed6' :
      d >= ss.min(deathStops[1]) ? '#bdd7e7' :
      d >= ss.min(deathStops[0]) ? '#eff3ff' :
      'rgba(0,0,0,0.0)';
  };

  //get the total active count for Iowa
  var activeTotal = getTotal('Active');
  // Group totals of active into 7 ckmeans categories
  var activeStops = getStops('Active', 7);
  var activeLabels = [];

  // Add a function to style the counties by their confirmed deaths (ck means)
  function getActiveColor(d) {
    return d >= ss.min(activeStops[6]) ? '#366946' :
      d >= ss.min(activeStops[5]) ? '#488C5D' :
      d >= ss.min(activeStops[4]) ? '#5baf75' :
      d >= ss.min(activeStops[3]) ? '#7BBF90' :
      d >= ss.min(activeStops[2]) ? '#9CCFAC' :
      d >= ss.min(activeStops[1]) ? '#BDDFC7' :
      d >= ss.min(activeStops[0]) ? '#DEEFE3' :
      'rgba(0,0,0,0.0)';
  };

  //get the total recovered count for Iowa
  var recoveredTotal = getTotal('Recovered');
  console.log(recoveredTotal)
  // Group totals of recovered into 7 ckmeans categories
  var recoveredStops = getStops('Recovered', 7);
  var recoveredLabels = [];

  var cases = L.geoJson(corona, { //define layer with a variable

    style: function(feature) {

      var props = feature.properties;

      return {
        stroke: 1,
        color: "grey",
        weight: 1,
        fillColor: getCaseColor(caseStops, props.Confirmed),
        fillOpacity: 0.75
      };
    },

    //restyle on mouseover, reset style on mouseout
    onEachFeature: function(feature, layer) {

      console.log(feature.properties);

      // bind a popup window
      layer.bindPopup('<h4><b>' + feature.properties.Name + ' County' +
        '<br>' + 'Population: ' + feature.properties.pop_est_2018 + '</b>' +
        '<br><br>Confirmed Cases: ' + feature.properties.Confirmed +
        '<br>Statewide Total: ' + caseTotal +
        '<br>Last Updated: ' + feature.properties.last_updated.substring(0, feature.properties.last_updated.length - 8) +
        '</h4>', {
          maxHeight: 300,
          minWidth: 150,
          maxWidth: 200,
        });

      var label = L.marker(layer.getBounds().getCenter(), {
        icon: L.divIcon({
          className: 'label',
          html: '<h3><b>' + feature.properties.Name + '(' + feature.properties.Confirmed + ')</b></h3>',
          iconSize: [100, 40]
        })
      }).addTo(map);
      caseLabels.push(label);

      // change layer style on mouseover
      layer.on("mouseover", function(e) {
        layer.setStyle({
          weight: 2,
          color: "blue",
          opacity: 0.75,
          fillOpacity: 0.75,
        }).bringToFront();
      });
      // reset style on mouseout
      layer.on("mouseout", function(e) {
        cases.resetStyle(e.target);
      });
    }

  }).addTo(map); // add COVID-19 Cases layer and style

  var deaths = L.geoJson(corona, { //define layer with a variable

    style: function(feature) {

      var props = feature.properties;

      return {
        stroke: 1,
        color: "grey",
        weight: 1,
        fillColor: getDeathColor(props.Deaths),
        fillOpacity: 0.75
      };
    },

    //restyle on mouseover, reset style on mouseout
    onEachFeature: function(feature, layer) {

      // bind a popup window
      layer.bindPopup('<h4><b>' + feature.properties.Name + ' County' +
        '<br>' + 'Population: ' + feature.properties.pop_est_2018 + '</b>' +
        '<br><br>Deaths: ' + feature.properties.Deaths +
        '<br>Statewide Total: ' + deathTotal +
        '<br>Last Updated: ' + feature.properties.last_updated.substring(0, feature.properties.last_updated.length - 8) +
        '</h4>', {
          maxHeight: 300,
          minWidth: 150,
          maxWidth: 200,
        });

      var label = L.marker(layer.getBounds().getCenter(), {
          icon: L.divIcon({
            className: 'label',
            html: '<h3><b>' + feature.properties.Name + '(' + feature.properties.Deaths + ')</b></h3>',
            iconSize: [100, 40]
          })
        });
      deathLabels.push(label);

      // change layer style on mouseover
      layer.on("mouseover", function(e) {
        layer.setStyle({
          weight: 2,
          color: "blue",
          opacity: 0.75,
          fillOpacity: 0.75,
        }).bringToFront();
      });
      // reset style on mouseout
      layer.on("mouseout", function(e) {
        deaths.resetStyle(e.target);
      });
    }

  }); // add COVID-19 Deaths layer and style

  var active = L.geoJson(corona, { //define layer with a variable

    style: function(feature) {

      var props = feature.properties;

      return {
        stroke: 1,
        color: "grey",
        weight: 1,
        fillColor: getActiveColor(props.Active),
        fillOpacity: 0.75
      };
    },

    //restyle on mouseover, reset style on mouseout
    onEachFeature: function(feature, layer) {

      // bind a popup window
      layer.bindPopup('<h4><b>' + feature.properties.Name + ' County' +
        '<br>' + 'Population: ' + feature.properties.pop_est_2018 + '</b>' +
        '<br><br>Active: ' + feature.properties.Active +
        '<br>Statewide Total: ' + activeTotal +
        '<br>Last Updated: ' + feature.properties.last_updated.substring(0, feature.properties.last_updated.length - 8) +
        '</h4>', {
          maxHeight: 300,
          minWidth: 150,
          maxWidth: 200,
        });

      var label = L.marker(layer.getBounds().getCenter(), {
          icon: L.divIcon({
            className: 'label',
            html: '<h3><b>' + feature.properties.Name + '(' + feature.properties.Active + ')</b></h3>',
            iconSize: [100, 40]
          })
        });
      activeLabels.push(label);

      // change layer style on mouseover
      layer.on("mouseover", function(e) {
        layer.setStyle({
          weight: 2,
          color: "blue",
          opacity: 0.75,
          fillOpacity: 0.75,
        }).bringToFront();
      });
      // reset style on mouseout
      layer.on("mouseout", function(e) {
        active.resetStyle(e.target);
      });
    }

  }); // add COVID-19 Active layer and style

  var recovered = L.geoJson(corona, { //define layer with a variable

    style: function(feature) {

      var props = feature.properties;

      return {
        stroke: 1,
        color: "grey",
        weight: 1,
        fillColor: getRecoveredColor(recoveredStops, props.Recovered),
        fillOpacity: 0.75
      };
    },

    //restyle on mouseover, reset style on mouseout
    onEachFeature: function(feature, layer) {

      // bind a popup window
      layer.bindPopup('<h4><b>' + feature.properties.Name + ' County' +
        '<br>' + 'Population: ' + feature.properties.pop_est_2018 + '</b>' +
        '<br><br>Recovered: ' + feature.properties.Recovered +
        '<br>Statewide Total: ' + recoveredTotal +
        '<br>Last Updated: ' + feature.properties.last_updated.substring(0, feature.properties.last_updated.length - 8) +
        '</h4>', {
          maxHeight: 300,
          minWidth: 150,
          maxWidth: 200,
        });

      var label = L.marker(layer.getBounds().getCenter(), {
          icon: L.divIcon({
            className: 'label',
            html: '<h3><b>' + feature.properties.Name + '(' + feature.properties.Recovered + ')</b></h3>',
            iconSize: [100, 40]
          })
        });
      recoveredLabels.push(label);

      // change layer style on mouseover
      layer.on("mouseover", function(e) {
        layer.setStyle({
          weight: 2,
          color: "blue",
          opacity: 0.75,
          fillOpacity: 0.75,
        }).bringToFront();
      });
      // reset style on mouseout
      layer.on("mouseout", function(e) {
        recovered.resetStyle(e.target);
      });
    }

  }); // add COVID-19 Active layer and style

  //define layers
  var baselayers = {
    "Confirmed Cases": cases,
    "Confirmed Deaths": deaths,
    "Active Cases": active,
    "Confirmed Recovered": recovered,
  };

  //send the layers to the layer control
  L.control.layers(baselayers, null, {
    collapsed: false,
  }).addTo(map);

  // create legends for both layers
  var caseLegend = L.control({
    position: 'bottomright'
  });

  var deathLegend = L.control({
    position: 'bottomright'
  });

  var activeLegend = L.control({
    position: 'bottomright'
  });

  var recoveredLegend = L.control({
    position: 'bottomright'
  });

  // add content to the legend
  caseLegend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [ss.min(caseStops[0]),
                ss.min(caseStops[1]),
                ss.min(caseStops[2]),
                ss.min(caseStops[3]),
                ss.min(caseStops[4]),
                ss.min(caseStops[5]),
                ss.min(caseStops[6]),
                ss.min(caseStops[7]),
                ss.min(caseStops[8])],
      labels = ["<h6 style='font-size:14px; font-weight:bold'>Confirmed Cases</h6>"];

    // loop through our intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        labels.push('<i style="background:' + getCaseColor(caseStops, grades[i]) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + (grades[i + 1] - 1) : '+'));
    }
    div.innerHTML = labels.join('<br>');
    return div;
  };

  // add content to the legend
  deathLegend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [ss.min(deathStops[0]), ss.min(deathStops[1]), ss.min(deathStops[2]), ss.min(deathStops[3]), ss.min(deathStops[4])],
      labels = ["<h6 style='font-size:14px; font-weight:bold'>Confirmed Deaths</h6>"];

    // loop through our intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        labels.push('<i style="background:' + getDeathColor(grades[i]) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + (grades[i + 1] - 1) : '+'));
    }
    div.innerHTML = labels.join('<br>');
    return div;
  };

  // add content to the legend
  activeLegend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [ss.min(activeStops[0]),
                ss.min(activeStops[1]),
                ss.min(activeStops[2]),
                ss.min(activeStops[3]),
                ss.min(activeStops[4]),
                ss.min(activeStops[5]),
                ss.min(activeStops[6])],
      labels = ["<h6 style='font-size:14px; font-weight:bold'>Active Cases</h6>"];

    // loop through our intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        labels.push('<i style="background:' + getActiveColor(grades[i]) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + (grades[i + 1] - 1) : '+'));
    }
    div.innerHTML = labels.join('<br>');
    return div;
  };

  // add content to the legend
  recoveredLegend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [ss.min(recoveredStops[0]),
                ss.min(recoveredStops[1]),
                ss.min(recoveredStops[2]),
                ss.min(recoveredStops[3]),
                ss.min(recoveredStops[4]),
                ss.min(recoveredStops[5]),
                ss.min(recoveredStops[6])],
      labels = ["<h6 style='font-size:14px; font-weight:bold'>Confirmed Recovered</h6>"];

    // loop through our intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      console.log(grades[i])
      div.innerHTML +=
        labels.push('<i style="background:' + getRecoveredColor(recoveredStops, grades[i]) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + (grades[i + 1] - 1) : '+'));
    }
    div.innerHTML = labels.join('<br>');
    return div;
  };

  // add this legend first, because this layer is on by default
  caseLegend.addTo(map);
  curLegend = caseLegend;
  curLabels = caseLabels;

  // when the user changes the baselayer, switch the legend
  map.on('baselayerchange', function(eventLayer) {
    // Switch to the Confirmed Cases legend...
    if (eventLayer.name === 'Confirmed Cases') {
      this.removeControl(curLegend);
      caseLegend.addTo(this);
      curLegend = caseLegend;
      for (i = 0; i < curLabels.length; i++) {
        this.removeControl(curLabels[i]);
      }
      for (i = 0; i < caseLabels.length; i++) {
        caseLabels[i].addTo(this);
      }
      curLabels = caseLabels;
    } else if (eventLayer.name === 'Active Cases') {
      this.removeControl(curLegend);
      activeLegend.addTo(this);
      curLegend = activeLegend;
      for (i = 0; i < curLabels.length; i++) {
        this.removeControl(curLabels[i]);
      }
      for (i = 0; i < activeLabels.length; i++) {
        activeLabels[i].addTo(this);
      }
      curLabels = activeLabels;
    } else if (eventLayer.name === 'Confirmed Recovered') {
      this.removeControl(curLegend);
      recoveredLegend.addTo(this);
      curLegend = recoveredLegend;
      for (i = 0; i < curLabels.length; i++) {
        this.removeControl(curLabels[i]);
      }
      for (i = 0; i < recoveredLabels.length; i++) {
        recoveredLabels[i].addTo(this);
      }
      curLabels = recoveredLabels;
    } else { // Or switch to the Confirmed Deaths legend...
      this.removeControl(curLegend);
      deathLegend.addTo(this);
      curLegend = deathLegend;
      for (i = 0; i < curLabels.length; i++) {
        this.removeControl(curLabels[i]);
      }
      for (i = 0; i < deathLabels.length; i++) {
        deathLabels[i].addTo(this);
      }
      curLabels = deathLabels;
    }
  });

  //fit the map to the extent of the cases layer upon drawing
  map.fitBounds(cases.getBounds());

}; //end drawMap function
