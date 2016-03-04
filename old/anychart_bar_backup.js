define( ["jquery", "./anychart-bundle.min", "js/qlik"], function ( $, anychart, qlik ) {'use strict';

	return {
		initialProperties: {
			version: 1.0,
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 2,
					qHeight: 50
				}]
			}
		},
		//property panel
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimensions: {
					uses: "dimensions",
					min: 1,
					max: 1
				},
				measures: {
					uses: "measures",
					min: 1,
					max: 1
				},
				sorting: {
					uses: "sorting"
				},
				settings: {
					uses: "settings"
				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},

		paint: function ( $element, layout ) {

		
			// get qMatrix data array
			var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
			// create a new array that contains the measure labels
			var measureLabels = layout.qHyperCube.qMeasureInfo.map(function(d) {
				return d.qFallbackTitle;
			});
			// Create a new array for our extension with a row for each row in the qMatrix
			var data = qMatrix.map(function(d) {
				// for each element in the matrix, create a new object that has a property
				// for the grouping dimension, the first metric, and the second metric
				return {
					"Dim1":d[0].qText,
					"Metric1":d[1].qNum
				}
			});
			
			var dimensions = layout.qHyperCube.qDimensionInfo;
			
			// Chart object width
			var width = $element.width();
			// Chart object height
			var height = $element.height();
			//console.log(height);
			//console.log($("#container").height());
			// Chart object id
			var id = "container";//"container_" + layout.qInfo.qId;
			// Check to see if the chart element has already been created
			if (document.getElementById(id)) {
				// if it has been created, empty it's contents so we can redraw it
				$("#" + id).empty().width(width).height(height);
			}
			else {
				// if it hasn't been created, create it with the appropriate id and size
				//$element.append($('<div />').attr("id", id).width(width).height(height));
				$element.append($('<div />').attr("id", "container").width(width).height(height));
			}
			
			var app = qlik.currApp();
			// Call our visualization function
			console.log(layout);
			viz(app,data,dimensions,layout);

			//console.log(dimensions);
		}
	};

} );


var viz = function(app,data,dimensions,layout) {

var selvalues = [];

//anychart.onDocumentReady(function() {

// create column chart
chart = anychart.column();

// turn on chart animation
chart.animation(true);

// set container id for the chart
chart.container('container');

// set chart title text settings
chart.title('Qlik Bar Chart - Using AnyChart');

// create area series with passed data
//var series = data;

var myData = [];
$.each(data, function(index, value) {
	var myObject = new Object();
	myObject.x = data[index].Dim1;
	myObject.value = data[index].Metric1;
	myData.push(myObject);
});

//console.log(seriesObj.point);

var dataSet = anychart.data.set(myData);

//var series = chart.column(seriesObj.point);
var series = chart.column(dataSet);

  // series.fill("Gold");
   series.hoverStroke("#031c31", 2);
  // series.stroke("#56561a", 4);
  // series.hatchFill("diagonalbrick", "gray");
  // series.hoverHatchFill("diagonalbrick", "darkred");

// set series tooltip settings
// series.tooltip().titleFormatter(function() {
    // return this.x
// });
// series.tooltip().textFormatter(function() {
    // return '$' + parseInt(this.value).toLocaleString()
// });
// series.tooltip().position('top').anchor('bottom').offsetX(0).offsetY(5);

// set scale minimum
chart.yScale().minimum(0);

// set yAxis labels formatter
chart.yAxis().labels().textFormatter(function(){
    return this.value.toLocaleString();
});

chart.tooltip().positionMode('point');
chart.interactivity().hoverMode('byX');

chart.xAxis().title(dimensions[0].qFallbackTitle);
chart.yAxis().title(layout.qHyperCube.qMeasureInfo[0].qFallbackTitle);

// initiate chart drawing
chart.draw();

// add a listener
chart.listen("pointClick", function(e) {

	var index = e.point.getIndex();
	var row = dataSet.row(index);
	
	//console.log(row[0]);
	
	selvalues.push(row[0]);
	selvalues = $.unique(selvalues);
	//console.log(selvalues);
	
	if(row.fillOld) {
		//console.log("if(row.fillOld)");
		row.fill = row.fillOld;
		delete row.fillOld;
	}
	else {
		//console.log(row);
		row.fillOld = row.fill;
		row.fill = "#f6ee64";
		//series.fill("#f6ee64");
		//row.stroke = ("#031c31", 2);
		//console.log(row);
	}
	//console.log(dataSet);
	dataSet.row(index, row);
	//console.log(dataSet);
	//console.log(series);
	
	if (document.getElementById("selectBox")) {
		// if it has been created, empty it's contents so we can redraw it
		//$("#selectBox").empty();
	}
	else {
		$("#container").append('<div id="selectBox" style=position:absolute;top:10px;right:10px;height:30px;width:45px;z-index:10000;border:1px;></div>');
		$("#selectBox").append(
		'<button id="confirmSelect" tid="selection-toolbar.refresh" qva-activate="buttonAction($event, button)" q-title-translation="Tooltip.ConfirmSelections" ng-disabled="buttonIsDisabled(button)" class="sel-toolbar-btn sel-toolbar-confirm" ng-class="[button.buttonClass, button.isIcon ? "sel-toolbar-icon" : "", button.isActive(this) ? "menu-active" : ""]" title="Confirm selection">' +
			'<span class="sel-toolbar-span-icon icon-tick" ng-class="button.iconClass"></span>' +
		'</button>'
		);
		$("#confirmSelect").click(function(){
			console.log("Selections Confirmed");
			app.field(dimensions[0].qGroupFieldDefs[0]).selectValues(selvalues, false, false);
		});
	}
	
});



};