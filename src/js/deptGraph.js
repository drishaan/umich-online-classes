import * as d3 from "d3";
import { rollup } from "d3-array";

var classes = [
  "AAS",
  "AERO",
  "AEROSP",
  "AES",
  "ALA",
  "AMCULT",
  "ANATOMY",
  "ANTHRARC",
  "ANTHRBIO",
  "ANTHRCUL",
  "APPPHYS",
  "ARABAM",
  "ARABIC",
  "ARCH",
  "ARMENIAN",
  "ARTDES",
  "ARTSADMN",
  "ASIAN",
  "ASIANLAN",
  "ASIANPAM",
  "ASTRO",
  "AUTO",
  "BA",
  "BCS",
  "BIOINF",
  "BIOLCHEM",
  "BIOLOGY",
  "BIOMEDE",
  "BIOPHYS",
  "BIOSTAT",
  "CATALAN",
  "CEE",
  "CHE",
  "CHEM",
  "CJS",
  "CLARCH",
  "CLCIV",
  "CLIMATE",
  "CMPLXSYS",
  "COGSCI",
  "COMM",
  "COMP",
  "COMPLIT",
  "CSP",
  "CZECH",
  "DANCE",
  "DATASCI",
  "DIGITAL",
  "DUTCH",
  "EARTH",
  "EAS",
  "ECON",
  "EDCURINS",
  "EDUC",
  "EEB",
  "EECS",
  "ELI",
  "ENGLISH",
  "ENGR",
  "ENS",
  "ENSCEN",
  "ENVIRON",
  "ES",
  "ESENG",
  "FRENCH",
  "FTVM",
  "GEOG",
  "GERMAN",
  "GREEK",
  "GREEKMOD",
  "GTBOOKS",
  "HEBREW",
  "HISTART",
  "HISTORY",
  "HONORS",
  "HS",
  "HUMGEN",
  "INSTHUM",
  "INTLSTD",
  "INTMED",
  "IOE",
  "ISLAM",
  "ITALIAN",
  "JAZZ",
  "JUDAIC",
  "KINESLGY",
  "KRSTD",
  "LACS",
  "LATIN",
  "LATINOAM",
  "LING",
  "LSWA",
  "MACROMOL",
  "MATH",
  "MATSCIE",
  "MCDB",
  "MECHENG",
  "MEDCHEM",
  "MELANG",
  "MEMS",
  "MENAS",
  "MFG",
  "MICRBIOL",
  "MIDEAST",
  "MILSCI",
  "MKT",
  "MOVESCI",
  "MUSEUMS",
  "MUSICOL",
  "MUSMETH",
  "MUSTHTRE",
  "NATIVEAM",
  "NAVARCH",
  "NAVSCI",
  "NERS",
  "NURS",
  "ORGSTUDY",
  "PAT",
  "PATH",
  "PERSIAN",
  "PHARMACY",
  "PHARMSCI",
  "PHIL",
  "PHRMACOL",
  "PHYSICS",
  "PHYSIOL",
  "PIBS",
  "POLISH",
  "POLSCI",
  "PORTUG",
  "PPE",
  "PSYCH",
  "PUBHLTH",
  "PUBPOL",
  "QMSS",
  "RCARTS",
  "RCASL",
  "RCCORE",
  "RCHUMS",
  "RCIDIV",
  "RCLANG",
  "RCMUSIC",
  "RCNSCI",
  "RCSSCI",
  "REEES",
  "RELIGION",
  "ROMLANG",
  "ROMLING",
  "RUSSIAN",
  "SCAND",
  "SEAS",
  "SI",
  "SLAVIC",
  "SOC",
  "SPACE",
  "SPANISH",
  "STATS",
  "STDABRD",
  "STRATEGY",
  "TCHNCLCM",
  "THEORY",
  "THTREMUS",
  "TO",
  "TURKISH",
  "UARTS",
  "UC",
  "UKR",
  "URP",
  "WGS",
  "WRITING",
  "YIDDISH",
];

var dataN = classes.map((d) => ({ ID: d }));

class Search {
  //Set size of graph
  margin = { top: 20, right: 20, bottom: 20, left: 20 };
  width = 600;
  height = 400;

  y = d3.scaleLinear().domain([0, 1]).range([this.height, 0]);
  x = d3
    .scaleBand()
    .domain(["Online", "Hybrid", "In Person"])
    .range([30, this.width])
    .padding(0.1);
  yAxis = d3
    .axisRight(this.y)
    .tickSize(this.width)
    .tickFormat(d3.format(",.0%"));

  xAxis = d3.axisBottom(this.x);

