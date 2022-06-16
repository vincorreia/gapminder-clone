/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

const MARGIN = {LEFT: 100, TOP: 30, RIGHT: 30, BOTTOM: 80}
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 400 - MARGIN.BOTTOM - MARGIN.TOP

let flag = 0


const svg = d3.selectAll("#chart-area").append("svg")
			.attr("height", HEIGHT + MARGIN.BOTTOM + MARGIN.TOP)
			.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)

const g = svg.append("g")
			.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

const x = d3.scaleLog()
		.domain([100, 150000])
		.range([0, WIDTH])

const y = d3.scaleLinear()
		.domain([0, 90])
		.range([HEIGHT, 0])

const continentColor = d3.scaleOrdinal(d3.schemePastel1)

d3.json("data/data.json").then(function(data){
	data.forEach(d => {
		d.countries = d.countries.filter(d => d.income && d.life_exp && d.population)
	})
	console.log(data)

	d3.interval(() => {
		if(flag <= 213){
		flag++
		}
		else{
			flag = 0
		}
		update(data)
	}, 500)

	const r = d3.scaleSqrt()
	.domain([0, d3.max(data, d => {
		return d3.max(d.countries, p => p.population)
	})])
	.range([5, 25])
	
	const xAxisCall = d3.axisBottom(x)
						.tickValues([400, 4000, 40000])
						.tickFormat(d3.format("$"))
	
	const yAxisCall = d3.axisLeft(y)
						.tickValues([0, 25, 50, 75])

	const xAxisGroup = g.append("g")
							.attr("transform", `translate(0, ${HEIGHT})`)
							.attr("class", "x axis")
							.call(xAxisCall)

	const yAxisGroup = g.append("g")
						.attr("class", "y axis")
						.call(yAxisCall)

	function update(data) {
		const nowData = data[flag] 
		const t = d3.transition(0)

		const circles = g.selectAll("circle")
						.data(nowData.countries)
		
		circles.exit().remove()

		circles
			.enter().append("circle")
			.merge(circles)
			.transition(t)
			.attr("r", d => r(d.population))
			.attr("fill", d => continentColor(d.continent))
			.attr("cx", (d) => x(d.income))
			.attr("cy", d => y(d.life_exp))
	}
})