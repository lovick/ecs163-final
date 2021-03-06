var sunTable = new Array, sunQuery = "table";  //default has all available countries, all available songs
var mapSVG, artistQuery = "";
var keys =  ["Philippines", "United States", "Germany", "Brazil", "Sweden", "Mexico",
    "Spain", "Netherlands", "United Kingdom", "Australia", "Global", "Unselected"];
var skeys = ["ph", "us", "de", "br", "se", "mx", "es", "nl", "gb", "au", "global", "table"];

var sunburstUpdate;
var sunMapColors = ["#5db1f6",
    "#316799",
    "#656e74"];

function drawRawSunData(datIn, func){
    //console.log(func);
    sunburstUpdate = func;
    var rawSunData = transformToSunburst(datIn);

    //initialize chart
    sunTable = {"name": "table", "children": rawSunData};
    changeSunQueryLabel(0);
    updateSunburstChart(sunTable);
}


function transformToSunburst(data) {
    var rawDat = new Array;
    //console.log(data);
    data.forEach(function (d){
        var date = d["Date"];

        //check if region already exists in rawData else make a new one
        var region = d["Region"];

        if (region.length <= 2 || region == "global"){
            //console.log(region);

            var exists = doesRegionAlreadyExist(region);
            //console.log(exists);
            //check if region exists in region
            if (exists < 0){
                var newArtistList = new Array;
                var newRegion = {
                    name: region,
                    children: newArtistList
                };
                rawDat.push(newRegion);
                exists = rawDat.length - 1;
            }
            var artist = d["Artist"];

            //check if region exists in region
            var exists2 = doesArtistAlreadyExist(artist,rawDat[exists].children);
            if (exists2 < 0){
                var newSongList = new Array;
                var newRegion = {
                    name: artist,
                    children: newSongList,
                    streams: parseInt(d["Streams"])
                };
                rawDat[exists].children.push(newRegion);
                //exists2 = rawSunData[exists].children.length - 1;
            } else {
                rawDat[exists].children[exists2].streams += parseInt(d["Streams"]);
            }

            //check if song exists in region's songlist and add to streamcount else new song
            /*
            var gotSong = doesSongAlreadyExist(d["Track Name"], rawSunData[exists].children[exists2].children);
            if (gotSong < 0){
                var song = {
                    name: d["Track Name"],
                    artist: d["Artist"],
                    streams: parseInt(d["Streams"]),
                    region: d["Region"]
                };
                rawSunData[exists].children[exists2].children.push(song);
            } else {
                rawSunData[exists].children[exists2].children[gotSong].streams += parseInt(d["Streams"]);
            }*/
        }
    });

    function doesRegionAlreadyExist(regionName){
        for (var i = 0; i < rawDat.length; i++){
            if (rawDat[i].name == regionName){
                return i;
            }
        }
        return -1;
    }
    function doesArtistAlreadyExist(artistName, artistList){
        for (var i = 0; i < artistList.length; i++){
            if (artistList[i].name == artistName){
                return i;
            }
        }
        return -1;
    }
    function doesSongAlreadyExist(songName, songList){
        for (var i = 0; i < songList.length; i++){
            if (songList[i].name == songName){
                return i;
            }
        }
        return -1;
    }
    function isPartOfQuery(name){
        if (sunQuery == ""){
            return true;
        } else {
            return (sunQuery == name);
        }
    }

    return rawDat;
}

