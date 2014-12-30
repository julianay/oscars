//CONSTANTS
var dotClicked = false;
var legendClicked = false;
var screenWidth = 920
var screenHeight = 500

//MARGINS
var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = screenWidth - margin.left - margin.right,
    height = screenHeight - margin.top - margin.bottom;


//SCALES and AXIS
var dataset = function(d) {return d};
// x scale and axis
var xScale = d3.time.scale().range([5, width]);

//domain set in data loop
var xValue = function(d) { return d.award_d;}; //data -> value (get date value from data)
var xMap = function(d) { return xScale(xValue(d));}; //data -> display (display data in correct scale)
var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// y scale and axis
var yScale = d3.scale.linear().range([height, 0]);
//domain set in data loop
var yValue = function(d) { return d.age_award;};
var yMap = function(d) { return yScale(yValue(d));};
var yAxis = d3.svg.axis().scale(yScale).orient("left");   

//setup color ranges (color scale)
var cValue = function(d){ return d.type_award};
var color = d3.scale.category10(); //constructs ordinal scale with 10 categorical colors

//ADD SVG AND G (group) to the body
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    //create group
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);   

// LOAD DATA
//parse data for time format
var parseDate = d3.time.format("%Y").parse;

d3.csv("data/oscars.csv", function(error, data) {
  data.forEach(function(d) {
    //"+" returns numerical representation
    d.award_d = +parseDate(d.award_d);
    d.age_award = +d.age_award;
    var dateTest = new Date(d.award_d);
  });
 
  //don't want dots overlapping axis, so add in buffer to data domain
  //need to set domain here because I need to pass data array into min and max functions.
  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

  //DRAW
  //X AXIS 
  svg.append("g") //adding group to contain and translate axis
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis) //draw xAxis
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Award Year");

  //Y AXIS
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Age at award");

  // DRAW DOTS
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

 
  // draw legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("id", function(d) { return "leg_" + d;})
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })

      .on("mouseover", function(d, i) {
        if(legendClicked == false){
          svg.selectAll("circle").style("opacity", 0.1);
          svg.selectAll("#" + d).style("opacity", 1);
        }  
      })
      .on("mouseout", function(d, i) {
        if(legendClicked == false){
          svg.selectAll("circle").style("opacity", 1);
        }
      })
      .on("mousedown", function(d, i){
        if(legendClicked == false){
          svg.selectAll("#leg_" + d).style("opacity", 0.1);
          svg.selectAll("circle").style("opacity", 0.1);
          svg.selectAll("#" + d).style("opacity", 1);
          legendClicked = true;
        }else{
          svg.selectAll("#leg_" + d).style("opacity", 1);
          svg.selectAll("circle").style("opacity", 1);
          legendClicked = false;
        }
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
      .text(function(d) { 
        switch(d) {
        case "best_actor":
        d="Best Actor"
        return d;
        break;

        case "best_actress":
        d="Best Actress"
        return d;
        break;

        case "sup_actor":
        d="Supporting Actor"
        return d;
        break;

        case "sup_actress":
        d="Supporting Actress"
        return d;
        break;

        default:
        return d;
        }
      })
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

    


