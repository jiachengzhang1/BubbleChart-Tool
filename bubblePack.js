var svg = d3.select("#bubble"),
  margin = { top: 20, right: 20, bottom: 30, left: 50 },
  width = +svg.attr("width"),
  height = +svg.attr("height"),
  domainwidth = width - margin.left - margin.right,
  domainheight = height - margin.top - margin.bottom;

var splited = d3.select("#splited").append("g");

// Define the div for the tooltip
var div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// scalers
var x = d3
  .scaleLinear()
  .domain(padExtent([0, 10]))
  .range(padExtent([0, domainwidth]));
var y = d3
  .scaleLinear()
  .domain(padExtent([0, 100]))
  .range(padExtent([domainheight, 0]));

const colorScale = d3
  .scaleOrdinal()
  .domain(["CS", "CE", "ENGL"])
  .range(["#FFDF00", "#FFA500", "#000000"]);

const sizeScale = d3
  .scaleLinear()
  .domain(padExtent([300, 2000]))
  .range(padExtent([10, 150]));

var g = svg
  .append("g")
  .attr("transform", "translate(" + margin.top + "," + margin.top + ")");

var data = [
  {
    id: 0,
    label: "College of Engineering",
    size: 507,
    x: 4,
    y: 53,
    code: "CE",
    children: [
      {
        id: 1,
        label: "ECE",
        size: 507,
        x: 3,
        y: 62,
        code: "CE",
        children: [],
      },
    ],
  },
  {
    id: 2,
    label: "College of Science",
    size: 1000,
    x: 8,
    y: 80,
    code: "CS",
    children: [
      {
        id: 3,
        label: "CS",
        size: 567,
        x: 5,
        y: 92,
        code: "CS",
        children: [],
      },
      {
        id: 4,
        label: "CHEM",
        size: 372,
        x: 3,
        y: 77,
        code: "CS",
        children: [],
      },
      {
        id: 5,
        label: "MATH",
        size: 429,
        x: 4,
        y: 51,
        code: "CS",
        children: [],
      },
      {
        id: 6,
        label: "PHYS",
        size: 410,
        x: 3,
        y: 84,
        code: "CS",
        children: [],
      },
    ],
  },
  {
    id: 7,
    label: "ENGL",
    size: 410,
    x: 2,
    y: 74,
    code: "ENGL",
    children: [
      {
        id: 8,
        label: "ENGL-1",
        size: 390,
        x: 2,
        y: 94,
        code: "ENGL",
        children: [],
      },
    ],
  },
];

var hiddenData = [];

var defs = g.append("defs");
defs
  .append("marker")
  .attr("id", "arrow")
  .attr("viewBox", "0 0 10 10")
  .attr("refX", 5)
  .attr("refY", 5)
  .attr("markerWidth", 6)
  .attr("markerHeight", 6)
  .attr("orient", "auto-start-reverse")

  .append("path")
  .attr("d", "M 0 0 L 10 5 L 0 10 z")
  .attr("class", "arrowHead");

// x axis
g.append("line")
  .attr("x1", 0)
  .attr("x2", domainwidth)
  .attr("y1", domainheight / 2)
  .attr("y2", domainheight / 2)
  .attr("stroke-width", 2)
  .attr("stroke", "black")
  .attr("marker-end", "url(#arrow)")
  .attr("marker-start", "url(#arrow)");
// x axis text
svg
  .append("text")
  .attr("transform", "translate(" + domainwidth + " ," + domainheight / 2 + ")")
  .style("text-anchor", "middle")
  .text("Projected");
svg
  .append("text")
  .attr(
    "transform",
    "translate(" + domainwidth + " ," + (domainheight / 2 + 15) + ")"
  )
  .style("text-anchor", "middle")
  .text("Demand");

