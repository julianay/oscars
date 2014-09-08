console.log("hello js");
var dotClicked = false;
var screenWidth = 960
var screenHeight = 500

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = screenWidth - margin.left - margin.right,
    height = screenHeight - margin.top - margin.bottom;

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 
var parseDate = d3.time.format("%Y").parse;
//var formatYear = d3.time.format("%Y").parse;
// setup x 
var xValue = function(d) { return d.award_d;}, // data -> value
    xScale = d3.time.scale().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) { return d.age_award;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// setup fill color
var cValue = function(d) { return d.type_award;},
    color = d3.scale.category10();

// add the graph canvas to the body of the webpage
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load data
d3.csv("data/oscars.csv", function(error, data) {

  // change string (from CSV) into number format
  data.forEach(function(d) {
    d.award_d = +parseDate(d.award_d);
    d.age_award = +d.age_award;
    var dateTest = new Date(d.award_d);
    //console.log((new Date(d.award_d)).getFullYear());
  });

  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
	
  // x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Award Year");


  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Age at award (years)");

  // draw dots
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("id", function(d) { return d.type_award;})
      .attr("r", 3.5)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return color(cValue(d));}) 
      
      //hover dots (click on ipad)
      .on("mouseover", function(d, i) {
        tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html("<div>" + d.name + "<br/>" + (new Date(d.award_d)).getFullYear() + ", age:" + yValue(d) + "<br/>" + d.film + "<div>" )
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
          dimDots(i);   
      })
      .on("mouseout", function(d, i){
        tooltip.transition()
               .duration(500)
               .style("opacity", 0);
               lightDots(i); 
      });

      /*
      //for ipad: 
      .on("click", function(d, i) {
        if(dotClicked==false){
          console.log("test " + dotClicked)
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html("<div>" + d.name + "<br/>" + (new Date(d.award_d)).getFullYear() + ", age:" + yValue(d) + "<br/>" + d.film + "<div>" )
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
          dimDots(i);   
          dotClicked = true;
        }else{
            tooltip.transition()
               .duration(500)
               .style("opacity", 0);
               lightDots(i); 
               console.log("test " + dotClicked)
               dotClicked = false;
        }
      });
      */

  // draw legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      //.attr("x", 10)
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })

      .on("mouseover", function(d, i) {
        svg.selectAll("circle").style("opacity", 0.1);
        //svg.selectAll("#best_actor").style("opacity", 1);
        svg.selectAll("#" + d).style("opacity", 1);
        //svg.selectAll("#" + d).transition().attr("cy",0);
      })
      .on("mouseout", function(d, i) {
        //console.log(d);
        svg.selectAll("circle").style("opacity", 1);
        console.log(xMap);
        //svg.selectAll("#" + d).transition().attr("cy",0);
      });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  // draw legend text
  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d;})
});

function dimDots(i) {
	var n = i+3; //nth starts at 1 booo
	svg.selectAll("circle").style("opacity", 0.1);
	svg.selectAll("circle:nth-child(" + n + ")").style("opacity", 1);
}

function lightDots(i) {
	var n = i+3; //nth starts at 3? weird booo
	console.log(typeof(i));
	svg.selectAll("circle").style("opacity", 1);
	svg.selectAll("circle:nth-child(" + n + ")").style("opacity", 1);
}
