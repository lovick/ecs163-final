console.log('Hello from main.js');

d3.selectAll("text").attr("fill", "white");

var curRegion = "global";

var treemap;
var sunburst;
var time;
var dat;

d3.csv('dataWithGenres.csv',
    function(datum){ 
        // get all of our data into the requisite format first
        return {
            "Position" : +datum["Position"],
            "Track" : datum["Track Name"],
            "Artist" : datum["Artist"], 
            "Streams" : +datum["Streams"],
            "URL" : datum["URL"], 
            "Date" : datum["Date"],
            "Region" : datum["Region"],
            "trackID" : datum["trackID"],
            "genre" : datum['genre']
        };
    }, function(data) {

        var newdata = data.filter(val => {return val.Region == "global"; });

        treemap = new Treemap(d3.select("#treemap"), newdata, treemapUpdate);
        sunburst = new drawRawSunData(data, sunburstUpdate);
        //StreamGraph.draw(data, 'orange');
        time = new timeBrush(data, curRegion, timeUpdate);

        // var sunburstChart = new SunburstChart(d3.select(".vis1"), data, function() {});
        // var parallelChart = new ParallelChart(d3.select(".vis3"), data, function() {
        //     barChart.update(parallelChart.newData);
        //     sunburstChart.update(parallelChart.newData,[]);
        // });
        dat = data;
});

var parseDate = d3.timeParse("%m/%d/%y");

function sunburstUpdate(query) {
    // update just like map
    // change region for streamgraph and treemap
}

function treemapUpdate(genre) {
    // update streamgraph
    console.log(genre);
}

function timeUpdate(start, end) {
    // update streamgraph, treemap, and sunburst to show only data from that timerange
    console.log(start + "; " + end);
    var newDat = dat.filter(d => {return new Date(d.Date) > start && new Date(d.Date) < end});
    var sunFormat = {"name": "table", "children": transformToSunburst(newDat)};
    updateSunburstChart(sunFormat);
}

function streamgraphUpdate(value) {
    // wait fuck this there's nothing to do with this
}