const Highcharts = require('highcharts');

Highcharts.setOptions({
    lang: {
        downloadData: 'Download data file'
    }
});
export let zoomMsg = 'Click and drag in the plot area to zoom in';

export let getExportingStructure = function(urlToFile, content) {
    return {
        buttons: {
            contextButton: {
                menuItems: [
                    {
                        textKey: 'downloadData',
                        onclick: function() {
                            if (typeof content === 'undefined') {
                                window.location = urlToFile;
                            } else {
                                let element = document.createElement('a');
                                element.setAttribute('href', 'data:text/plain;charset=utf-8,' +
                                    encodeURIComponent(content));
                                element.setAttribute('download', urlToFile);

                                element.style.display = 'none';
                                document.body.appendChild(element);

                                element.click();

                                document.body.removeChild(element);
                            }
                        }
                    }, {
                        separator: true
                    }, {
                        textKey: 'printChart',
                        onclick: function() {
                            this.print();
                        }
                    }, {
                        separator: true
                    }, {
                        textKey: 'downloadPNG',
                        onclick: function() {
                            this.exportChart({
                                width: 1200,
                                filename: 'sq_sum_bar_chart'// externalRunId need to be added to the model - NOTE the name is common between QC and Functional
                            });
                        }
                    }, {
                        textKey: 'downloadJPEG',
                        onclick: function() {
                            this.exportChart({
                                width: 1200,
                                filename: 'sq_sum_bar_chart', // externalRunId need to be added to the model - NOTE the name is common between QC and Functional
                                type: 'image/jpeg'
                            });
                        }
                    }, {
                        textKey: 'downloadPDF',
                        onclick: function() {
                            this.exportChart({
                                filename: 'sq_sum_bar_chart', // externalRunId need to be added to the model - NOTE the name is common between QC and Functional
                                type: 'application/pdf'
                            });
                        }
                    }, {
                        textKey: 'downloadSVG',
                        onclick: function() {
                            this.exportChart({
                                filename: 'sq_sum_bar_chart', // externalRunId need to be added to the model - NOTE the name is common between QC and Functional
                                type: 'image/svg+xml'
                            });
                        }
                    }]
            }
        }
    };
};
