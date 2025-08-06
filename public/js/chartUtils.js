// chartUtils.js

export const renderMonthlyBarChart = (data, containerId) => {
  // Step 1: Preprocess - convert to { label: "8/2025", count: 3 }
  const processed = data.map(d => ({
    label: `${d._id.month}/${d._id.year}`,
    count: d.count
  }));

  const width = 400;
  const height = 250;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  const svg = d3
    .select(`#${containerId}`)
    .html("") // Clear previous content
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3
    .scaleBand()
    .domain(processed.map(d => d.label))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(processed, d => d.count)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Bars
  svg
    .append("g")
    .selectAll("rect")
    .data(processed)
    .join("rect")
    .attr("x", d => x(d.label))
    .attr("y", d => y(d.count))
    .attr("height", d => y(0) - y(d.count))
    .attr("width", x.bandwidth())
    .attr("fill", "#339966");

  // X Axis
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  // Y Axis
  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
};

export const loadMonthlyStats = async (userId) => {
  const res = await fetch(`/api/posts/user/${userId}/monthly-stats`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load user stats");
  return await res.json();
};

export const renderContributorBarChart = (data, containerId) => {
  // data: [{ username, count }, …]
  const processed = data.map(d => ({
    label: d.username,
    count: d.count
  }));

  const width = 400;
  const height = 250;
  const margin = { top: 20, right: 20, bottom: 60, left: 60 };

  const svg = d3
    .select(`#${containerId}`)
    .html("") 
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3
    .scaleBand()
    .domain(processed.map(d => d.label))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(processed, d => d.count)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg
    .append("g")
    .selectAll("rect")
    .data(processed)
    .join("rect")
    .attr("x", d => x(d.label))
    .attr("y", d => y(d.count))
    .attr("height", d => y(0) - y(d.count))
    .attr("width", x.bandwidth())
    .attr("fill", "#339966");

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
};

export const loadGroupStats = async (groupId) => {
  console.log('chartutil: groupId', groupId);
  const res = await fetch(`/api/groups/${groupId}/stats`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to load group stats');
  return await res.json(); // 
};