  constructor() {
    this.draw = this.draw.bind(this);
    this.chart = this.chart.bind(this);
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
    }));

    // console.log(data)

    var sortedData = [
      { key: "Online", value: 0 },
      { key: "Hybrid", value: 0 },
      { key: "In Person", value: 0 },
    ];

    data.forEach(function (e) {
      if (e.key === "Online") {
        sortedData[0]["value"] = e.value;
      } else if (e.key === "Hybrid") {
        sortedData[1]["value"] = e.value;
      } else {
        sortedData[2]["value"] = e.value;
      }
    });

    console.log(sortedData);
    console.log(data);
    return sortedData;
  }

  chart(rawdata, _, el) {
    var search = "MATH";
    this.width = d3.min([600, window.innerWidth * 0.8]);
    this.x.range([30, this.width]);

    function onFilter() {
      var filterText = d3.select(".form__field").property("value");
      console.log(filterText);
      filterText = filterText.toUpperCase();

      filteredData = dataN;
      if (filterText !== "") {
        var filteredData = dataN.filter(function (d) {
          return d.ID.indexOf(filterText) === 0;
        });
      } else {
        var filteredData = dataN.filter(function (d) {
          return d.ID.indexOf("MATH") === 0;
        });
      }

      search = filteredData[0].ID;

      d3.select(".vis.dept_breakdown .figure__title").html(
        search + " Classes at UM"
      );

      update(search);
    }

    const customYAxis = function (g) {
      var s = g.selection ? g.selection() : g;
      g.call(this.yAxis);
      s.select(".domain").remove();
      s.selectAll(".tick line")
        .filter(Number)
        .attr("stroke", "#c0c0c0")
        .attr("stroke-dasharray", "2,2"); //add dashed horizontal lines
      s.selectAll(".tick text").attr("x", 4).attr("dy", -4);
      if (s !== g)
        g.selectAll(".tick text").attrTween("x", null).attrTween("dy", null);
    }.bind(this);

    const customXAxis = function (g) {
      g.call(this.xAxis);
      g.select(".domain").remove(); //remove bracket ticks
    }.bind(this);

    //PREPROCCESS
    let data = rawdata.filter(function (d) {
      return d.dept === search;
    });
    data = this.preprocess(data);
    console.log(data);
    //Create the svg object
    const form = el
      .selectAll("div.form__group.field")
      .data([data])
      .enter()
      .append("div")
      .classed("form__group", true)
      .classed("field", true);
    form
      .append("input")
      .attr("type", "text")
      .attr("placeholder", "Department name")
      .attr("name", "name")
      .attr("id", "name")
      .attr("autocomplete", "off")
      .classed("form__field", true)
      .on("keyup", onFilter);

    form
      .append("label")
      .attr("for", "name")
      .classed("form__label", true)
      .text("Search any department by abbreviation...");

    console.log(form);
    const svg = el
      .selectAll("svg")
      .data([data])
      .enter()
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);
    const g = svg
      .append("g")
      .attr("transform", `translate(${this.margin.left} , ${this.margin.top})`);
    const yGroup = g.append("g").call(customYAxis);
    const xGroup = g
      .append("g")
      .attr("transform", `translate(0, ${this.height})`) //move x-axis to bottom of graph
      .attr("class", "axis")
      .call(customXAxis);

    function getcolor(mode) {
      if (mode === "Online") {
        return "#1b9e77";
      } else if (mode === "Hybrid") {
        return "#d95f02";
      } else {
        return "#7570b3";
      }
    }

    svg
      .selectAll(".mybar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => this.x(d.key) + this.margin.left)
      .attr("y", (d) => this.y(d.value) + this.margin.top)
      .attr("class", "mybar")
      .attr("width", this.x.bandwidth())
      .attr("height", (d) => this.height - this.y(d.value))
      .attr("fill", function (d) {
        return getcolor(d.key);
      });

    const update = function (search) {
      // const data = rawdata;
      let data = rawdata.filter(function (d) {
        return d.dept === search;
      });

      data = this.preprocess(data);

      var u = svg.selectAll("rect").data(data);

      u.enter()
        .append("rect")
        .merge(u)
        .transition()
        .duration(800)
        .attr("x", (d) => this.x(d.key) + this.margin.left)
        .attr("y", (d) => this.y(d.value) + this.margin.top)
        .attr("class", "mybar")
        .attr("width", this.x.bandwidth())
        .attr("height", (d) => this.height - this.y(d.value))
        .attr("fill", function (d) {
          return getcolor(d.key);
        });
    }.bind(this);

    onFilter();
  }

  draw(selection) {
    const chart = this.chart;
    selection.each(function (d, i) {
      chart(d, i, d3.select(this));
    });
  }

  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}

export default Search;
