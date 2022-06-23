/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

const MARGIN = {LEFT: 100, TOP: 30, RIGHT: 30, BOTTOM: 80}
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 400 - MARGIN.BOTTOM - MARGIN.TOP

const continents = ["europe", "asia", "africa", "americas"]
let flag = 0
let interval


const svg = d3.selectAll("#chart-area").append("svg")
			.attr("height", HEIGHT + MARGIN.BOTTOM + MARGIN.TOP)
			.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)

const g = svg.append("g")
			.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

const tooltip = d3.tip()
					.attr("class", "d3-tip")
					.html(d => {
						return `<strong>Continent:</strong> <span style="color: red; text-transform: capitalize">${d.continent}</span><br>
						<strong>Country:</strong> <span style="color: red">${d.country}</span><br>
						<strong>GDP per Capita:</strong> <span style="color: red">${d3.format("$,.0f")(d.income)}</span><br>
						<strong>Life Expectation:</strong> <span style="color: red">${d3.format(".2f")(d.life_exp)}</span><br>
						<strong>Population:</strong> <span style="color: red">${d3.format(",.0f")(d.population)}</span><br>`
					})

g.call(tooltip)
// Scales (except r that is dependant from the data gathered)
const x = d3.scaleLog()
		.domain([100, 150000])
		.range([0, WIDTH])

const y = d3.scaleLinear()
		.domain([0, 90])
		.range([HEIGHT, 0])

const continentColor = d3.scaleOrdinal(d3.schemePastel1)


// Labels

const xAxisLabel = g.append("text")
					.attr("class", "x axis-label")
					.attr("y", HEIGHT + 55)
					.attr("x", WIDTH / 2 - 65)
					.attr("font-size", "20px")
					.text("GDP Per Capita ($)")

const yAxisLabel = g.append("text")
					.attr("class", "y axis-label")
					.attr("transform", "rotate(-90)")
					.attr("x", -(HEIGHT / 2 + 110))
					.attr("y", -55)
					.attr("font-size", "20px")
					.text("Life Expectancy (Years)")

const yearLabel = g.append("text")
					.attr("class", "year-label")
					.attr("x", WIDTH - 82)
					.attr("y", HEIGHT - 5)
					.attr("font-size", "40px")
					.attr("fill", "grey")
					.attr("font", "Ubuntu")
					.text("1800")

d3.json("data/data.json").then(function(data){
	data.forEach(d => {
		d.countries = d.countries.filter(d => d.income && d.life_exp && d.population)
	})
	console.log(data)

function step() {
	flag = flag <= 213 ? flag + 1 : 0
	update(data)
}

$("#play-button")
	.on("click", function () {
		const button = $(this)

		if(button.text() === "Play"){
		button.text("Pause")
		interval = setInterval(step, 100)
		} else {
		button.text("Play")
		clearInterval(interval)
		}
	})

$("#reset-button")
	.on("click", () => {
		flag = 0
		update(data)
	})


$("#continent-select")
	.on("change", () => {
		update(data)
	})
	
$("#date-slider").slider({
		min: 1800,
		max: 2014,
		step: 1,
		slide: (event, ui) => {
			flag = ui.value - 1800
			update(data)
		}
	})
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

	const legend = g.append("g")
					.attr("transform", `translate(${WIDTH - 10}, ${HEIGHT - 125})`)

	continents.forEach((continent, i) => {
		const legendRow = legend.append("g")
							.attr("transform", `translate(0, ${i * 20})`)

		legendRow.append("rect")
				.attr("width", 10)
				.attr("height", 10)
				.attr("fill", continentColor(continent))

		legendRow.append("text")
		.attr("x", -10)
		.attr("y", 10)
		.attr("text-anchor", "end")
		.style("text-transform", "capitalize")
		.text(continent)
	})

	const xAxisGroup = g.append("g")
							.attr("transform", `translate(0, ${HEIGHT})`)
							.attr("class", "x axis")
							.call(xAxisCall)

	const yAxisGroup = g.append("g")
						.attr("class", "y axis")
						.call(yAxisCall)

	function update(data) {
		const nowData = data[flag]
		const t = d3.transition()
					.duration(100)

		const continent = $("#continent-select").val()

		const filteredData = nowData.countries.filter(d => {
			if(continent == "all"){
				return true
			}
			else {
				return d.continent === continent
			}
		})
		
		const circles = g.selectAll("circle")
						.data(filteredData, d => d.country)
		
		circles.exit().remove()

		circles
			.enter().append("circle")
			.attr("fill", d => continentColor(d.continent))
			.on("mouseover", tooltip.show)
			.on("mouseout", tooltip.hide)
			.merge(circles)
			.transition(t)
			.attr("r", d => r(d.population))
			.attr("cx", (d) => x(d.income))
			.attr("cy", d => y(d.life_exp))

		yearLabel.text(nowData.year)
		$("#year")[0].innerHTML = nowData.year
		$("#date-slider").slider("value", Number(flag + 1800))
	}
})