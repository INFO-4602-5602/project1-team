var opportunities = [];
var opportunities_loaded = false;

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
load_csv('ZayoHackathonData_Opportunities.csv');

function main_code() {
    $("#StackedBars").html(opportunities[0]);
}