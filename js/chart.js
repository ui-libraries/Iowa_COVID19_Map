var countyData = [];

d3.json('http://localhost:31338/data_file.geojson', function(data) {
   countyData = data.features;
   // set the dimensions and margins of the graph
   var margin = {top: 0, right: 0, bottom: 0, left: 75},
   width = 370 - margin.left - margin.right,
   height = 2000 - margin.top - margin.bottom;

   countyData.sort(function(a, b) {
      return a.properties.Confirmed - b.properties.Confirmed;
    });

   // set the ranges
   var y = d3.scaleBand()
         .range([height, 0])
         .padding(0.1);

   var x = d3.scaleLinear()
         .range([0, width]);

   // append the svg object to the body of the page
   // append a 'group' element to 'svg'
   // moves the 'group' element to the top left margin
   var svg = d3.select("#graphic").append("svg")
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
   .append("g")
   .attr("transform",
         "translate(" + margin.left + "," + margin.top + ")");

   // format the data
   countyData.forEach(function(d) {
      d.properties.Confirmed = +d.properties.Confirmed;
   });

   function getStops(count) {
      return ss.ckmeans(countyData.map(function(feature) {
        return feature.properties.Confirmed;
      }), count);
    }
   var caseStops = getStops(9);
console.log(caseStops)

   // Scale the range of the data in the domains
   x.domain([0, d3.max(countyData, function(d){ return d.properties.Confirmed; })])
   y.domain(countyData.map(function(d) { return d.properties.Name; }));
   //y.domain([0, d3.max(data, function(d) { return d.sales; })]);

   // append the rectangles for the bar chart
   svg.selectAll(".bar")
   .data(countyData)
   .enter().append("rect")
   .attr("class", "bar")
   .attr("fill", function(d) { return getCaseColor(caseStops, d.properties.Confirmed); } )
   //.attr("x", function(d) { return x(d.sales); })
   .attr("width", function(d) {return x(d.properties.Confirmed); } )
   .attr("y", function(d) { return y(d.properties.Name); })
   .attr("height", y.bandwidth());

   // add the x Axis
   svg.append("g")
   .attr("transform", "translate(0," + height + ")")
   .call(d3.axisBottom(x));

   // add the y Axis
   svg.append("g")
   .call(d3.axisLeft(y));
});



