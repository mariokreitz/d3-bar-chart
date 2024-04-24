import { useState, useEffect } from 'react';
import './App.css';
import * as d3 from 'd3';
import { Watch } from 'react-loader-spinner';

function App() {
	const [isLoading, setLoading] = useState(true);
	const [data, setData] = useState(null);

	// fetch json data from api "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json"
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
				);
				if (!response.ok) {
					throw new Error('Failed to load data from server');
				}
				const jsonData = await response.json();
				setData(jsonData);
				setLoading(false);
			} catch (error) {
				console.error(error);
			}
		};

		fetchData();
	}, []);

	// setup D3
	// fill data into D3 after API fetch
	const createChart = () => {
		if (!isLoading) {
			const width = 800;
			const height = 400;
			const barWidth = width / 275;

			const tooltip = d3.select('.svgHolder').append('div').attr('id', 'tooltip').style('opacity', 0);
			const overlay = d3.select('.svgHolder').append('div').attr('class', 'overlay').style('opacity', 0);
			const svgContainer = d3
				.select('.svgHolder')
				.append('svg')
				.attr('width', width + 100)
				.attr('height', height + 60);
			svgContainer
				.append('text')
				.attr('transform', 'rotate(-90)')
				.attr('x', -200)
				.attr('y', 80)
				.text('Gross Domestic Product');
			svgContainer
				.append('text')
				.attr('x', width / 2 + 120)
				.attr('y', height + 50)
				.text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf')
				.attr('class', 'info');

			const years = data.data.map(function (item) {
				let quarter;
				const temp = item[0].substring(5, 7);

				if (temp === '01') {
					quarter = 'Q1';
				} else if (temp === '04') {
					quarter = 'Q2';
				} else if (temp === '07') {
					quarter = 'Q3';
				} else if (temp === '10') {
					quarter = 'Q4';
				}

				return item[0].substring(0, 4) + ' ' + quarter;
			});
			const yearsDate = data.data.map(function (item) {
				return new Date(item[0]);
			});

			const xMax = new Date(d3.max(yearsDate));
			const xScale = d3
				.scaleTime()
				.domain([d3.min(yearsDate), xMax])
				.range([0, width]);
			const xAxis = d3.axisBottom().scale(xScale);

			svgContainer.append('g').call(xAxis).attr('id', 'x-axis').attr('transform', 'translate(60, 400)');

			const GDP = data.data.map(function (item) {
				return item[1];
			});
			let scaledGDP = [];

			const gdpMax = d3.max(GDP);
			const linearScale = d3.scaleLinear().domain([0, gdpMax]).range([0, height]);

			scaledGDP = GDP.map(function (item) {
				return linearScale(item);
			});

			var yAxisScale = d3.scaleLinear().domain([0, gdpMax]).range([height, 0]);

			var yAxis = d3.axisLeft(yAxisScale);

			svgContainer.append('g').call(yAxis).attr('id', 'y-axis').attr('transform', 'translate(60, 0)');

			d3.select('svg')
				.selectAll('rect')
				.data(scaledGDP)
				.enter()
				.append('rect')
				.attr('data-date', function (d, i) {
					return data.data[i][0];
				})
				.attr('data-gdp', function (d, i) {
					return data.data[i][1];
				})
				.attr('class', 'bar')
				.attr('x', function (d, i) {
					return xScale(yearsDate[i]);
				})
				.attr('y', function (d) {
					return height - d;
				})
				.attr('width', barWidth)
				.attr('height', function (d) {
					return d;
				})
				.attr('index', (d, i) => i)
				.style('fill', '#33adff')
				.attr('transform', 'translate(60, 0)')
				.on('mouseover', function (event, d) {
					// d or datum is the height of the
					// current rect
					const i = this.getAttribute('index');

					overlay
						.transition()
						.duration(0)
						.style('height', d + 'px')
						.style('width', barWidth + 'px')
						.style('opacity', 0.9)
						.style('left', i * barWidth + 0 + 'px')
						.style('top', height - d + 'px')
						.style('transform', 'translateX(60px)');
					tooltip.transition().duration(200).style('opacity', 0.9);
					tooltip
						.html(years[i] + '<br>' + '$' + GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' Billion')
						.attr('data-date', data.data[i][0])
						.style('left', i * barWidth + 30 + 'px')
						.style('top', height - 100 + 'px')
						.style('transform', 'translateX(60px)');
				})
				.on('mouseout', function () {
					tooltip.transition().duration(200).style('opacity', 0);
					overlay.transition().duration(200).style('opacity', 0);
				});
		}
	};
	// render BarChart
	useEffect(() => {
		createChart();
	}, [data]);

	//render HTML
	if (isLoading) {
		return (
			<div className="isLoading">
				<Watch
					visible={true}
					height="80"
					width="80"
					radius="48"
					color="#4fa94d"
					ariaLabel="watch-loading"
					wrapperStyle={{}}
					wrapperClass=""
				/>
				<p>loading data...</p>
			</div>
		);
	}
	return (
		<div className="container">
			<div id="title">United States GDP</div>
			<div className="svgHolder"></div>
		</div>
	);
}

export default App;
