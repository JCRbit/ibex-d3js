const width = 1200
const height = 700
const margin = {top: 10, bottom: 40, left: 40, right: 10}
const netWidth = width - margin.left - margin.right
const netHeight = height - margin.bottom - margin.top

// Create chart groups and title
const svg = d3.select("div#chart").append("svg").attr("width", width).attr("height", height)
const elementGroup = svg.append("g").attr("id", "elementGroup").attr("transform", `translate(${margin.left}, ${margin.top})`)
const datesGroup = elementGroup.append("g").attr("id", "datesGroup")
const axisGroup = svg.append("g").attr("id", "axisGroup")
const xAxisGroup = axisGroup.append("g").attr("id", "xAxisGroup").attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
const yAxisGroup = axisGroup.append("g").attr("id", "yAxisGroup").attr("transform", `translate(${margin.left}, ${margin.top})`)

// Add axis
const x = d3.scaleTime().range([0, netWidth])
const y = d3.scaleLinear().range([netHeight, 0])

const xAxis = d3.axisBottom().scale(x)
const yAxis = d3.axisLeft().scale(y)

// Read and show data
d3.csv("ibex.csv").then(showData)

function showData(data) {
    // Data parsing
    const timeParse = d3.timeParse("%d/%m/%Y")
    data.forEach(d => {
        d.date = timeParse(d.date),
        d.open = +d.open,
        d.high = +d.high,
        d.low = +d.low,
        d.close = +d.close,
        d.volume = +d.volume
    })

    // Axis domains
    x.domain(d3.extent(data, d => d.date))
    const minLow = d3.min(data, d => d.low)
    const maxHigh = d3.max(data, d => d.high)
    y.domain([minLow, maxHigh])

    xAxisGroup.call(xAxis)    
    yAxisGroup.call(yAxis)

    // Show mouse lines, candlesticks and volume bars
    const candleWidth = 0.45 * netWidth / data.length     
    showCandles(data, candleWidth)
}

function showCandles(data, candleWidth) {
    const timeFormat = d3.timeFormat("%d-%m-%Y")
    
    datesGroup.selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("id", d => timeFormat(d.date))

    datesGroup.selectAll("g").append("rect")
        .attr("x", d => x(d.date) - 1.5 * candleWidth / 2)
        .attr("y", 0)
        .attr("width", 1.5 * candleWidth)
        .attr("height", height)
        .attr("fill", "black")
        .attr("opacity", 0) 
    
    const candleGroups = datesGroup.selectAll("g").append("g").attr("class", "candle")
    // Candlestick wiskers
    candleGroups.append("line")
        .attr("stroke", d => d.open > d.close ? "red" : "green")
        .attr("stroke-width", 0.35)
        .attr("x1", d => x(d.date))
        .attr("y1", d => y(d.high))
        .attr("x2", d => x(d.date))
        .attr("y2", d => y(d.low))
    
    // Candlestick bodies
    candleGroups.append("rect")
        .attr("fill", d => d.open > d.close ? "#ff4141" : "#69ff69")
        .attr("stroke", d => d.open > d.close ? "red" : "green")
        .attr("stroke-width", 0.5)
        .attr("x", d => x(d.date) - candleWidth / 2)
        .attr("y", d => y(Math.max(d.open, d.close)))
        .attr("width", () => candleWidth)
        .attr("height", d => Math.abs(y(d.open) - y(d.close)))    
}


