"use client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function DependencyGraph({ tasks }) {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width,
          height: 500, // Fixed height of 500px
        });
      }
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Draw the graph
  useEffect(() => {
    if (!tasks || tasks.length === 0 || !svgRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const { width, height } = dimensions;

    // Create the SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("border", "1px solid #ccc")
      .style("border-radius", "8px")
      .style("background", "#f8f9fa");

    // Add arrow marker for directed graph
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 30) // Position slightly away from node
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");

    // Prepare data
    const nodes = tasks.map((task) => ({
      id: task._id,
      title:
        task.title.length > 15
          ? task.title.substring(0, 13) + "..."
          : task.title,
      fullTitle: task.title,
      status: task.status,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toLocaleDateString()
        : "No date",
    }));

    const links = tasks
      ?.flatMap((task) =>
        (task.dependencies || [])?.map((dep) => ({
          source: dep?._id || "", // The dependency is the source
          target: task?._id, // The current task is the target (depends on source)
        }))
      )
      .filter((link) => link.source && link.target); // Remove any invalid links

    // Force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(120)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(40)); // Prevent node overlap

    // Create a group for links
    const linkGroup = svg.append("g").attr("class", "links");

    // Add links
    const link = linkGroup
      .selectAll(".link")
      .data(links)
      .enter()
      .append("line")
      .attr("class", "link")
      .style("stroke", "#999")
      .style("stroke-width", 2)
      .style("stroke-dasharray", "4")
      .attr("marker-end", "url(#arrowhead)");

    // Create a group for all nodes and their labels
    const nodeGroup = svg.append("g").attr("class", "nodes");

    // Create node groups
    const nodeContainer = nodeGroup
      .selectAll(".node-container")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node-container")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Status color function
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case "completed":
          return "#10b981"; // Green
        case "in-progress":
          return "#3b82f6"; // Blue
        case "pending":
          return "#f59e0b"; // Amber
        default:
          return "#ef4444"; // Red
      }
    };

    // Add node circles
    const node = nodeContainer
      .append("circle")
      .attr("r", 30)
      .style("fill", (d) => getStatusColor(d.status))
      .style("stroke", "#fff")
      .style("stroke-width", 2)
      .style("cursor", "grab")
      .style("filter", "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))");

    // Add text backgrounds for better readability
    nodeContainer
      .append("rect")
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("x", -40)
      .attr("y", 32)
      .attr("width", 80)
      .attr("height", 20)
      .attr("fill", "white")
      .attr("fill-opacity", 0.8);

    // Add node labels
    const labels = nodeContainer
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", 45)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .style("fill", "#333")
      .text((d) => d.title);

    // Add tooltips
    nodeContainer
      .append("title")
      .text((d) => `${d.fullTitle}\nStatus: ${d.status}\nDue: ${d.dueDate}`);

    // Simulation tick function
    simulation.on("tick", () => {
      // Keep nodes within bounds
      nodes.forEach((d) => {
        d.x = Math.max(40, Math.min(width - 40, d.x));
        d.y = Math.max(40, Math.min(height - 40, d.y));
      });

      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      nodeContainer.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
      d3.select(this).select("circle").style("cursor", "grabbing");
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
      d3.select(this).select("circle").style("cursor", "grab");
    }

    // Legend
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(20, ${height - 100})`);

    const statuses = ["completed", "in-progress", "pending", "not-started"];
    const statusLabels = ["Completed", "In Progress", "Pending", "Not Started"];

    statuses.forEach((status, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 25})`);

      g.append("circle").attr("r", 8).attr("fill", getStatusColor(status));

      g.append("text")
        .attr("x", 15)
        .attr("y", 5)
        .style("font-size", "12px")
        .text(statusLabels[i]);
    });

    // Zoom functionality
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        svg.selectAll(".links, .nodes").attr("transform", event.transform);
      });

    svg.call(zoom);

    // Cleanup
    return () => simulation.stop();
  }, [tasks, dimensions]);

  return (
    <div className="w-full relative p-4" ref={containerRef}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Task Dependency Graph</h3>
        <div className="text-sm text-gray-500">
          Drag nodes to rearrange. Zoom with mouse wheel.
        </div>
      </div>
      <div className="flex justify-center items-center w-full overflow-hidden">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
        ></svg>
      </div>
    </div>
  );
}
