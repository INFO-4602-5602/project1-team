// Used example from https://bl.ocks.org/mbostock/7607535 to build circle packing vis
//


width = 1000
height = 960
var svg = d3.select("#bubbles").append("svg")
			.attr("height",height)
			.attr("width",width)
			.style("display","block")
			.style("margin","auto")

var color = d3.scaleLinear().domain([0,1]).range(["#ffd1b2","#f25f02"]).interpolate(d3.interpolateHcl);
    margin = 100,
    diameter = width-margin
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
    g2= svg.append("g").attr("transform", "translate(" +0+ "," + 0+ ")");
    




var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);
var defs = svg.append("defs");




// make colorbar based on code from https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
    var linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");

 linearGradient.selectAll("stop") 
    .data( color.range() )                  
    .enter().append("stop")
    .attr("offset", function(d,i) { return i/(color.range().length-1); })
    .attr("stop-color", function(d) { return d; });

var bar=g2.append("rect")
	.attr("width", 500)
	.attr("height", 20)
	.attr("x",width/2-300)
	.attr("y",height-margin)
	.style("fill", "url(#linear-gradient)");

	svg.append("text")
		.attr("class","legend")
		.attr("x",350)
		.attr("y",height-60)
		.text("Percent of Open Opportunities");
	svg.append("text")
	.attr("class","legend")
		.attr("x",200)
		.attr("y",height-60)
		.text("0")
		svg.append("text")
		.attr("class","legend")
		.attr("x",680)
		.attr("y",height-60)
		.text("100")

d3.json("result.json", function(error, root) {

  if (error) throw error;

  root = d3.hierarchy(root)
      .sum(function(d) { 
      	return d.size;
      })
      .sum(function(d) {

      	return d.size;
      })
      .sort(function(a, b) { return b.value - a.value; });
	root.sum
	root.sort
  var focus = root,
      nodes = pack(root).descendants(),
      view;
var tooltip = d3.select("body").append("div").attr("class", "toolTip");
  var circle = g.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
      .attr("class", function(d) { 
        return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .style("fill", function(d) { return color(d.data.perc)})
      .on("click", function(d) { if (focus !== d & d.depth<2) zoom(d), d3.event.stopPropagation(); })
      .on("mousemove", function(d) {
      	tooltip.style("left", d3.event.pageX - 0 + "px")
              .style("top", d3.event.pageY - 65 + "px")
              .style("display", "inline-block")
              .html(d.data.name+" "+"<br>Number of Opportunities: "+d.data.size+"<br>"+d.data.perc*100.+"% of opportunities are open");
		})
    .on("mouseout", function(d){ tooltip.style("display", "none");});

  var text = g.selectAll("text")
    .data(nodes)
    .enter().append("text")
      .attr("class", function(d) {
      	if(d.depth<2){return "label"}
      	else{return "label_leaf"}
  })
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
      .text(function(d) { return d.data.name; });

  var node = g.selectAll("circle,text");

  svg.style("background", "#ffffff")
      .on("click", function() { zoom(root); })


  zoomTo([root.x, root.y, root.r * 2 + margin]);

  console.log(nodes[105])
  function zoom(d) {
    
    var focus0 = focus; focus = d;
    console.log(d);
    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
      .filter(function(e,i) { 
        if(i<104){ //for some reason it goes farther than it needs to.  Temporary hack to make zoom work.

          return e.parent==focus || this.style.display === "inline";
        }
        else{
          return false;
        }
      })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }

  function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
    text.text(function(d){
    	return d.data.name;
    })

  }
});
