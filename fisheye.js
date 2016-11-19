var jsonfilegroups = {
    "name": "flare",
        "children": [{
          "name": "Overview",
          "children":[{
            "name": "Overview",
             "size": 97.4

        }]
        },{
        "name": "fossil",
              "children":[{
        "name": "fossil",
            "children":[{
              "name": "Fossil",
               "size": 79.3
        }, {
           "name": "Coal",
              "size": 15.6

        }, {
          "name": "Petrleum",
              "size": 36.0
        }, {
            "name": "Natrural Gas",
              "size": 28.1

         }]
         }]
        }, {
            "name": "Rewable",
            "children": [{
            "name": "Rewable Energy",
            "children": [{
                "name": "Rewable Energy",
                    "size": 9.6
            }, {
              "name": "Hydroelectric Power",
                  "size": 2.4
            }, {
              "name": "Geothermal Energy",
                "size": 0.2
            }, {
              "name": "Solar Energy",
                "size": 0.4
            }, {
              "name": "Wind Energy",
                "size": 1.8
              }, {
                "name": "Biomass Energy",
                  "size": 0.2
            }]
            }]
        }, {
            "name": "Nutricl power",
            "children": [{
            "name": "Nutricl power",
                "size": 8.3
        }]

    }]
};
var link = {
  "Overview":"file:///Users/Byanka/Documents/stack_group/index.html",
  "Fossil":"file:///Users/Byanka/Documents/visual_d3/index.html"};

console.log(jsonfilegroups);
var diameter = 500,
    format = d3.format(",d"),
    color = d3.scale.category10();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

var fisheye = d3.fisheye.circular().radius(120);

var svg = d3.select("#area2").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

//d3.json("flare.json", function (error, root) {
var root = jsonfilegroups;

var node = svg.selectAll(".node")
    .data(bubble.nodes(classes(root))
    .filter(function (d) {
    return !d.children;
}))
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function (d) {
    return "translate(" + d.x + "," + d.y + ")";
});

node.append("title")
    .text(function (d) {
    return d.className + ": " + format(d.value);
});

node.append("a")
    .attr("xlink:href",function (d) {
    return link[d.className];})
    .append("circle")
    .attr("r", function (d) {
    return d.r;
})
    .style("fill", function (d) {
    return color(d.packageName);
});

node.append("text")
    .attr("dy", ".3em")
    .style("text-anchor", "middle")
    .text(function (d) {
    return d.className.substring(0, d.r );
});

svg.on("mousemove", function () {
    fisheye.focus(d3.mouse(this));

    node.each(function (d) {
        d.fisheye = fisheye(d);
    });

     node.selectAll("circle")
          .attr("cx", function(d) { return d.fisheye.x - d.x; })
          .attr("cy", function(d) { return d.fisheye.y - d.y; })
          .attr("r", function(d) { return d.fisheye.z * d.r; });

      node.selectAll("text")
          .attr("dx", function(d) { return d.fisheye.x - d.x; })
          .attr("dy", function(d) { return d.fisheye.y - d.y; });
});

// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
    var classes = [];

    function recurse(name, node) {
        if (node.children) node.children.forEach(function (child) {
            recurse(node.name, child);
        });
        else classes.push({
            packageName: name,
            className: node.name,
            value: node.size
        });
    }

    recurse(null, root);
    return {
        children: classes
    };
}

d3.select(self.frameElement).style("height", diameter + "px");