function updateSunburstChart(table){
    showLoading();
    //remove any existing charts
    clearChildren(document.getElementById("v1"));

    var width = innerWidth*0.33,
        height = innerHeight*0.45,
        radius = (Math.min(width, height)/2 ) - 10;
    var color = d3.scaleOrdinal(d3.schemeCategory20b),
        x = d3.scaleLinear().range([0, 2 * Math.PI]),
        y = d3.scaleSqrt().range([0, radius]),
        formatNumber = d3.format(",d");

    //add svg to div container
    var svg = d3.select("#v1").append("svg").attr("width", width).attr("height", height)
        .append("g")
        .attr("transform", "translate(" + (width/2) + "," + (height/2) + ")");

    //reference : https://bl.ocks.org/mbostock/4348373
    var partition = d3.partition(); //.size([2 * Math.PI, radius]);
    var root = d3.hierarchy(table);
    root.sum(function(d){ return d.streams; });
    partition(root);

    //draw arc in designated area
    var arc = d3.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

    //add data arcs to svg and make interactive
    svg.selectAll("path")
        .data(partition(root).descendants())
        .enter().append("g")
        .attr("class", "node").append("path")
        .attr("d", arc)
        .style("stroke", "#001514")
        .style("fill", function(d){ return color((d.children ? d: d.parent).data.name); })
        .on("click", clickSun)
        .on("mouseover", function(d){
            if (d.depth < 2){
                d3.select(this).style("cursor", "pointer");
            }
        })
        .on("mouseout", function(d){
            d3.select(this).style("cursor", "default");
        })
        .append("svg:title")
        .text(function(d){
            var s;
            if (d.depth <= 1){
                if (d.depth == 1){
                    var keys =  ["Philippines", "USA", "Germany", "Brazil", "Sweden", "Mexico",
                        "Spain", "Netherlands", "Great Britain", "Australia", "Global", "Unselected"];
                    var skeys = ["ph", "us", "de", "br", "se", "mx", "es", "nl", "gb", "au", "global", "table"];
                    s = keys[skeys.indexOf(d.data.name)];
                } else {
                    s = d.data.name;
                }
            } else {
                s = d.data.name
                    + "\n(" + formatNumber(d.data.streams) + " streams)";
            }
            return s;
        });
    

    //add preliminary text labels for countries only
    svg.selectAll(".node")
        .append("text")
        .attr("fill", function(d){
            return "#fff";
        })
        .attr("transform", function(d){
            var angle = (d.x0 + d.x1)/Math.PI * 90;
            var realAngle;
            if (angle < 90 || angle > 270){
                realAngle = angle;
            } else {
                realAngle = angle + 180;
            }
            return "translate(" + arc.centroid(d) + ") rotate (" + realAngle + ")";
        })
        .attr("dx", "-10")
        .attr("dy", ".2em")
        .text(function(d){
            if (d.data.name == sunQuery && sunQuery != "table"){
                transitionSun(d);
            }
            if (d.depth > 1){
                return "";
            } else {
                if (d.parent){
                    return (d.data.name).toUpperCase();
                } else {
                    return "";
                }
            }
        });


    //function for change in query behavior upon interaction
    function clickSun(d){
        if (d.depth > 2){
            return;
        } else if (d.depth < 1){
            sunQuery = "table";
            artistQuery = "";
            changeSunQueryLabel(0);
        } else if (d.depth == 1) {
            if (d.data.name != sunQuery){
                sunQuery = d.data.name;
                artistQuery = "";
            } else if (artistQuery.length > 0){
                sunQuery = d.data.name;
                artistQuery = "";
            } else {
                sunQuery = "table";
                artistQuery = "";
            }
            changeSunQueryLabel(0);
        } else if (d.depth == 2){
            console.log(d.data.name);
            if (d.data.name != artistQuery){
                sunQuery = d.parent.data.name;
                artistQuery = d.data.name;
                changeSunQueryLabel(formatNumber(d.data.streams));
            }
        }
        transitionSun(d);
        //console.log(sunQuery);
        sunburstUpdate(sunQuery);
    }
    function transitionSun(d){
        svg.transition()
            .duration(750)
            .tween("scale", function() {
                var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                    yd = d3.interpolate(y.domain(), [d.y0, 1]),
                    yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
                return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
            })
            .selectAll("path")
            .attrTween("d", function(d) { return function() { return arc(d); }; });
    }

    //showSunBurst();
    setTimeout(showSunBurst, 1000);
}

//take out loading screens and display vis
function showSunBurst(){
    document.getElementById("loader").style.display = "none";
    document.getElementById("v1").style.display = "block";
    document.getElementById("v1_label").style.display = "block";
    document.getElementById("v1_query").style.display = "block";
}

