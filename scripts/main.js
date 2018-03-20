console.log('Hello from main.js');

d3.selectAll("text").attr("fill", "white");

var curRegion = "global";

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

        var treemap = new Treemap(d3.select("#treemap"), newdata, function() {});
        var sunburst = new drawRawSunData(alert);
        //StreamGraph.draw(data, 'orange');
        var time = new timeBrush(data, curRegion, console.log("updatefunc"));

        // var sunburstChart = new SunburstChart(d3.select(".vis1"), data, function() {});
        // var parallelChart = new ParallelChart(d3.select(".vis3"), data, function() {
        //     barChart.update(parallelChart.newData);
        //     sunburstChart.update(parallelChart.newData,[]);
        // });
});

function sunburstUpdate(query) {
    // update just like map
    // change region for streamgraph and treemap
}

function treemapUpdate(genre) {
    // update streamgraph
}

function timeUpdate(start, end) {
    // update streamgraph, treemap, and sunburst to show only data from that timerange
}

function streamgraphUpdate(value) {
    // wait fuck this there's nothing to do with this
}