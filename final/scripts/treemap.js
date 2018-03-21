function Treemap(container, data, updateFunc) {

    var margin = {
        top: 50,
        right: 50,
        bottom: 30,
        left: 80
    };

    // get the bounding box of our container
    // var boundingBox = container.node().getBoundingClientRect();

    // // set our width and height based on the container's bounding box
    // var bwidth = boundingBox.width;
    // var bheight = boundingBox.height;

    // // height and width of our chart
    // var width = bwidth - margin.left - margin.right ;
    // var height = bheight - margin.top - margin.bottom;

    // // create our SVG canvas and give it the height and width we want
    // var svg = container.append('svg')
    //     .attr('width', width)
    //     .attr('height', height);

    // var radius = Math.min(width, height) / 2;
    // // var color = d3.scaleOrdinal(d3.schemeCategory20b);
    // var color = d3.scaleOrdinal(['#386FA4', '#59A5D8','#62BCE5','#8ECEDB']);

    // var g = svg.append("g")
    //     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    data.forEach(function(part, index, theArray) {
        if(theArray[index].genre == 'dance pop' || theArray[index].genre == 'canadian pop'){
            theArray[index].genre = "pop";
        }
    });

    // console.log(data);
    var newdata = d3.nest().key(function(d){
                    // return d.genre;
                    return d.trackID;
                  })
                    .key(function(d){
                    return d.genre;
                  })
                    .key(function(d){
                    return d.Artist;
                  })
                  .rollup(function(leaves){
                        return d3.sum(leaves, function(d) {return (d.Streams)});
                    })
                  .entries(data)

    newdata.sort(function(x, y){
        return d3.descending(x.value, y.value);
    })

    // console.log(newdata);
    var top50 = newdata.slice(0, 50);
    // console.log(top50);

    var result = []
    top50.forEach(function(item, index) {
      result.push({trackID : item.key, genre: item.values[0].key, artist: item.values[0].values[0].key, streams: item.values[0].values[0].value})
    });

    // console.log(result);

    result = {"name" : "genres", "children" : d3.nest().key(function(d){
                    return d.genre;
                  })
                  .key(function(d){
                    return d.artist;
                  })
                  .rollup(function(leaves){
                        return d3.sum(leaves, function(d) {return (d.streams)});
                    })
                  .entries(result)
                  .map(function(group) {
                    return {
                      name: group.key,
                      children: group.values
                    }})
                };
    console.log(result);

    var margin = {top: 40, right: 10, bottom: 10, left: 10},
      width = (innerWidth - margin.left - margin.right) * 0.45,
      height = (innerHeight - margin.top - margin.bottom) * 0.5,
      color = d3.scaleOrdinal().range(d3.schemeCategory20c);

    container.selectAll("*").remove();
    var div = container.append("div")
            .style("position", "relative")
            .style("width", (width + margin.left + margin.right) + "px")
            .style("height", (height + margin.top + margin.bottom) + "px")
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");

    var treemap = d3.treemap()
        .size([width, height]);

    var root = d3.hierarchy(result, (d) => d.children)
        .sum((d) => d.value);


    var treemap = treemap(root);
        // console.log(treemap.leaves());
     
    var node = div.datum(result).selectAll(".node")
          .data(treemap.leaves())
          .enter().append("div")
          .attr("class", "node")
          .style("left", (d) => d.x0 + "px")
          .style("top", (d) => d.y0 + "px")
          .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
          .style("height", (d) => Math.max(0, d.y1 - d.y0  - 1) + "px")
          .style("background", (d) => color(d.parent.data.name))
          .text((d) => d.data.key)
          .on("click", function(d) {
            updateFunc(d);
          });
          // .append('div')
          // .style("font-size", function(d) {
          //     // compute font size based on sqrt(area)
          //     return Math.max(20, 0.18*Math.sqrt(d.area))+'px'; })
          // .text(function(d) { return d.children ? null : d.name; });
     
    var svg = div.append('svg')
    .attr('width', width + 200)
    .attr('height', height).append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(' + width + ', ' + 30 + ')');

    // legend title
    svg.append('text')
        .style('font-weight', 'bold')
        .attr('x', 10)
        .attr('y', -10)
        .text('Legend');


    var legend = [];
    result.children.forEach(function(part, index, theArray) {
        legend.push(theArray[index].name);
    });

    // create g for each legend item
    var legendItem = svg.selectAll('.legend-item')
        .data(legend).enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', function (d, i) {
            return 'translate(10,' + i * 25 + ')'
        });

    // legend rectangle
    legendItem.append('rect')
        .attr('width', 20)
        .attr('height', 20)
        .style('fill', function (d) {
            return color(d)
        });

    // legend text
    legendItem.append('text')
        .attr('x', 25)
        .attr('y', 15).text(function (d) {
        return d;
    });

}