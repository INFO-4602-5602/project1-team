function renderGraph() {

    var opportunities = [];
    var opportunities_loaded = false;
    var w = 700; // Width of our visualization
    var h = 500; // Height of our visualization
    var xOffset = 90; // Space for x-axis labels
    var yOffset = 50; // Space for y-axis labels
    var margin = 0; // Margin around visualization
    var sortableTerm = document.getElementById('binBy').value;

    var stackedBarDom = document.createElement('div');
    document.getElementById("StackedBars").innerHTML = '';
    document.getElementById("StackedBars").appendChild(stackedBarDom);
    stackedBarDom.id = 'stackeBarChart';
    if (sortableTerm === 'Term in Months') {
            d3.csv("../../../lib/data/ZayoHackathonData_Opportunities.csv", function(data) {

            var maxContractLength = d3.max(data, function(d) {
                return parseFloat(d[sortableTerm]);
            });
            var x = d3.scaleLinear()
            .domain([0, maxContractLength])
            .rangeRound([0, w]);
            var y = d3.scaleLinear()
            .rangeRound([h, 0]);
            var histogram = d3.histogram()
                .value(function(d) { d[sortableTerm]})
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

            for (i = 0; i < bins.length; i++) {
                counts[i] = new Object();
                counts[i]['Won'] = 0;
                counts[i]['Lost'] = 0;
            }
            data.forEach(function(element) {
                var term = parseFloat(element[sortableTerm]);
                if (!isNaN(term)) {
                    if (element['IsWon'] === 'TRUE') {
                        counts[Math.floor(element[sortableTerm] * (bins.length - 1) / maxContractLength)]['Won']++;
                    }
                    else {
                        counts[Math.floor(element[sortableTerm] * (bins.length - 1) / maxContractLength)]['Lost']++;
                    }
                }
            });
            maxCount = d3.max(counts, function(d) { return d['Won'] + d['Lost']; });
            offsetConstant = (h) / maxCount
            y.domain([0, maxCount]);
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
                        .attr("width", 50);

            // add the x Axis
            svg.append("g")
              .attr("transform", "translate(89," + (h) + ")")
              .call(d3.axisBottom(x)
                   .ticks(10, "s"))
                .append("text")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr('font-size', 24)
                .attr("text-anchor", "middle")
                .attr('x', w/2)
                .attr('y', 45)
                .text("Term (months)");

            // add the y Axis
            svg.append("g")
                .call(d3.axisLeft(y).ticks(10, "s"))
                .attr('transform', 'translate(89, 0)')
                .append("text")
                .attr("y", y(y.ticks().pop()) + 0.5)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr('font-size', 24)
                .attr("text-anchor", "middle")

                .text("Account Total")

                .attr('transform', 'rotate(-90)')
                .attr("x", 0 - (h/2))
                .attr('y', 0 - (xOffset/1.5));

            var legend = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 18)
                .attr("text-anchor", "end")
                .attr('transform', "translate(50,0)")
                .selectAll("g")
                    .data(vals.reverse().slice())
                    .enter().append("g")
                    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
            legend.append("rect")
                .attr("x", w - 39)
                .attr('y', function (d, i) {return 20 * i;})
                .attr("width", 39)
                .attr("height", 39)
                .attr("fill", function(d, i) {
                    return colors[i];

                });

            legend.append("text")
                .attr("x", w - 44)
                .attr("y", function(d, i) {return 20 * i + 12})
                .attr("dy", "0.71em")
                .text(function(d) { return d; });
        });
    }
    else {
        document.getElementById("StackedBars").appendChild(stackedBarDom);
            d3.csv("../../../lib/data/ZayoHackathonData_Opportunities.csv", function(data) {

            var maxProximity = d3.max(data, function(d) {
                return parseFloat(d[sortableTerm]);
            });
            var x = d3.scaleLinear()
            .domain([0, maxProximity])
            .rangeRound([0, w]);
            var y = d3.scaleLog()
            .rangeRound([h, 0]);
            var histogram = d3.histogram()
                .value(function(d) { d[sortableTerm]})
                .domain(x.domain())
                .thresholds(x.ticks(10));        

            var svg = d3.select('#' + stackedBarDom.id).append("svg:svg")
                .attr('width', w + xOffset)            
                .attr('height', h + 3 * yOffset)
                .append("g");
            var bins = histogram(data);

            var vals = new Array(2);
            vals[0] = 'Lost';
            vals[1] = 'Won';

            var counts = new Array(8);
            var maxCount, offsetConstant;
            for (i = 0; i < bins.length; i++) {
                counts[i] = new Object();
                counts[i]['Won'] = 0;
                counts[i]['Lost'] = 0;
            }
            data.forEach(function(element) {
                var term = parseFloat(element[sortableTerm]);
                if (!isNaN(term)) {
                    if (element['IsWon'] === 'TRUE') {
                        counts[Math.floor(element[sortableTerm] * (bins.length - 1) / maxProximity)]['Won']++;
                    }
                    else {
                        counts[Math.floor(element[sortableTerm] * (bins.length - 1) / maxProximity)]['Lost']++;
                    }
                }
            });

            maxCount = d3.max(counts, function(d) { return d['Won'] + d['Lost']; });
            offsetConstant = (h) / maxCount;
            y.domain([1, maxCount]).nice();
            var colors = ["#0080BB", "#F25F02"];
            var z = d3.scaleOrdinal()
                .domain(colors);
            var colorNumX = 0;
            var colorNumY = 0;
            var colorNumHeight = 0;

            var stack = svg.append("g")
                .selectAll("g") 
                .data(d3.stack().keys(vals)(bins))
                .enter().append("g")
                    .attr('transform', "translate(" + xOffset + "," + yOffset + ")")
                    .attr('fill', function(d, i) { return colors[i]; })
                    .selectAll("rect")
                    .data(function(d, i) { return d; })
                    .enter().append("rect")
                        .attr("x", function(d, i) {if (i == counts.length - 1) colorNumX++; return x(d.data.x0) + 45 * colorNumX;} )
                        .attr("y", function(d, i) { 
                            if (i >= counts.length) return h; 
                            else if(!colorNumY) {if (i == counts.length - 1) colorNumY++; if (!counts[i]['Won']) return 0; return y(counts[i]['Won']);}
                            else { if (!counts[i]['Lost']) return 0; return y(counts[i]['Lost']);}})
                        .attr("height", function(d, i) {
                            if (i >= counts.length) { return 0; }
                            else if (!colorNumHeight) {
                                if (i == counts.length - 1) colorNumHeight++; if (!counts[i]['Won']) return 0; return h - y(counts[i]['Won']);
                            }
                            else {if (!counts[i]['Lost']) return 0; return h - y(counts[i]['Lost']) ;}
                        })
                        .attr("width", 45);

            // add the x Axis
            svg.append("g")
              .attr("transform", "translate(89," + (h + yOffset) + ")")
              .call(d3.axisBottom(x)
                   .ticks(10, "s"))
                .append("text")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr('font-size', 24)
                .attr("text-anchor", "middle")
                .attr('x', w/2)
                .attr('y', 50)
                .text("Network Proximity(ft)");

            // add the y Axis
            svg.append("g")
                .call(d3.axisLeft(y).ticks(10, "s"))
                .attr('transform', 'translate(89, ' + yOffset +')')
                .append("text")
                .attr("y", y(y.ticks().pop()) + 0.5)
                .attr("dy", "0.32em")
                .attr("fill", "#000")
                .attr("font-weight", "bold")
                .attr('font-size', 24)
                .attr("text-anchor", "middle")

                .text("Account Total")

                .attr('transform', 'rotate(-90)')
                .attr("x", 0 - (h/2))
                .attr('y', 0 - (xOffset/1.5));

            var legend = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 18)
                .attr("text-anchor", "end")
                .attr('transform', "translate(50," + yOffset + ")")
                .selectAll("g")
                    .data(vals.reverse().slice())
                    .enter().append("g")
                    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
            legend.append("rect")
                .attr("x", w - 39)
                .attr('y', function (d, i) {return 20 * i;})
                .attr("width", 39)
                .attr("height", 39)
                .attr("fill", function(d, i) {
                    return colors[i];

                });

            legend.append("text")
                .attr("x", w - 44)
                .attr("y", function(d, i) {return 20 * i + 12})
                .attr("dy", "0.71em")
                .text(function(d) { return d; });
        });
    }
}
renderGraph();