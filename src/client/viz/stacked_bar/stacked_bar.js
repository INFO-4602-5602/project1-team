var opportunities = [];
var opportunities_loaded = false;
var w = 700; // Width of our visualization
var h = 500; // Height of our visualization
var xOffset = 90; // Space for x-axis labels
var yOffset = 50; // Space for y-axis labels
var margin = 0; // Margin around visualization

    var stackedBarDom = document.createElement('div');
    stackedBarDom.id = 'stackeBarChart';
    document.getElementById("StackedBars").appendChild(stackedBarDom);
    d3.csv("../../../lib/data/ZayoHackathonData_Opportunities.csv", function(data) {

    var maxContractLength = d3.max(data, function(d) {
        return parseFloat(d['Term in Months']);
    });
    var x = d3.scaleLinear()
    .domain([0, maxContractLength])
    .rangeRound([0, w]);
    var y = d3.scaleLinear()
    .rangeRound([h, 0]);
    var histogram = d3.histogram()
        .value(function(d) { d['Term in Months']})
        .domain(x.domain())
        .thresholds(x.ticks(10));        

    var svg = d3.select('#' + stackedBarDom.id).append("svg:svg")
        .attr('width', w + xOffset)            
        .attr('height', h + yOffset)
        .append("g");
    var bins = histogram(data);

    var vals = new Array(2);
    vals[0] = 'Lost';
    vals[1] = 'Won';

    var counts = new Array(13);
    var maxCount, offsetConstant;

    function loadCounts() {
        for (i = 0; i < 13; i++) {
            counts[i] = new Object();
            counts[i]['Won'] = 0;
            counts[i]['Lost'] = 0;
        }
        data.forEach(function(element) {
            var term = parseFloat(element['Term in Months']);
            if (!isNaN(term)) {
                if (element['IsWon'] === 'TRUE') {
                    counts[Math.floor(element['Term in Months'] * 12 / maxContractLength)]['Won']++;
                }
                else {
                    counts[Math.floor(element['Term in Months'] * 12 / maxContractLength)]['Lost']++;
                }
            }
        });

        maxCount = d3.max(counts, function(d) { return d['Won'] + d['Lost']; });
        offsetConstant = (h) / maxCount
        y.domain([0, maxCount]);
    }
    function loadGraphs() {
        var colors = ["#0080BB", "#F25F02"];
        var z = d3.scaleOrdinal()
            .domain(colors);
        var colorNumY = 0;
        var colorNumHeight = 0;

        var stack = svg.append("g")
            .selectAll("g")
            .data(d3.stack().keys(vals)(bins))
            .enter().append("g")
                .attr('transform', "translate(" + xOffset + ",0)")
                .attr('fill', function(d, i) { return colors[i]; })
                .selectAll("rect")
                .data(function(d) { return d; })
                .enter().append("rect")
                    .attr("x", function(d) { return x(d.data.x0);})
                    .attr("y", function(d, i) { 
                        if (i >= counts.length) return h; 
                        else if(!colorNumY) {if (i == counts.length - 1) colorNumY++; return (h - (offsetConstant * (counts[i]['Won'] + counts[i]['Lost'])));}
                        else return (h - (offsetConstant * (counts[i]['Lost'])));})
                    .attr("height", function(d, i) {
                        if (i >= counts.length) return 0;
                        else if (!colorNumHeight) {
                        if (i == counts.length - 1) colorNumHeight++; return offsetConstant * counts[i]['Won'];}
                        else {return  offsetConstant * counts[i]['Lost'] ;}
                    })
                    .attr("width", function(d) {console.log(d);return x(d.data.x1 - d.data.x1);});

        // add the x Axis
        svg.append("g")
          .attr("transform", "translate(89," + h + ")")
          .call(d3.axisBottom(x)
               .ticks(10, "s"));

        // add the y Axis
        svg.append("g")
            .call(d3.axisLeft(y).ticks(10, "s"))
            .attr('transform', 'translate(89, 0)')
            .append("text")
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr('font-size', 10)
            .attr("text-anchor", "start")

            .text("Account Total")

            .attr('transform', 'rotate(-90)')
            .attr("x", 0 - (h/2))
            .attr('y', 0 - (xOffset/1.5));

        var legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .attr('transform', "translate(50,0)")
            .selectAll("g")
                .data(vals.reverse().slice())
                .enter().append("g")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        legend.append("rect")
            .attr("x", w - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", function(d, i) {
                return colors[i];

            });

        legend.append("text")
            .attr("x", w - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function(d) { return d; });
    }
    loadCounts();
    setTimeout(loadGraphs(), 3000);
});