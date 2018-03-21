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

function getSunFormat(newDat) {
    return {"name": "table", "children": transformToSunburst(newDat)};
}

function sunburstUpdate(query) {
    // update just like map
    // change region for streamgraph and treemap
    // change curRegion
    
}

function treemapUpdate(genre) {
    // update streamgraph and sunburst
    console.log(genre);
    var sunFormat = getSunFormat(dat.filter(d => { return d.genre == genre; }));
    
    console.log("Treemap Update Sunburst");
    updateSunburstChart(sunFormat);
}

function timeUpdate(start, end) {
    // update streamgraph, treemap, and sunburst to show only data from that timerange
    console.log(start + "; " + end);
    var sunFormat = getSunFormat(dat.filter(d => { return new Date(d.Date) > start && new Date(d.Date) < end; }));

    console.log("Time Update for Sunburst");
    updateSunburstChart(sunFormat);
    console.log("Time Update for Treemap");
    treemap = new Treemap(d3.select("#treemap"), newDat.filter(d => { return d.Region == curRegion; }), treemapUpdate);
    // some streamgraph shit

}

function streamgraphUpdate(value) {
    // wait fuck this there's nothing to do with this
}