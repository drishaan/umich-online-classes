import * as d3 from "d3";
import { rollup } from "d3-array";

window.onload = function () {
  d3.csv("./data/undergrad_sections.csv").then((data) => {
    const type_breakdown = new TypeBreakdown();
    d3.select(".vis.type_breakdown .figure__graphic")
      .datum(data)
      .call(type_breakdown.draw);
  });
};

class TypeBreakdown {
  // source = "./data/us_states.geo.json";
  width = 600;
  height = 50;

  margin = { top: 0, right: 0, bottom: 0, left: 0 };
  xScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, this.width - this.margin.left - this.margin.right]);
  colorScale = d3.scaleOrdinal(d3.schemeCategory10)

  constructor() {
    // in here, "this" is the Map instance
    // once we bind it, in draw, "this" will also be the Map instance
    this.chart = this.chart.bind(this);
    this.draw = this.draw.bind(this);
    this.preprocess = this.preprocess.bind(this);
  }

  preprocess(datum) {
    console.log(datum);
    // end up with {type: count..}
    let data = rollup(
      datum,
      (v) => v.length,
      (d) => d.mode
    );
    const total = d3.sum(data.values());
    let offsets = [];
    data = Array.from(data.entries());
    data.reduce((acc, curr) => {
      offsets.push(acc);
      return acc + curr[1];
    }, 0);
    data = data.map((v, i) => ({
      key: v[0],
      value: v[1] / (total * 1.0),
      offset: offsets[i] / (total * 1.0),
    }));
    return data;
  }

  chart(datum, i, el) {
    const data = this.preprocess(datum);
    const svg_enter = el
      .selectAll("svg")
      .data([data])
      .enter()
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
    const g = svg_enter
      .append("g")
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    this.colorScale.domain([0, 1, 2])
    const rects = g
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("width", (d) => this.xScale(d.value))
      .attr("height", 30)
      .attr("x", (d) => this.xScale(d.offset))
      .attr("fill", (d, i) => this.colorScale(i));
  }

  draw(selection) {
    const chart = this.chart;
    selection.each(function (d, i) {
      // what is "this"?
      // "this" is the element in the selection
      console.log(d);
      chart(d, i, d3.select(this));
    });
  }
}
