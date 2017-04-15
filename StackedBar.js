var opportunities = [];
var opportunities_loaded = false;
var w = 700; // Width of our visualization
var h = 500; // Height of our visualization
var xOffset = 90; // Space for x-axis labels
var yOffset = 50; // Space for y-axis labels
var margin = 0; // Margin around visualization

function load_csv(csv_name) {
    var client = new XMLHttpRequest();
    client.open('GET', csv_name);
    client.onreadystatechange = function() {
        if (!opportunities.length && client.response.length > 0) {
            opportunities = $.csv.toArrays(client.response);
            opportunities_loaded = true;
            main_code();
        }
    }
    client.send();
}

/*
 * Main code -- cheeky work-around for asynchronous file loading
 */
//load_csv('ZayoHackathonData_Opportunities.csv');
main_code();
function main_code() {
        var stackedBarDom = document.createElement('div');
        stackedBarDom.id = 'stackeBarChart';
        document.getElementById("StackedBars").appendChild(stackedBarDom);
        d3.csv("ZayoHackathonData_Opportunities.csv", function(data) {

        var maxContractLength = d3.max(data, function(d) {
            return parseFloat(d['Term in Months']);
        });
        var x = d3.scaleLinear()
        .domain([0, maxContractLength])
        .rangeRound([0, w]);
        var y = d3.scaleLinear()
        .range([h, 0]);
        /*var xScale = d3.scale.linear()
        .domain([0,maxContractLength])
        .range([xOffset +margin, w - margin]);
        console.log(maxContractLength);*/
        var histogram = d3.histogram()
            .value(function(d) { d['Term in Months']})
            .domain(x.domain())
            .thresholds(x.ticks(10));        

        var svg = d3.select('#' + stackedBarDom.id).append("svg:svg")
            .attr('width', w + xOffset)            
            .attr('height', h + yOffset)
            .append("g");
            var bins = histogram(data);
        y.domain([0, d3.max(bins, function(d) { return d.length; })]);
        
        var cutoffs = new Array(10).fill(0);
        
        var binSize = maxContractLength/10;
        var currentMin = 0;
        var wonCounts = new Array(11).fill(0), lostCounts = new Array(11).fill(0);

        data.forEach(function(element) {
            var term = parseFloat(element['Term in Months']);
            if (!isNaN(term)) {
                if (element['IsWon'] === 'true') {
                    wonCounts[Math.floor(element['Term in Months'] * 10 / maxContractLength)]++;
                }
                else if (element['IsWon'] === 'false') lostCounts[Math.floor(element['Term in Months'] * 10 / maxContractLength)]++; 
            }
        });
        console.log(wonCounts, lostCounts);
        var colors = ["#0080BB", "#F25F02"];
        var z = d3.scaleOrdinal()
            .domain(colors);
        var gradients = new Array(11);
        d3.range(10).forEach(function(d, i) {
            gradients[i] = svg.append("svg:defs")
                .append("svg:linearGradient")
                .attr("id", "gradient")
                .attr("x1", "50%")
                .attr("y1", "0%")
                .attr("x2", "50%")
                .attr("y2", "100%")
                .attr("spreadMethod", "pad");
            gradients[i].append("svg:stop")
                .attr("offset", "0%")
                .attr('stop-color', '#ff0000')
                .attr('stop-opacity', 1);
            gradients[i].append("svg:stop")
                .attr("offset", function() {
                    if (isNaN(wonCounts[i] + lostCounts[i]) || (wonCounts[i] + lostCounts[i] == 0)) return "0.0";
                    // return 0.75.toString();  <---- SUCCESSFULLY SETS GRADIENT TO SWITCH COLORS AT 75%
                   
                    return (lostCounts[i]/(lostCounts[i] + wonCounts[i])).toFixed(2).toString(); // EVALUATES TO "0.63", BUT DOES NOTHING
                })
                .attr('stop-color', '#ff0000')
                .attr('stop-opacity', 1);
            gradients[i].append("svg:stop")
                .attr("offset", function() {
                    if (isNaN(wonCounts[i] + lostCounts[i]) || (wonCounts[i] + lostCounts[i] == 0)) return "0.0";
                    // return 0.75.toString();  <---- SUCCESSFULLY SETS GRADIENT TO SWITCH COLORS AT 75%
                
                    return (lostCounts[i]/(lostCounts[i] + wonCounts[i])).toFixed(2).toString(); // EVALUATES TO "0.63", BUT DOES NOTHING
                })
                .attr('stop-color', '#008000')
                .attr('stop-opacity', 1);
            gradients[i].append("svg:stop")
                .attr("offset", "100%")
                .attr('stop-color', '#008000')
                .attr('stop-opacity', 1);

        });
        svg.selectAll("rect")
            .data(bins)
            .enter().append("rect")
            .attr('x', 1)
            .style('fill', function(d, i) {
                var gradient = gradients[i];
                if (typeof gradient !== "undefined") return "url(#gradient)";
                else {
                    console.log(i, lostCounts[i], wonCounts[i]);
                    return '#000000';
                }
            })
            .attr('transform', function(d) {                
                var count = 0;
                data.forEach(function(element) {
                    var term = parseFloat(element['Term in Months']);
                    if (!isNaN(term) && term >= d.x0 && term < d.x1) {
                        count++;
                    }
                })
                return "translate(" + x(d.x0) + "," + (h - count) + ")";
            })
            .attr('width', function(d) {
                return x(d.x1) - x(d.x0 -1);
            })            
            .attr("height", function(d) {
                var count = 0;
                console.log(d);
                data.forEach(function(element) {
                    var term = parseFloat(element['Term in Months']);
                    if (!isNaN(term) && term >= d.x0 && term < d.x1) {
                        count++;
                    }
                })
                return count; 
            });
        // add the x Axis
        svg.append("g")
          .attr("transform", "translate(2," + h + ")")
          .call(d3.axisBottom(x)
               .ticks(10, "s"));

        // add the y Axis
        svg.append("g")
          .call(d3.axisLeft(y));
        
       /* var maxYScale = d3.max(data, function(d) {
            return parseFloat(d['Network Proximity']); 
        })+1;
        var yScale = d3.scale.linear()
            .domain([0, maxYScale])
            .range([h - yOffset - margin, margin]);
        
        // Specify the axis scale and general position
        var xAxis = d3.svg.axis()
                          .scale(xScale)
                          .orient("bottom")
                          .bins(6);
        // Add a graphics element to hold the axis we created above (xAxis)
        var xAxisG = svg.append('g')
                        .attr('class', 'axis')
                        .attr('transform', 'translate(0, ' + (h - yOffset) + ')')
                        .call(xAxis);
        // Repeat for the y-axis
        var yAxis = d3.svg.axis()
                          .scale(yScale)
                          .orient("left")
                          .ticks(6);
        var yAxisG = svg.append('g')
                        .attr('class', 'axis')
                        .attr('transform', 'translate(' + xOffset + ', 0)')
                        .call(yAxis);*/
        
        var vals = new Array(2);
        vals[0] = 'Accounts Lost';
        vals[1] = 'Accounts Won';
        var legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .attr('transform', "translate(0,0)")
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
                
    });
}