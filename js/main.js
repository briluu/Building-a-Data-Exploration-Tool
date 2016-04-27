/* 
Brian Luu
INFO 474
Building a Data Exploration Tool

This assignment sets the foundation of using reusable code for d3.js graphs. 
Covers scales, axes, filtering data, and drawing data.

I used this link:
http://www.d3noob.org/2013/01/how-to-rotate-text-labels-for-x-axis-of.html
to rotate the text labels on the x-axis so that they did not overlap when
too many were on the graph.


*/
$(function() {
	// Read in csv
	d3.csv('data/college-majors.csv', function(error, allData){

		// Variables that should be accesible within the namespace
		var xScale, yScale, currentData;

		// majors = major_category
		var majors = 'Agriculture & Natural Resources';
		// percent = unemployment_rate
		var percent = '0.00';

		var margin = {
			left:70,
			bottom:135,
			top:50,
			right:10,
		};

		var height = 600 - margin.bottom - margin.top;
		var width = 1000 - margin.left - margin.right;

		var svg = d3.select('#viz')
			.append('svg')
			.attr('height', 600)
			.attr('width', 1000);

		var g = svg.append('g')
				.attr('transform', 'translate(' +  margin.left + ',' + margin.top + ')')
				.attr('height', height)
				.attr('width', width);

		// Append an xaxis label to SVG, specifying the 'transform' attribute to position it
		var xAxisLabel = svg.append('g')
							.attr('transform', 'translate(' + margin.left + ',' + (height + margin.top) + ')')
							.attr('class', 'axis')

		// Append a yaxis label to your SVG, specifying the 'transform' attribute to position it
		var yAxisLabel = svg.append('g')
							.attr('class', 'axis')
							.attr('transform', 'translate(' + margin.left + ',' + (margin.top) + ')')

		// Append text to label the y axis
		var xAxisText = svg.append('text')
						 .attr('transform', 'translate(' + (margin.left + width/2) + ',' + (height + margin.top + 80) + ')')
						 .attr('class', 'majors')

		// Append text to label the y axis 
		var yAxisText = svg.append('text')
						 .attr('transform', 'translate(' + (margin.left - 40) + ',' + (margin.top + height/2) + ') rotate(-90)')
						 .attr('class', 'majors')

		// function that sets the scales given the data
		var setScales = function(data) {
			// Gets the unique values of majors for the domain of your x scale
			var major = data.map(function(d) {return d.Major});

			// Defines an ordinal xScale using rangeBands
			xScale  = d3.scale.ordinal().rangeBands([0, width], .2).domain(major);

			// Get min/max values of the percent data. I multiplied unemployment rate
			// by 100 so that it's easier to read for the user (0.02 -> 2%)
			var yMin =d3.min(data, function(d){return +d.Unemployment_rate * 100});
			var yMax =d3.max(data, function(d){return +d.Unemployment_rate * 100});

			// Defines the yScale, draw from top to bottom
			yScale = d3.scale.linear().range([height, 0]).domain([0, yMax]);
		}

		// function fro setting up the axes
		var setAxes = function() {
			// Define x axis using d3.svg.axis(), assigning the scale as the xScale
			var xAxis = d3.svg.axis()
						.scale(xScale)
						.orient('bottom')

			// Define y axis using d3.svg.axis(), assigning the scale as the yScale
			var yAxis = d3.svg.axis()
						.scale(yScale)
						.orient('left')
						.tickFormat(d3.format('.2s'));

			// Call xAxis
			xAxisLabel.transition().duration(1500).call(xAxis)
								   .selectAll("text")
								   .style("text-anchor", "end")
								   .attr("dx", "1.5em")
								   .attr("dy", ".75em")
								   .attr("transform", "rotate(-15)");

			// Call yAxis
			yAxisLabel.transition().duration(1500).call(yAxis);

			// Update labels
			xAxisText.text('Majors')
			yAxisText.text('Unemployment Rate (%)')
		}

		// Filters the data to a certain major category and unemployment rate percentage
		var filterData = function() {
			currentData = allData.filter(function(d) {
				return d.Major_category == majors && d.Unemployment_rate > percent;
			})
			.sort(function(a,b){
				if (a.Major < b.Major) {
					return -1;
				}
				if (a.Major > b.Major) {
					return 1;
				}
				return 0;
			});
		}

		// Store the data-join in a function, sets scales and update axes
		var draw = function(data) {
			// Set scales
			setScales(data);

			// Set axes
			setAxes();

			// Select all rects and bind data
			var bars = g.selectAll('rect').data(data);

			// Use the .enter() method to get your entering elements, and assign initial positions
			bars.enter().append('rect')
				.attr('x', function(d){return xScale(d.Major)})
				.attr('y', height)
				.attr('height', 0)
				.attr('width', xScale.rangeBand())
				.attr('class', 'bar')
				.attr('title', function(d) {return d.Major});

			// Use the .exit() and .remove() methods to remove elements that are no longer in the data
			bars.exit().remove();

			// Transition properties of the update selection
			bars.transition()
				.duration(1500)
				.delay(function(d,i){return i*50})
				.attr('x', function(d){return xScale(d.Major)})
				// I multiplied unemployment rate by 100 so that it's easier to read for the user (0.02 -> 2%)
				.attr('y', function(d){return yScale(d.Unemployment_rate * 100)})
				.attr('height', function(d) {return height - yScale(d.Unemployment_rate * 100)})
				.attr('width', xScale.rangeBand())
				.attr('title', function(d) {return d.Major});
		}


		// Everytime user uses controls, filter data and redraw 
		$('select').on('change', function() {
			var val = $(this).val();
			var isMajor = $(this).hasClass('major');
			if(isMajor) {
				majors = val;
			} else {
				percent = val;
			}

			// Filter data, update chart
			filterData();
			draw(currentData);
			console.log(percent);
		});

		// Filter data to the current data then draw
		filterData();
		draw(currentData);

	});
});
