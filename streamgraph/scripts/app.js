var app = (function () {
    'use strict';

    var width = 200,
        height = 500,
        globalData = [];

    var filePathMapping = {
        filtered: './data/filteredData.csv',
        global: './data/global.csv'
    };

    function init(dataIndicator) {
        d3.csv(filePathMapping[dataIndicator], updateData);
    }

    function updateData(data) {
        console.log(data);
        StreamGraph.draw(data,'orange');
        
    }


    function updateStats(item) {
        init(item);
    }

    return {
        updateStats: updateStats
    };
})();

app.updateStats('global');
