import * as d3 from "d3";
import { rollup } from "d3-array";

//Set size of graph
var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

//Create the svg object
var svg = d3.select(".vis.dept_breakdown .figure__graphic")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Read the data from CSV
d3.csv("./data/undergrad_sections_processed.csv").then(function(rawdata) {

    var data = rawdata

    function preprocess(datum) {
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

        var sortedData = [{key:"Online", value:0},{key:"Hybrid", value:0},{key:"In Person", value:0}]

        data.forEach(function(e){
            if(e.key === "Online"){
                sortedData[0]["value"] = e.value
            }
            else if(e.key === "Hybrid"){
                sortedData[1]["value"] = e.value
            }
            else{
                sortedData[2]["value"] = e.value
            }
        })

        // sortedData.push(data)
        console.log(sortedData)
        console.log(data)
        return sortedData;
        }

var search = "MATH"

//PREPROCCESS
data = data.filter(function (d) {
    return d.dept === search;
});

data = preprocess(data)

var classes = ["AAS", "AERO", "AEROSP", "AES", "ALA", "AMCULT", "ANATOMY", "ANTHRARC", "ANTHRBIO", "ANTHRCUL", "APPPHYS", "ARABAM", "ARABIC", "ARCH", "ARMENIAN", "ARTDES", "ARTSADMN", "ASIAN", "ASIANLAN", "ASIANPAM", "ASTRO", "AUTO", "BA", "BCS", "BIOINF", "BIOLCHEM", "BIOLOGY", "BIOMEDE", "BIOPHYS", "BIOSTAT", "CATALAN", "CEE", "CHE", "CHEM", "CJS", "CLARCH", "CLCIV", "CLIMATE", "CMPLXSYS", "COGSCI", "COMM", "COMP", "COMPLIT", "CSP", "CZECH", "DANCE", "DATASCI", "DIGITAL", "DUTCH", "EARTH", "EAS", "ECON", "EDCURINS", "EDUC", "EEB", "EECS", "ELI", "ENGLISH", "ENGR", "ENS", "ENSCEN", "ENVIRON", "ES", "ESENG", "FRENCH", "FTVM", "GEOG", "GERMAN", "GREEK", "GREEKMOD", "GTBOOKS", "HEBREW", "HISTART", "HISTORY", "HONORS", "HS", "HUMGEN", "INSTHUM", "INTLSTD", "INTMED", "IOE", "ISLAM", "ITALIAN", "JAZZ", "JUDAIC", "KINESLGY", "KRSTD", "LACS", "LATIN", "LATINOAM", "LING", "LSWA", "MACROMOL", "MATH", "MATSCIE", "MCDB", "MECHENG", "MEDCHEM", "MELANG", "MEMS", "MENAS", "MFG", "MICRBIOL", "MIDEAST", "MILSCI", "MKT", "MOVESCI", "MUSEUMS", "MUSICOL", "MUSMETH", "MUSTHTRE", "NATIVEAM", "NAVARCH", "NAVSCI", "NERS", "NURS", "ORGSTUDY", "PAT", "PATH", "PERSIAN", "PHARMACY", "PHARMSCI", "PHIL", "PHRMACOL", "PHYSICS", "PHYSIOL", "PIBS", "POLISH", "POLSCI", "PORTUG", "PPE", "PSYCH", "PUBHLTH", "PUBPOL", "QMSS", "RCARTS", "RCASL", "RCCORE", "RCHUMS", "RCIDIV", "RCLANG", "RCMUSIC", "RCNSCI", "RCSSCI", "REEES", "RELIGION", "ROMLANG", "ROMLING", "RUSSIAN", "SCAND", "SEAS", "SI", "SLAVIC", "SOC", "SPACE", "SPANISH", "STATS", "STDABRD", "STRATEGY", "TCHNCLCM", "THEORY", "THTREMUS", "TO", "TURKISH", "UARTS", "UC", "UKR", "URP", "WGS", "WRITING", "YIDDISH"];
var dataN = []
for (var i = 0; i < classes.length; i++) {
    dataN.push({
    ID: classes[i]
    });
}

d3.select('.form__field').on('keyup', onFilter);

function onFilter(){

    var filterText = d3.select('.form__field').property('value');
    filterText = filterText.toUpperCase()

    filteredData = dataN;
    if (filterText !== ""){
    var filteredData = dataN.filter(function(d){
        return (d.ID.indexOf(filterText) === 0);
    });
    }
    else{
    var filteredData = dataN.filter(function(d){
        return (d.ID.indexOf("MATH") === 0);
    });
    }
    
    search = filteredData[0].ID

    d3.select('.vis.dept_breakdown .figure__title').html(
        search + " Classes at UM"
    )

    update(search)
}

    var y = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);

    var yAxis = d3.axisRight(y)
        .tickSize(width)
        .tickFormat(function(d) {
            return numberWithCommas(d)*100 + "%"
        });

    var yGroup = svg.append("g")
        .call(customYAxis);

    function customYAxis(g) {
        var s = g.selection ? g.selection() : g;
        g.call(yAxis);
        s.select(".domain").remove();
        s.selectAll(".tick line").filter(Number).attr("stroke", "#c0c0c0").attr("stroke-dasharray", "2,2"); //add dashed horizontal lines
        s.selectAll(".tick text").attr("x", 4).attr("dy", -4);
        if (s !== g) g.selectAll(".tick text").attrTween("x", null).attrTween("dy", null);
    }

    var x = d3.scaleBand()
    .domain(["Online", "Hybrid", "In Person"])
    .range([30, width])
    .padding(0.1);

    var xAxis = d3.axisBottom(x)

    var xGroup = svg.append("g")
    .attr("transform", "translate(0," + height + ")") //move x-axis to bottom of graph
    .attr('class', 'axis')
    .call(customXAxis);

    function customXAxis(g) {
    g.call(xAxis);
    g.select(".domain").remove(); //remove bracket ticks
    }

    svg.selectAll(".mybar")
    .data(data)
    .enter()
    .append("rect")
        .attr("x", function(d) { return x(d.key); })
        .attr("y", function(d) { return y(d.value)})
        .attr("class", "mybar")
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.value) })
        .attr("fill", "#374567")
    

    function update(search){

    data = rawdata

    data = data.filter(function (d) {
        return d.dept === search;
    });

    data = preprocess(data)

    var u = svg.selectAll("rect")
        .data(data)

    u
    .enter()
    .append("rect")
    .merge(u)
    .transition()
    .duration(800)
    .attr("x", function(d) { return x(d.key); })
        .attr("y", function(d) { return y(d.value)})
        .attr("class", "mybar")
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.value) })
        .attr("fill", "#374567")
}

onFilter();
})