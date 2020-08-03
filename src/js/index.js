import * as d3 from "d3";
import { rollup, group } from "d3-array";

function checkIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

window.onload = function () {
  if (checkIframe()) document.body.classList.add("iframe");
  d3.csv("./data/undergrad_sections_processed.csv").then((data) => {
    const type_breakdown = new TypeBreakdown();
    const class_pool = new ClassPool();
    const class_breakdown = new ClassBreakdown();
    d3.select(".vis.type_breakdown .figure__graphic")
      .datum(data)
      .call(type_breakdown.draw);
    d3.select(".vis.course_pool .figure__graphic")
      .datum(data)
      .call(class_pool.draw);
    d3.select(".vis.subject_breakdown .figure__graphic")
      .datum(data)
      .call(class_breakdown.draw);
  });
};

class TypeBreakdown {
  width = 600;
  height = 50;

  margin = { top: 0, right: 0, bottom: 0, left: 0 };
  xScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, this.width - this.margin.left - this.margin.right]);
  colorScale = d3.scaleOrdinal(d3.schemeDark2);

  constructor() {
    // in here, "this" is the Map instance
    // once we bind it, in draw, "this" will also be the Map instance
    this.chart = this.chart.bind(this);
    this.draw = this.draw.bind(this);
    this.preprocess = this.preprocess.bind(this);
  }

  preprocess(datum) {
    // end up with {type: count..}
    let data = rollup(
      datum,
      (v) => v.length,
      (d) => d.mode
    );
    const total = d3.sum(Array.from(data.values()));
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

  chart(datum, _, el) {
    this.width = d3.min([600, window.innerWidth * 0.8]);
    this.xScale.range([0, this.width - this.margin.left - this.margin.right]);

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

    this.colorScale.domain([0, 1, 2]);
    const rects = g
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("width", (d) => this.xScale(d.value))
      .attr("height", 30)
      .attr("x", (d) => this.xScale(d.offset))
      .attr("fill", (_, i) => this.colorScale(i));
    const format = d3.format(".0%");
    const labels = g
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("alignment-baseline", "middle")
      .attr("x", (d) => this.xScale(d.offset) + 5)
      .attr("y", 30 / 2.0 + 2)
      .attr("font-size", "smaller")
      .text((d) => `${d.key} ${format(d.value)}`);
  }

  draw(selection) {
    const chart = this.chart;
    selection.each(function (d, i) {
      // what is "this"?
      // "this" is the element in the selection
      chart(d, i, d3.select(this));
    });
  }
}

class ClassBreakdown {
  // source = "./data/online_classes_processed.csv";
  width = 600;
  height = 7 * 30;

  margin = { top: 0, right: 0, bottom: 0, left: 100 };
  y = d3.scaleBand().range([0, this.height]).padding([0.2]);
  x = d3.scaleLinear().domain([0, 1]);

  constructor() {
    // in here, "this" is the Map instance
    // once we bind it, in draw, "this" will also be the Map instance
    this.chart = this.chart.bind(this);
    this.draw = this.draw.bind(this);
    this.preprocess = this.preprocess.bind(this);
  }

  preprocess(datum) {
    // end up with {type: count..}
    let data = group(datum, (d) => d.subject);
    data = Array.from(data.entries()).map((d) => ({
      subject: d[0],
      percentages: rollup(
        d[1],
        (v) => (v.length * 1.0) / d[1].length,
        (d) => d.mode
      ),
    }));
    return data;
  }