// y axis
g.append("line")
  .attr("x1", domainwidth / 2)
  .attr("x2", domainwidth / 2)
  .attr("y1", domainheight)
  .attr("y2", 0)
  .attr("stroke-width", 2)
  .attr("stroke", "black")
  .attr("marker-end", "url(#arrow)")
  .attr("marker-start", "url(#arrow)");
// y axis text
svg
  .append("text")
  .attr(
    "transform",
    "translate(" + (domainwidth / 3 + 10) + " ," + margin.top + ")"
  )
  .style("text-anchor", "middle")
  .text("% of programs");
svg
  .append("text")
  .attr(
    "transform",
    "translate(" + (domainwidth / 3 + 10) + " ," + (margin.top + 15) + ")"
  )
  .style("text-anchor", "middle")
  .text("online");

// draw all circles on the bubble chart
const drawCircles = (selection, { data }) => {
  const circles = selection.selectAll("circle").data(data, (d) => d.id);
  circles
    .enter()
    .append("circle")
    .attr("r", 0)
    .on("click", circleClicked)
    .merge(circles)
    .attr("cx", (d) => {
      return x(d.x);
    })
    .attr("cy", (d) => {
      return y(d.y);
    })
    .style("fill", (d) => {
      return colorScale(d.code);
    })
    .style("opacity", 0.7)
    .on("mouseover", function (d) {
      if (d.children.length > 0) {
        d3.select(this).style("cursor", "pointer");
      }
      div.transition().duration(200).style("opacity", 0.9);
      div
        .html(
          "Program: " +
            d.label +
            "<br/>Enrollment: " +
            d.size +
            "<br/>Projected Demand: " +
            d.x +
            "<br/>% of Program online: " +
            d.y
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).style("cursor", "default");
      div.transition().duration(500).style("opacity", 0);
    })
    .transition()
    .duration(500)
    .attr("r", (d) => {
      return sizeScale(d.size);
    });

  circles.exit().transition().duration(300).attr("r", 0).remove();
};

// draw all circles splited
const drawSplitedCircle = (selection, { hiddenData }) => {
  const circles = selection.selectAll("circle").data(hiddenData, (d) => d.id);
  circles
    .enter()
    .append("circle")
    .attr("r", 0)
    .on("click", splitedCircleClicked)
    .merge(circles)
    .attr("cx", 25)
    .attr("cy", (d, i) => {
      return (i + 1) * 15 * 2;
    })
    .on("mouseover", function (d) {
      if (d.children.length > 0) {
        d3.select(this).style("cursor", "pointer");
      }
      div.transition().duration(200).style("opacity", 0.9);
      div
        .html(
          "Program: " +
            d.label +
            "<br/>Enrollment: " +
            d.size +
            "<br/>Projected Demand: " +
            d.x +
            "<br/>% of Program online: " +
            d.y
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).style("cursor", "default");
      div.transition().duration(500).style("opacity", 0);
    })
    .transition()
    .attr("r", 10)
    .style("opacity", 0.7)
    .attr("fill", (d) => {
      return colorScale(d.code);
    });

  circles.exit().transition().duration(300).attr("r", 0).remove();
};

drawCircles(g, { data });

function circleClicked(d) {
  i = data.indexOf(d);
  const children = d.children;

  if (children.length > 0) {
    // update buttons
    hiddenData = hiddenData.concat(data.splice(i, 1));
    drawSplitedCircle(splited, { hiddenData });

    // update circles
    data = data.concat(children);
    drawCircles(g, { data });
  }
}

function splitedCircleClicked(d) {
  const children = d.children;

  // update buttons
  hiddenData.splice(hiddenData.indexOf(d), 1);
  drawSplitedCircle(splited, { hiddenData });

  // update the circles
  for (i of children) {
    data.splice(data.indexOf(i), 1);
  }
  data = data.concat([d]);
  drawCircles(g, { data });
}

function padExtent(e, p) {
  if (p === undefined) p = 1;
  return [e[0] - p, e[1] + p];
}
