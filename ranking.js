
var num = 6;

var margin = {top: 50, right: 90, bottom: 50, left: 90};
var width = 700,
    height = 500;

var devicePixelRatio = window.devicePixelRatio || 1;

var canvas = d3.select("#area1").select("canvas")
    .attr("width", width * devicePixelRatio)
    .attr("height", height * devicePixelRatio)
    .style("width", width + "px")
    .style("height", height + "px");

var svg = d3.select("#area1").select("svg")
    .style("width", width + "px")
    .style("height", height + "px")
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var color = d3.scaleOrdinal()
.range([ "#DB7F85", "#50AB84", "#4C6C86", "#C47DCB", "#B59248", "#DD6CA7", "#E15E5A", "#5DA5B3", "#725D82", "#54AF52", "#954D56", "#8C92E8", "#D8597D", "#AB9C27", "#D67D4B", "#D58323", "#BA89AD", "#357468", "#8F86C2", "#7D9E33", "#517C3F", "#9D5130", "#5E9ACF", "#776327", "#944F7E"]);

var xscale = d3.scaleLinear()
  .domain([1949,2015])
  .range([margin.left,width-margin.right]);

var xaxis = d3.axisBottom()
  .scale(xscale)
  .ticks(10)
  .tickFormat(d3.format(""));

var xaxis1 = d3.axisTop()
  .scale(xscale)
  .ticks(10)
  .tickFormat(d3.format(""));


 svg.attr("class", "x axis")
  .attr("transform", "translate(0," + (height-margin.bottom) + ")")
  .call(xaxis);

  svg.attr("class", "x axis")
  .attr("transform", "translate(0," + (margin.top) + ")")
  .call(xaxis1);

var yscale = d3.scaleLinear()
  .domain([0,num])
  .range([2*margin.top, height-margin.bottom]);

var radius = d3.scaleSqrt()
  .domain([0,0.1])
  .range([0,4]);

d3.csv("energy_source ranking1.csv", function(error, data) {
  data.forEach(function(d) {
    d.fraction = +d.fraction;
    d.year = +d.year;
  });

  // nest by name and rank by fraction
  var nested = d3.nest()
    .key(function(d) { return d.name; })
    .rollup(function(leaves) {
      return {
        data: leaves,
        sum: d3.sum(leaves, function(d) { return d.fraction; })
      };
    })
    .sortValues(function(a,b) {  return a.sum - b.sum;   })
    .entries(data);

  var topnames = nested.slice(0,num).map(function(d) { return d.key; });
  data = data.filter(function(d) {
    return topnames.indexOf(d.name) > -1;
  });
 console.log(nested);
  // nest by name and rank by fraction
  window.byYear = {}
  d3.nest()
    .key(function(d) { return d.year; })
    .key(function(d) { return d.name; })
    .sortValues(function(a,b) {  return a.fraction - b.fraction; })
    .rollup(function(leaves,i) {
      return leaves[0].fraction;
    })
    .entries(data)
    .forEach(function(year) {
      byYear[year.key] = {};
      year.values.forEach(function(name,i) {
        byYear[year.key][name.key] = i;
      });
    });
  console.log(byYear);
  var ctx = canvas.node().getContext("2d");
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.fillStyle = "#1a1a1a";
  ctx.strokeStyle = "#1a1a1a";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  nested.slice(0,num).reverse().forEach(function(name,i) {
    var yearspopular = name.values.data;

    if (i > 1) {
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = color(name.key);
      ctx.lineWidth = 2.5;
    } else {
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1;
    }

    // bump line
    ctx.globalCompositeOperation = "darken";
    ctx.beginPath();
    ctx.lineCap = "round";
    yearspopular.forEach(function(d,j) {
      if (j == 0 || ((d.year - yearspopular[j-1].year) > 1)) {
        ctx.moveTo(xscale(d.year), yscale(byYear[d.year][name.key]))
      } else {
        ctx.lineTo(xscale(d.year), yscale(byYear[d.year][name.key]));
      }
    });
    ctx.stroke();
    ctx.closePath();
  });

  ctx.font = "8px sans-serif";
  nested.slice(0,num).reverse().forEach(function(name,i) {
    var yearspopular = name.values.data;
    if (i > 1) {
      ctx.fillStyle = color(name.key);
    } else {
      ctx.fillStyle = "#555";
    }

    // start energy
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.9;
    ctx.textAlign = "end";
    var start = yearspopular[0].year;

    ctx.fillText(name.key, xscale(start)-4, yscale(byYear[start][name.key]));
    // end energy
    ctx.textAlign = "start";
    var end= yearspopular[yearspopular.length-1].year
      console.log(yearspopular);
    ctx.fillText(name.key, xscale(end)+4, yscale(byYear[end][name.key]));
  });
});