//take out previous vis and display loading
function showLoading(){
    document.getElementById("v1").style.display = "none";
    if (document.getElementById("v1_label") != null){
        document.getElementById("v1_label").style.display = "none";
    }
    document.getElementById("v1_query").style.display = "none";
    document.getElementById("loader").style.display = "block";
}

//erase children in an element to make room for new ones
function clearChildren(element){
    while (element.firstChild){
        element.removeChild(element.firstChild);
    }
}

//change labels indicating query
function changeSunQueryLabel(streamcount){
    var p = document.getElementById("v1_query");
    clearChildren(p);
    var keys =  ["Philippines", "USA", "Germany", "Brazil", "Sweden", "Mexico",
                "Spain", "Netherlands", "Great Britain", "Australia", "Global", "Unselected"];
    var skeys = ["ph", "us", "de", "br", "se", "mx", "es", "nl", "gb", "au", "global", "table"];
    var string = keys[skeys.indexOf(sunQuery)];
    if (artistQuery.length > 0){
        string += " > " + artistQuery + " (" + streamcount + " streams)";
    }

    var text = document.createElement("p");
    var text2 = document.createTextNode(string);
    text.appendChild(text2);
    p.appendChild(text);
    //changeNation(sunQuery);  
}

//draw map to show which has been selected
var arr = [];
var countries;
function drawSunMap(){
    var width = innerWidth*0.45,
        height = innerHeight*0.35;

    var projection = d3.geoKavrayskiy7().scale(100)
        .translate([width / 2, height / 2]).precision(.1);

    var path = d3.geoPath().projection(projection);

    d3.select("#sunmap").append("p")
            .style("position", "relative")
            .style("margin-top", '0px')
            .style("left", innerWidth*.20 + "px")
            // .style("bottom", "50px")
            .attr("text-align", "center")
            .text("Selected Region");

    var svg = d3.select("#sunmap").append("svg")
        .attr("width", width)
        .attr("height", height);

    //draw map data given topojson
    queue()
        .defer(d3.json, "./world-110m.json")
        .defer(d3.tsv, "./world-country-names.tsv")
        .await(ready);

    function ready(error, world, names) {
        if (error) throw error;

        countries = topojson.feature(world, world.objects.countries).features;

        //bind names to countries
        arr=[];
        names.forEach(function(i){
            //console.log(i.name);
            arr[i.id]=i.name;
        });

        //draw the countries from topojson data
        svg.selectAll(".country")
            .data(countries)
            .enter().insert("path", ".graticule")
            .attr("class", "suncountry")
            .attr("d", path)
            .style("fill", function(d) {
                var n = arr[d.id];
                var sq = keys[skeys.indexOf(sunQuery)];
                if (keys.indexOf(n) >= 0){
                    if (sq == n){
                        return sunMapColors[0];
                    }
                    return  sunMapColors[1];
                } else {
                    return  sunMapColors[2];
                }
            })
            /*.on("click", function(d, i) {
                console.log("Clicking in map");
                var n = arr[d.id];
                var sq = keys[skeys.indexOf(d.id)];
                if (keys.indexOf(n) != -1) {
                    sunQuery = skeys[keys.indexOf(n)];
                } else {
                    sunQuery = "global";
                }
                artistQuery = "";
                sunburstUpdate(sunQuery);
            })*/
            ;

        svg.insert("path", ".graticule")
            .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
            .attr("class", "boundary")
            .attr("d", path);
    }
}

//changes map color according to selection
function changeNation(nat){
    d3.select("#sunmap").selectAll(".suncountry")
        .style("fill", function(d, i){
            if (nat == "global"){
                return  sunMapColors[0];
            }   //colors all countries if global is chosen

            var n = arr[d.id];
            var sq = keys[skeys.indexOf(nat)];
            if (keys.indexOf(n) >= 0){
                if (sq == n){
                    return  sunMapColors[0];
                }
                return  sunMapColors[1];
            } else {
                return  sunMapColors[2];
            }
        })
}