import * as d3 from "d3";
import { rollup } from "d3-array";

function checkIframe () {
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
      (d) => d.subject
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
      chart(d, i, d3.select(this));
    });
  }
}

class ClassPool {
  width = 800;
  height = 400;
  margin = { top: 0, right: 0, bottom: 0, left: 0 };

  radiusScale = d3.scaleSqrt().range([0, 40]);
  centerScale = d3.scalePoint().range([0, this.width]).padding(0.2);
  colorScale = d3.scaleOrdinal(d3.schemeDark2);

  simulation = d3
    .forceSimulation()
    .force(
      "x",
      d3.forceX().x((d) => this.centerScale(d.mode))
    )
    .force("y", d3.forceY().y(this.height / 2))
    .force("cluster", this.forceCluster())
    // .force("collide", this.forceCollide());
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
    const strength = 0.2;
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

  forceCollide() {
    const alpha = 0.4; // fixed for greater rigidity!
    const padding1 = 2; // separation between same-color nodes
    const padding2 = 6; // separation between different-color nodes
    let nodes;
    let maxRadius;

    function force() {
      const quadtree = d3.quadtree(
        nodes,
        (d) => d.x,
        (d) => d.y
      );
      for (const d of nodes) {
        const r = d.radius + maxRadius;
        const nx1 = d.x - r,
          ny1 = d.y - r;
        const nx2 = d.x + r,
          ny2 = d.y + r;
        quadtree.visit((q, x1, y1, x2, y2) => {
          if (!q.length)
            do {
              if (q.data !== d) {
                const r =
                  d.radius +
                  q.data.r +
                  (d.subject === q.data.subject ? padding1 : padding2);
                let x = d.x - q.data.x,
                  y = d.y - q.data.y,
                  l = Math.hypot(x, y);
                if (l < r) {
                  l = ((l - r) / l) * alpha;
                  (d.x -= x *= l), (d.y -= y *= l);
                  (q.data.x += x), (q.data.y += y);
                }
              }
            } while ((q = q.next));
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      }
    }

    force.initialize = (_) =>
      (maxRadius =
        d3.max((nodes = _), (d) => d.radius) + Math.max(padding1, padding2));

    return force;
  }

  chart(datum, i, el) {
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
      .selectAll("circle")
      .data(nodes, (d) => d.id)
      .enter()
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => this.colorScale(d.subject));

    // https://observablehq.com/@d3/clustered-bubbles
    function tick() {
      bubbles.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    }

    this.centerScale.domain(nodes.map((d) => d.mode));

    this.simulation.nodes(nodes).on("tick", tick).restart();
  }

  draw(selection) {
    const chart = this.chart;
    selection.each(function (d, i) {
      chart(d, i, d3.select(this));
    });
  }
}
