import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const GraphD3 = ({ sampleBuffer, dataStats }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!dataStats || sampleBuffer.current.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Define dimensions and margins
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };

    // Define scales
    const xScale = d3
      .scaleLinear()
      .domain([0, sampleBuffer.current.length - 1])
      .range([margin.left, width - margin.right]);

    // Set yScale to start from 0.3
    const yScale = d3
      .scaleLinear()
      .domain([dataStats.min, dataStats.max]) // Start from 0.3 instead of dataStats.min
      .range([height - margin.bottom, margin.top]);

    // const yScale = d3
    //   .scaleLinear()
    //   .domain([
    //     dataStats.min - (dataStats.max - dataStats.min) / 0.1, // 10% below min
    //     dataStats.max + (dataStats.max - dataStats.min) / 0.1, // 10% above max
    //   ])
    //   .range([height - margin.bottom, margin.top]);
    // Define line generator
    const line = d3
      .line()
      .x((d, i) => xScale(i))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // const line = d3
    //   .line()
    //   .x((d, i) => xScale(i))
    //   .y((d) => yScale(Math.pow(d.value * 5, 0.8))) // Multiply and adjust with exponent
    //   .curve(d3.curveMonotoneX);
    // Add a clipping path to prevent overflow
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom);

    // Append path element and bind data within clip path
    svg
      .append("path")
      .datum(sampleBuffer.current)
      .attr("clip-path", "url(#clip)")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add X-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(5));

    // Add Y-axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5));
  }, [dataStats, sampleBuffer]);

  return (
    <svg
      ref={svgRef}
      style={{ width: "100%", height: "200px" }} // Adjust as needed
    ></svg>
  );
};

export default GraphD3;
