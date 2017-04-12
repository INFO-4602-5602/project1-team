// Used example from https://bl.ocks.org/mbostock/7607535
//
var color = d3.scaleLinear().domain([0,1]).range(["#f25f02","#ffd1b2"]).interpolate(d3.interpolateHcl);
var svg = d3.select("svg"),
    margin = 20,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");



var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

d3.json("result.json", function(error, root) {
  if (error) throw error;

  root = d3.hierarchy(root)
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
      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .style("fill", function(d) { return color(d.data.perc)})
      .on("click", function(d) { if (focus !== d & d.depth<2) zoom(d), d3.event.stopPropagation(); })
      .on("mousemove", function(d) {

      	tooltip.style("left", d3.event.pageX - 0 + "px")
              .style("top", d3.event.pageY - 65 + "px")
              .style("display", "inline-block")
              .html(d.data.name+" "+"<br>Number of Opportunities: "+d.data.size+"<br> % Open Opportunities: "+d.data.perc);
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








  function zoom(d) {
    var focus0 = focus; focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
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
