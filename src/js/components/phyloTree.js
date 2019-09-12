/* eslint-disable require-jsdoc */
const util = require('../util');
const d3 = require('d3');

let margin = {top: 30, right: 20, bottom: 30, left: 20};
let width = 960;
let barHeight = 20;
let barWidth = (width - margin.left - margin.right) * 0.3;

let i = 0;
let duration = 400;
let root;

let diagonal = d3.linkHorizontal().x(function(d) {
    return d.y;
}).y(function(d) {
    return d.x;
});

function color(d) {
    let color;
    if (!d._children && !d.children) {
        if (d.data.type === 'MAG') {
            color = '#D70500';
        } else {
            color = '#D79100';
        }
    } else {
        color = '#007C82';
    }
    return color;
}

function getResetButton() {
    return $('<button id="reset-tree-btn" class="button">Reset</button>');
}

function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

module.exports = class PhyloTree {
    constructor(containerID, url) {
        const resetBtn = getResetButton();
        $('#' + containerID).empty();
        $('#' + containerID).append(resetBtn);
        let svg = d3.select('#' + containerID)
                    .append('svg').attr('width', width) // + margin.left + margin.right)
            .append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        function update(source) {
            // Compute the flattened node list.
            let nodes = root.descendants();

            let height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

            d3.select('svg').transition().duration(duration).attr('height', height);

            d3.select(self.frameElement)
                .transition()
                .duration(duration)
                .style('height', height + 'px');

            // Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
            let index = -1;
            root.eachBefore(function(n) {
                n.x = ++index * barHeight;
                n.y = n.depth * 20;
            });

            // Update the nodes…
            let node = svg.selectAll('.node').data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });

            let nodeEnter = node.enter()
                .append('g')
                .attr('class', 'node')
                .attr('transform', function(d) {
                    return 'translate(' + source.y0 + ',' + source.x0 + ')';
                })
                .style('opacity', 0);

            // Enter any new nodes at the parent's previous position.
            nodeEnter.append('rect')
                .attr('y', -barHeight / 2)
                .attr('height', barHeight)
                .attr('width', barWidth)
                .attr('class', 'entry')
                .style('fill', color)
                .on('click', click);

            nodeEnter.append('text').attr('dy', 3.5).attr('dx', 5.5).text(function(d) {
                d = d.data;
                const name = util.cleanTaxLineage(d.name) || 'Unknown';
                if (['root', 'Isolate', 'MAG'].indexOf(d.type) > -1) {
                    return name + ' (' + d.type + ')';
                } else {
                    const count = (d.countgen || d.coungen); // TODO: fix coungen
                    if (count <= 1 && name.startsWith('MGYG-')) {
                        return name;
                    } else {
                        return name + ' (' + count + ')';
                    }
                }
            });

            // Transition nodes to their new position.
            nodeEnter.transition()
                .duration(duration)
                .attr('transform', function(d) {
                    return 'translate(' + d.y + ',' + d.x + ')';
                })
                .style('opacity', 1);

            node.transition()
                .duration(duration)
                .attr('transform', function(d) {
                    return 'translate(' + d.y + ',' + d.x + ')';
                })
                .style('opacity', 1)
                .select('rect')
                .style('fill', color);

            // Transition exiting nodes to the parent's new position.
            node.exit()
                .transition()
                .duration(duration)
                .attr('transform', function(d) {
                    return 'translate(' + source.y + ',' + source.x + ')';
                })
                .style('opacity', 0)
                .remove();

            // Update the links…
            let link = svg.selectAll('.link').data(root.links(), function(d) {
                return d.target.id;
            });

            // Enter any new links at the parent's previous position.
            link.enter().insert('path', 'g').attr('class', 'link').attr('d', function(d) {
                let o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            }).transition().duration(duration).attr('d', diagonal);

            // Transition links to their new position.
            link.transition().duration(duration).attr('d', diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition().duration(duration).attr('d', function(d) {
                let o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            }).remove();

            // Stash the old positions for transition.
            root.each(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        // Toggle children on click.
        function click(d) {
            const name = d.data.name;
            if (d.children == null && d._children == null && (name.substring(0, 3) == 'MGY')) {
                window.open(util.subfolder + '/genomes/' + name);
            }
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            if (d.children && d.children.length === 1 && d.children[0]['type'] !== 'genome' &&
                d.children[0]._children) {
                update(d);
                click(d.children[0]);
            }
            update(d);
        }

        const that = this;
        d3.json(url, function(error, flare) {
            if (error) {
                console.error(error);
                throw error;
            }

            root = d3.hierarchy(flare);

            that.root = root;

            root.x0 = 0;
            root.y0 = 0;

            root.children.forEach(collapse);
            update(root);
        });

        function collapseAll() {
            that.root.children.forEach(collapse);
            update(root);
        }

        resetBtn.click(collapseAll);
    }
};
