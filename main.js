const width = 1100
const height = 600
const margin = {top: 10, bottom: 40, left: 40, right: 10}
const netWidth = width - margin.left - margin.right
const netHeight = height - margin.bottom - margin.top

// Create chart groups
const svg = d3.select("div#chart").append("svg").attr("width", width).attr("height", height)
const elementGroup = svg.append("g").attr("id", "elementGroup").attr("transform", `translate(${margin.left}, ${margin.top})`)
const datesGroup = elementGroup.append("g").attr("id", "datesGroup")
const mouseLinesGroup = svg.append("g").attr("id", "mouseLinesGroup").attr("transform", `translate(${margin.left}, ${margin.top})`)
const axisGroup = svg.append("g").attr("id", "axisGroup")
const xAxisGroup = axisGroup.append("g").attr("id", "xAxisGroup").attr("transform", `translate(${margin.left}, ${height - margin.bottom})`)
const yAxisGroup = axisGroup.append("g").attr("id", "yAxisGroup").attr("transform", `translate(${margin.left}, ${margin.top})`)

// Title
const title = "IBEX 35"
d3.select("title").text(title)
svg.append("text").attr("id", "title").attr("x", width - 20).attr("y", height - 80).text(title).lower()   

// Add axis
const x = d3.scaleTime().range([0, netWidth])
const y = d3.scaleLinear().range([netHeight, 0]) // Price
const z = d3.scaleLinear().range([netHeight, netHeight * 0.85]) // Volume 

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
    y.domain([minLow - 200, maxHigh])
    z.domain(d3.extent(data, d => d.volume))

    xAxisGroup.call(xAxis.tickFormat(d3.timeFormat("%b %Y")))    
    yAxisGroup.call(yAxis.tickSizeInner(-netWidth)) // Add auxiliary horizontal lines
    
        // Show mouse lines, candlesticks and volume bars
        const candleWidth = 0.45 * netWidth / data.length     
        showCandles(data, candleWidth)
        showVolume(data, candleWidth) 
        showMouseLines()
    }
    
    function showCandles(data, candleWidth) {
        const timeFormat = d3.timeFormat("%d-%m-%Y")
        datesGroup.selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("class", "date")
            .attr("id", d => timeFormat(d.date))

        datesGroup.selectAll("g.date").append("rect")
            .attr("class", "backgroundBar")
            .attr("x", d => x(d.date) - 1.25 * candleWidth / 2)
            .attr("y", 0)
            .attr("width", 1.25 * candleWidth)
            .attr("height", height)
            // .attr("fill", "black")
            .attr("opacity", 0)
    
        const candleGroups = datesGroup.selectAll("g.date").append("g").attr("class", "candle")
        // Candlestick wiskers
        candleGroups.append("line")
            .attr("class", d => d.open > d.close ? "redLine" : "greenLine")
            .attr("x1", d => x(d.date))
            .attr("y1", d => y(d.high))
            .attr("x2", d => x(d.date))
            .attr("y2", d => y(d.low))
            
        // Candlestick bodies
        candleGroups.append("rect")
            .attr("class", d => d.open > d.close ? "redCandle" : "greenCandle")
            .attr("x", d => x(d.date) - candleWidth / 2)
            .attr("y", d => y(Math.max(d.open, d.close)))
            .attr("width", candleWidth)
            .attr("height", d => Math.abs(y(d.open) - y(d.close)))
    }
    
    function showVolume(data, candleWidth) {
        const volumeGroups = datesGroup.selectAll("g.date").append("g").attr("class", "volumeBar")
        volumeGroups.append("rect")
            .attr("class", d => d.open > d.close ? "redBar" : "greenBar")
            .attr("x", d => x(d.date) - candleWidth / 2)
            .attr("y", d => z(d.volume))
            .attr("width", candleWidth)
            .attr("height", d => netHeight- z(d.volume))
    }
    
    function showMouseLines() {
        // Horizontal line
        mouseLinesGroup.append("line")
            .attr("id", "hMouseLine")
            .attr("class", "mouseLine")
            .attr("x1", 0)
            .attr("x2", netWidth)
        
        // Vertical line
        mouseLinesGroup.append("line")
            .attr("id", "vMouseLine")
            .attr("class", "mouseLine")
            .attr("y1", 0)
            .attr("y2", netHeight)  
        
        svg.on("mouseenter", () => moveMouseLines(d3.event.pageX, d3.event.pageY))
            .on("mousemove", () => moveMouseLines(d3.event.pageX, d3.event.pageY))
            .on("mouseleave", () => mouseLinesGroup.style("display", "none"))
    }
    
    function moveMouseLines(x, y) {
        const mouseOffsetY = margin.top + 7
        const hMouseLine = d3.select("line#hMouseLine")
        hMouseLine.attr("y1", y - mouseOffsetY).attr("y2", y - mouseOffsetY)
        
        const mouseOffsetX = margin.left + 7
        const vMouseLine = d3.select("line#vMouseLine")
        vMouseLine.attr("x1", x - mouseOffsetX).attr("x2", x - mouseOffsetX).style("display", "block")
        
        mouseLinesGroup.style("display", "block")
    }