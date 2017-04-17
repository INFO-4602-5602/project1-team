//width and height of map
var width = 1260;
var height = 700;
var centered;

//D3 projection
var projection = d3.geo.albersUsa()
				   .translate([width/2, height/2])  //translate to center of screen
				   .scale([1500]);  //scale map

//define path generator
var path = d3.geo.path()  //convert GeoJSON to SVG paths
		  	 .projection(projection);  //use albersUsa projection

//create SVG element and append map to the SVG
var svg = d3.select("#spacial")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

//append div for tooltip to SVG
var div = d3.select("body")
		    .append("div")
    		.attr("class", "tooltip")
    		.style("opacity", 0);

var g = svg.append("g");

// Load GeoJSON data
d3.json("us_states.json", function(json) {

//zoom listener
g.append("g")
  .attr("id", "states")
  .selectAll("path")
  .data(json.features)
  .enter().append("path")
  .attr("d", path)
  .on("click", clicked)
  .style("stroke", "#fff") //state border color
	.style("stroke-width", "1") //state border stroke
	.style("fill", "rgb(213,222,217)") //state color

//bind the data to the SVG and create one path per GeoJSON feature
svg.selectAll("path")
	.data(json.features)
	.enter()
	.append("path")
	.attr("d", path);



d3.csv("../../../lib/data/opps_preds.csv", function(data) {

svg.selectAll("circle")
	.data(data)
	.enter()
	.append("circle")
  .attr("cx", function (d) {
      return projection([d.Longitude, d.Latitude])[0];
  })
  .attr("cy", function (d) {
      return projection([d.Longitude, d.Latitude])[1];
  })
	.attr("r", function(d) {
		return Math.sqrt(1);
	})
	.style("fill", function (d) {
    var hue;
    switch (d.StageName) {

      case "1 - Working":
        hue=((1-0.6)*120).toString(10);
        break;

      case "2 - Best Case":
        hue=((1-0.3)*120).toString(10);
        break;

      case "3 - Committed":
        hue=((1-0.2)*120).toString(10);
        break;

      case "4 - Closed":
        hue=((1-0.7)*120).toString(10);
        break;

      case "5 - Accepted":
        hue=((1-0)*120).toString(10);
        break;

      case "Closed - Lost":
        hue=((1-1)*120).toString(10);
        break;

      default:
        hue=((1-d.IsCommittedProbability)*120).toString(10);
        break;
    }
    return ["hsl(",hue,",100%,50%)"].join("");
  })
	.style("opacity", 0.85)

	.on("mouseover", function(d) {
    	div.transition()
      	   .duration(200)
           .style("opacity", .9);
           div.html(d["Account ID"] + "<br/>" + "Success %: " + d.Prediction*100 +
					 "<br/>" + "Total BRR: " + d["Total BRR"])
           .style("left", (d3.event.pageX) + "px")
           .style("top", (d3.event.pageY - 68) + "px")
	})
    // fade out tooltip on mouse out
    .on("mouseout", function(d) {
        div.transition()
           .duration(500)
           .style("opacity", 0);
    });
  });
  function clicked(d) {
    var x, y, k;

    if (d && centered !== d) {
      var centroid = path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      k = 4;
      centered = d;
    } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;
    }
    g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });

    //Same projection and transformation as applicable to the path elements.
    d3.selectAll("circle")
    .transition()
    .duration(750)
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")

    g.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
  }
});
