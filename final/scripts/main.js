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
        streamgraph = new Streamgraph(d3.select("#streamgraph"), newdata);

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
    console.log(query);
    changeNation(query);

    var sunFormat = getSunFormat(dat.filter(d => { return d.Region == curRegion; }));
    console.log("Sunburst Update for Treemap");
    treemap = new Treemap(d3.select("#treemap"), dat.filter(d => { return d.Region == curRegion; }), treemapUpdate);
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
    artistQuery = ""
    console.log(start + "; " + end);
    var newDat = dat.filter(d => { return new Date(d.Date) > start && new Date(d.Date) < end; });
    var sunFormat = getSunFormat(newDat);

    console.log("Time Update for Sunburst");
    updateSunburstChart(sunFormat);
    console.log("Time Update for Treemap");
    treemap = new Treemap(d3.select("#treemap"), newDat, treemapUpdate);
    streamgraph = new Streamgraph(d3.select("#streamgraph"), newDat);
    // some streamgraph shit

}

function streamgraphUpdate(value) {
    // wait fuck this there's nothing to do with this
}

function reset() {
    location.reload();
}

drawSunMap();   //map should not be changed and is only affected by sunburst but must be declared globally bc this method is a bitch to work with