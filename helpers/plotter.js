function plotResults(result, replacePlot = true, filter = []) {
  const svgHeight = 500;
  const svgWidth = window.innerWidth * 0.9;
  const margin = {
    top: 20,
    bottom: 20,
    left: 40,
    right: 0,
  }

  let data = result;
  if (filter.length > 0) {
    data = {}
    filter.forEach(f => {
      data[f] = result[f]
    })
  }
  const keys = Object.keys(data);
  if (keys.length === 0) {
    return;
  }

  if (replacePlot) {
    d3.select('#plot').selectAll('*').remove();
  }

  const svg = d3.select('#plot').append('svg').attr('width', svgWidth)
      .attr('height', svgHeight)
      .append('g');

  let x = d3.scaleLinear()
      .domain([1, data[keys[0]].length])
      .range([0, svgWidth - 40]);

  const all = Object.values(data).flat();
  let y = d3.scaleLinear()
      .domain([Math.min(...all), Math.max(...all)])
      .nice()
      .range([svgHeight - 40, 0]);

  let xAxis = d3.axisBottom(x);
  let yAxis = d3.axisLeft(y);

  svg.append('g')
      .classed('axis xaxis', true)
      .attr('transform', `translate(${margin.left},${svgHeight - margin.bottom})`)
      .call(xAxis);
  svg.append('g')
      .classed('axis yaxis', true)
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(yAxis);

  const color = d3.scaleOrdinal()
      .domain(Object.keys(data))
      .range([
        '#ec0608', '#0035ba', '#06be00',
        '#850085', '#04c4b5', '#d2d200',
        '#ff00f2'])

  svg.selectAll('lines')
      .data(keys)
      .enter()
      .append("circle")
      .attr("cx", 80)
      .attr("cy", function (d, i) {
        return 20 + i * 25
      }) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("r", 7)
      .style("fill", function (d) {
        return color(d)
      })

  svg.selectAll('labels')
      .data(keys)
      .enter()
      .append("text")
      .attr("x", 100)
      .attr("y", function (d, i) {
        return 20 + i * 25
      }) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function (d) {
        return color(d)
      })
      .text(function (d) {
        return d
      })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

  const scatterPlot = svg.append('g')
      .attr('id', 'scatterPlot')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const plotData = Object.entries(data)
      .map(([key, values]) => ({
        key,
        values: values.map((val, index) => ({val, index: index + 1}))
      }));

  scatterPlot.selectAll(".line")
      .data(plotData)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", (d) => color(d.key))
      .attr("stroke-width", 1.5)
      .attr("d", function (d) {
        return d3.line()
            .x((d) => x(d.index + 1))
            .y((d) => y(d.val))
            (d.values)
      });
}
