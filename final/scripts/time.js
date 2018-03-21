function timeBrush(dIn, rIn, func) {

    var margin = {top: 0, right: 50, bottom: 50, left: 10},
        width = (innerWidth - margin.left - margin.right)*0.60,
        height = (innerHeight - margin.top - margin.bottom)*0.05;

    var x = d3.scaleTime().rangeRound([0, width]);

    var parseDate = d3.timeParse("%m/%d/%y");

    var svg = d3.select("#time").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    this.update = function(dataIn, regionIn) {
        svg.selectAll("*").remove();

        x.domain(d3.extent(dataIn.filter(d => d.Region == regionIn), function(d) { return new Date(d.Date); }));

        svg.append("g")
            .attr("class", "timetick")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .ticks(d3.timeMonth)
                .tickSize(-height)
                .tickFormat(function() { return null; }));

        svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
                .ticks(d3.timeMonth)
                .tickPadding(0))
            .attr("text-anchor", null)
            .selectAll("text")
            .attr("x", 6);

        svg.append("g")
            .attr("class", "brush")
            .call(d3.brushX()
                .extent([[0, 0], [width, height]])
                .on("end", brushended));

        svg.append("text")             
            .attr("transform",
                    "translate(" + (width/2) + " ," + 
                                (height+25) + ")")
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .attr("fill", "#fff")
            .text("Click and drag above to change the timeframe"); 
    }

    this.update(dIn, rIn);

    function brushended() {
        if (!d3.event.sourceEvent) return; // Only transition after input.
        if (!d3.event.selection) return; // Ignore empty selections.
        var d0 = d3.event.selection.map(x.invert),
            d1 = d0.map(d3.timeDay.round);
        
        // If empty when rounded, use floor & ceil instead.
        if (d1[0] >= d1[1]) {
            d1[0] = d3.timeDay.floor(d0[0]);
            d1[1] = d3.timeDay.offset(d1[0]);
        }
        func(d1[0], d1[1]);
        d3.select(this).transition().call(d3.event.target.move, d1.map(x));
    }
}