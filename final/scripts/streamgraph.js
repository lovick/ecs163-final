function Streamgraph(container, data) {

    var margin = {
        top: 50,
        right: 50,
        bottom: 30,
        left: 80
    };

    var top50data = d3.nest().key(function(d){
                    return d.Track;
                  })
                  .rollup(function(leaves){
                        return d3.sum(leaves, function(d) {return (d.Streams)});
                    })
                  .entries(data)

    top50data.sort(function(x, y){
        return d3.descending(x.value, y.value);
    })

    //console.log(newdata);
    var top50data = top50data.slice(0, 50);

    top50 = []
    top50data.forEach(function(item, index) {
        top50.push(item.key);
    });

    filtered_data = data.filter(val => {return top50.includes(val.Track); });

    var newdata = d3.nest().key(function(d){
                    // return d.genre;
                    return d.Track;
                  })
                    .key(function(d){
                    return d.Date;
                  })
                  .rollup(function(leaves){
                        return d3.sum(leaves, function(d) {return (d.Streams)});
                    })
                  .entries(data)
    console.log(newdata);

    //x.domain(d3.extent(dataIn.filter(d => d.Region == regionIn), function(d) { return new Date(d.Date); }));
    var range = d3.extent(newdata, function(d) { return new Date(d.Date); });

    newdata.forEach(function(item, index) {

    	var start_date = range[0];
    	var end_date = range[1];

		var day;
    	while(start_date <= end_date) { 
    		export_date = (start_date.getMonth()+1)+'/'+start_date.getDate()+'/'+start_date.getFullYear();
    		day = start_date.getDate()
    		start_date = new Date(start_date.setDate(++day));
    		var found = item.values.find(function(element) {
  				return element.key === export_date;
			}) 
			if (!found) {
	    		item.values.push({key:export_date, value:0});
    		}
		}
    });

    var result = d3.nest()
        .key(function(d) {
            return d.Date;
        })
        .key(function(d){
                    return d.Track;
                  })
        .rollup(function(leaves){
                        return d3.sum(leaves, function(d) {return (d.Position)});
                    })
        .entries(filtered_data);

    // console.log(result);

    result.forEach(function(item, index) {
        var list50 = top50.slice(0);
        item.values.forEach(function(item2, index2){
            item2.value = 51-item2.value;
            if(list50.includes(item2.key)){
                list50.splice(list50.indexOf(item2.key), 1);
            }
        });
        for(var artist of list50) {
            item.values.push({key:artist, value:0});
        }
    });

    // console.log(result);

    result.sort(function(a,b){
    return new Date(a.key) - new Date(b.key);
    });


    var result2 = []
    result.forEach(function(item, index) {
        var obj = {date: new Date(item.key)};
        item.values.forEach(function(item, i) {
            obj[item.key] = item.value;
        });
        result2.push(obj);
    });

    // console.log(result2);

    var stack = d3.stack()
    .keys(top50)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetWiggle);

    // console.log(data);
    var series = stack(result2);
    // console.log(series);

    var width = innerWidth*0.57,
    height = innerHeight*0.5;

    var x = d3.scaleTime()
        .domain(d3.extent(result2, function(d){ return d.date; }))
        .range([0, width]);

    // setup axis
    var xAxis = d3.axisBottom(x);

    var max = d3.max(series, function(layer) { return d3.max(layer, function(d){ return d[0] + d[1];}); });
    var y = d3.scaleLinear()
        .domain([-max, d3.max(series, function(layer) { return d3.max(layer, function(d){ return d[0] + d[1];}); })])
        .range([height, 0]);

    var color = d3.scaleOrdinal().range(d3.schemeCategory20c);

    var area = d3.area()
        .x(function(d) { return x(d.data.date); })
        .y0(function(d) { return y(d[0]); })
        .y1(function(d) { return y(d[1]); })
        .curve(d3.curveBasis);

    container.selectAll("*").remove();

    var svg = container.append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.selectAll("path")
        .data(series)
        .enter().append("path")
        .attr("d", area)
        .style("fill", function() { return color(Math.random()); })
        .text("test")
        ;

    svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + (height) + ")")
                .call(xAxis); 

                svg.selectAll("path")
                .attr("opacity", 1)
                .on("mouseover", mouseOverArc)
                .on("mousemove", mouseMoveArc)
                .on("mouseout", mouseOutArc);
    
                var tooltip = d3.select("#tooltip")
    
                function mouseOverArc(d, i) {
    
                        svg.selectAll("path").transition()
                        .duration(250)
                        .attr("opacity", function (d, j) {
                            return j != i ? 0.6 : 1;
                        })
                        // d3.select(this).attr("stroke","black")
                         mousex = d3.mouse(this);
                         mousex = mousex[0];
                        var invertedx = x.invert(mousex);
                //     // invertedx = invertedx.getMonth() + invertedx.getDate();
                        invertedx = (invertedx.getMonth()+1)+'/'+invertedx.getDate()+'/'+invertedx.getFullYear();
    
                      tooltip.style("visibility", "visible");
                      tooltip.html(d.key + '\n' + invertedx);
                      // tooltip.html(d.key + "<br>" + invertedx);
                      return tooltip.transition()
                        .duration(50)
                        .style("opacity", 0.9);
                    }
    
                function mouseOutArc(){
                    d3.select(this).attr("stroke","")
                    svg.selectAll("path").transition()
                        .duration(250)
                        .attr("opacity", 1)
                    return tooltip.style("visibility", "hidden");
                }
    
                function mouseMoveArc (d) {
    
                        mousex = d3.mouse(this);
                         mousex = mousex[0];
                        var invertedx = x.invert(mousex);
                //     // invertedx = invertedx.getMonth() + invertedx.getDate();
                        invertedx = (invertedx.getMonth()+1)+'/'+invertedx.getDate()+'/'+invertedx.getFullYear();
    
    
                      tooltip.style("visibility", "visible");
                      tooltip.html(d.key + '\n' + invertedx);
    
                          return tooltip
                            .style("top", (d3.event.pageY-10)+"px")
                            .style("left", (d3.event.pageX+10)+"px");
                }
   container.append("p")
            .style("position", "relative")
            .style("margin-top", '0px')
            .style("text-align", 'center')
            .style("bottom", '45px')
            .text("Top 50 Songs by Region Yearly Performance");
}