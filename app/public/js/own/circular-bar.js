	//based on http://bl.ocks.org/mbostock/1096355
	//apple design:http://images.apple.com/watch/features/images/fitness_large.jpg
	"use strict";

	(function(){
		var gap = 2;

		var ranDataset = function (x,y,z) {
			var ran = Math.random();

			return    [
				{index: 0, name: 'move', icon: "\uF105", percentage: x},
				{index: 1, name: 'exercise', icon: "\uF101", percentage: y},
				{index: 2, name: 'stand', icon: "\uF106", percentage: z }
			];

		};

		var colors = ["#e90b3a", "#a0ff03", "#1ad5de"];
		var width = 500,
				height = 500,
				τ = 2 * Math.PI;

		function build(dataset,singleArcView){

			var arc = d3.svg.arc()
					.startAngle(0)
					.endAngle(function (d) {
						return d.percentage / 100 * τ;
					})
					.innerRadius(function (d) {
						return 140 - d.index * (40 + gap)
					})
					.outerRadius(function (d) {
						return 180 - d.index * (40 + gap)
					})
					.cornerRadius(20);//modified d3 api only

			var background = d3.svg.arc()
					.startAngle(0)
					.endAngle(τ)
					.innerRadius(function (d, i) {
						return 140 - d.index * (40 + gap)
					})
					.outerRadius(function (d, i) {
						return 180 - d.index * (40 + gap)
					});

			var svg = d3.select("body").append("svg")
					.attr("width", width)
					.attr("height", height)
					.append("g")
					.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

			//add linear gradient, notice apple uses gradient alone the arc..
			//meh, close enough...


			var gradient = svg.append("svg:defs")
					.append("svg:linearGradient")
					.attr("id", "gradient")
					.attr("x1", "0%")
					.attr("y1", "100%")
					.attr("x2", "50%")
					.attr("y2", "0%")
					.attr("spreadMethod", "pad");

			gradient.append("svg:stop")
					.attr("offset", "0%")
					.attr("stop-color", "#fe08b5")
					.attr("stop-opacity", 1);

			gradient.append("svg:stop")
					.attr("offset", "100%")
					.attr("stop-color", "#ff1410")
					.attr("stop-opacity", 1);


			//add some shadows
			var defs = svg.append("defs");

			var filter = defs.append("filter")
					.attr("id", "dropshadow")

			filter.append("feGaussianBlur")
					.attr("in", "SourceAlpha")
					.attr("stdDeviation", 4)
					.attr("result", "blur");
			filter.append("feOffset")
					.attr("in", "blur")
					.attr("dx", 1)
					.attr("dy", 1)
					.attr("result", "offsetBlur");

			var feMerge = filter.append("feMerge");

			feMerge.append("feMergeNode")
					.attr("in", "offsetBlur");
			feMerge.append("feMergeNode")
					.attr("in", "SourceGraphic");

			var field = svg.selectAll("g")
					.data(dataset)
					.enter().append("g");

			field.append("path").attr("class", "progress").attr("filter", "url(#dropshadow)");

			field.append("path").attr("class", "bg")
					.style("fill", function (d) {
						return colors[d.index];
					})
					.style("opacity", 0.2)
					.attr("d", background);

			field.append("text").attr('class','icon');


			if(singleArcView){

				field.append("text").attr('class','goal').text("OF 100 Points").attr("transform","translate(0,50)");
				field.append("text").attr('class','completed').attr("transform","translate(0,0)");

			}

			d3.transition().duration(1750).each(update);

			function update() {
				field = field
						.each(function (d) {
							this._value = d.percentage;
						})
						.data(dataset)
						.each(function (d) {
							d.previousValue = this._value;
						});

				field.select("path.progress").transition().duration(1750).delay(function (d, i) {
					return i * 200
				})
						.ease("elastic")
						.attrTween("d", arcTween)
						.style("fill", function (d) {
							if(d.index===0){
								return "url(#gradient)"
							}
							return colors[d.index];
						});


				setTimeout(update, 2000);

			}

			function arcTween(d) {
				var i = d3.interpolateNumber(d.previousValue, d.percentage);
				return function (t) {
					d.percentage = i(t);
					return arc(d);
				};
			}


		}


		build(ranDataset(30,20,10));


	})()