  chart(datum, _, el) {
    this.width = d3.min([600, window.innerWidth * 0.8]);
    this.x.range([0, this.width - this.margin.left - this.margin.right]);
    console.log(this.width);
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

    this.y.domain(data.map((d) => d.subject));

    g.append("g").call(d3.axisLeft(this.y).tickSizeOuter(0));

    let subgroups = Array.from(data[0].percentages.keys());

    let color = d3.scaleOrdinal(d3.schemeDark2).domain(subgroups);

    let stacker = d3.stack().keys(subgroups);

    let bars = g
      .selectAll("g.bar")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(0,${this.y(d.subject)})`)
      .classed("bar", true);
    bars
      .selectAll("rect")
      .data(function (d) {
        // convert from Map to object literal:
        // https://gist.github.com/lukehorvat/133e2293ba6ae96a35ba#gistcomment-2624332
        const obj = Array.from(d.percentages.entries()).reduce(
          (main, [key, value]) => ({ ...main, [key]: value }),
          {}
        );
        return stacker([obj]);
      })
      .enter()
      .append("rect")
      .attr("width", (d) => this.x(d[0][1]) - this.x(d[0][0]))
      .attr("x", (d) => this.x(d[0][0]))
      .attr("height", 20)
      .attr("fill", (d) => color(d.key));
    bars
      .filter((_, i) => i === 0)
      .selectAll("text")
      .data(function (d) {
        // convert from Map to object literal:
        // https://gist.github.com/lukehorvat/133e2293ba6ae96a35ba#gistcomment-2624332
        const obj = Array.from(d.percentages.entries()).reduce(
          (main, [key, value]) => ({ ...main, [key]: value }),
          {}
        );
        return stacker([obj]);
      })
      .enter()
      .append("text")
      .text((d) => d.key)
      .attr("x", (d) => this.x(d[0][0]) + 5)
      .attr("dy", 12)
      .attr("alignment-baseline", "middle")
      .attr("font-size", "smaller");
  }
  draw(selection) {
    const chart = this.chart;
    selection.each(function (d, i) {
      chart(d, i, d3.select(this));
    });
  }
}

class ClassPool {
  width = 800;
  height = 400;
  margin = { top: 0, right: 0, bottom: 0, left: 0 };

  radiusScale = d3.scaleSqrt().range([0, 40]);
  centerScale = d3.scalePoint().range([0, this.width]).padding(0.3);
  colorScale = d3.scaleOrdinal(d3.schemeDark2);

  simulation = d3
    .forceSimulation()
    .force(
      "x",
      d3
        .forceX()
        .x((d) => this.centerScale(d.mode))
        .strength(0.09)
    )
    .force("y", d3.forceY().y(this.height / 2))
    .force("cluster", this.forceCluster())
    .force(
      "collision",
      d3.forceCollide().radius((d) => d.radius + 1)
    );

  constructor() {
    this.chart = this.chart.bind(this);
    this.draw = this.draw.bind(this);
    this.getNodes = this.getNodes.bind(this);
    this.simulation.stop();
  }

  getNodes(datum) {
    let data = Array.from(
      rollup(
        datum,
        (v) => ({
          dept: v[0].dept,
          number: v[0].number,
          name: v[0].name,
          term: v[0].term,
          mode: v[0].mode,
          subject: v[0].subject,
          sections: v,
        }),
        (d) => `${d.dept} ${d.number} ${d.mode}`
      ).values()
    );
    this.radiusScale.domain(d3.extent(data.map((d) => d.sections.length)));
    return data.map((d) => ({
      ...d,
      radius: this.radiusScale(d.sections.length),
    }));
  }

  forceCluster() {
    const strength = 1;
    let nodes;
    function centroid(nodes) {
      let x = 0;
      let y = 0;
      let z = 0;
      for (const d of nodes) {
        let k = d.radius ** 2;
        x += d.x * k;
        y += d.y * k;
        z += k;
      }
      return { x: x / z, y: y / z };
    }

    function cluster(d) {
      return `${d.subject}-${d.mode}`;
    }

    function force(alpha) {
      const centroids = rollup(nodes, centroid, cluster);
      const l = alpha * strength;
      for (const d of nodes) {
        const { x: cx, y: cy } = centroids.get(cluster(d));
        d.vx -= (d.x - cx) * l;
        d.vy -= (d.y - cy) * l;
      }
    }
    force.initialize = (_) => (nodes = _);
    return force;
  }

  chart(datum, _, el) {
    this.width = window.innerWidth * 0.8;
    this.centerScale.range([0, this.width]);
    this.radiusScale.range([0, this.width * 0.03]);

    function hover() {
      const text = d3
        .select(this)
        .selectAll("text.label")
        .data((d) => [d])
        .enter()
        .append("text")
        .classed("label", true)
        .attr("pointer-events", "none")
        .attr("font-size", "smaller")
        .attr("text-anchor", "middle")
        .attr("font-family", "Open Sans")
        .attr("font-weight", "bold");
      text
        .append("tspan")
        .text((d) => `${d.dept} ${d.number}`)
        .attr("x", 0)
        .attr("stroke", "white")
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");
      text
        .append("tspan")
        .text((d) => `${d.dept} ${d.number}`)
        .attr("x", 0);
      d3.select(this)
        .select("circle")
        .attr("stroke", "black")
        .attr("stroke-width", 2);
      d3.select(this).raise();
    }
    function unhover() {
      d3.select(this).select("circle").attr("stroke", "none");
      if (d3.select(this).datum().radius < 20)
        d3.select(this).selectAll("text.label").remove();
    }
    const nodes = this.getNodes(datum);
    const svg_enter = el
      .selectAll("svg")
      .data([nodes])
      .enter()
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
    const g = svg_enter
      .append("g")
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    this.colorScale.domain(nodes.map((d) => d.subject));
    const bubbles = g
      .selectAll("g.circle")
      .data(nodes, (d) => d.id)
      .enter()
      .append("g")
      .classed("circle", true)
      .on("mouseover", hover)
      .on("mouseout", unhover);
    bubbles
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => this.colorScale(d.subject));
    const text = bubbles
      .selectAll("text.label")
      .data((d) => (d.radius > 20 ? [d] : []))
      .enter()
      .append("text")
      .classed("label", true)
      .attr("font-size", "smaller")
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-family", "Open Sans");
    text
      .append("tspan")
      .text((d) => `${d.dept} ${d.number}`)
      .attr("x", 0)
      .attr("stroke", "white")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");
    text
      .append("tspan")
      .text((d) => `${d.dept} ${d.number}`)
      .attr("x", 0);
    bubbles.filter((d) => d.radius > 20).raise();
    this.centerScale.domain(nodes.map((d) => d.mode));
    const categories = g
      .selectAll("text.category")
      .data(["Online", "In Person", "Hybrid"])
      .enter()
      .append("text")
      .classed("category", true)
      .attr("x", (d) => this.centerScale(d))
      .attr("y", this.height - 20)
      .attr("alignment-baseline", "baseline")
      .attr("text-anchor", "middle")
      .text((d) => d);
    // https://observablehq.com/@d3/clustered-bubbles
    function tick() {
      bubbles.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
      // bubbles.attr("x", (d) => d.x).attr("y", (d) => d.y);
    }

    this.simulation.nodes(nodes).on("tick", tick).restart();
  }

  draw(selection) {
    const chart = this.chart;
    selection.each(function (d, i) {
      chart(d, i, d3.select(this));
    });
  }
}
