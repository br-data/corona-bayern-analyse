import './map.scss';
import { select } from 'd3';
import { geoPath, geoMercator } from 'd3';
import { scaleSqrt } from 'd3';

document.addEventListener('DOMContentLoaded', init, false);

async function init() {
  const timelineDataPromise = loadTimelineData()
    .then(({ default: data }) => data);
  const metaDataPromise = loadMetaData()
    .then(({ default: data }) => data);
  const geoDataPromise = loadGeoData()
    .then(({ default: data }) => data);
  const [timelineData, metaData, geoData] = await Promise.all([timelineDataPromise, metaDataPromise, geoDataPromise]);

  const container = select('.map');
  const dateCounter = select('.date');

  const bounds = container.node().getBoundingClientRect();
  const width = bounds.width;
  const height = bounds.height;

  const scale = scaleSqrt()
    .domain([0, 100])
    .range([3, 12]);

  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', '0 0 ' + width + ' ' + height);

  const projection = geoMercator()
    .translate([width/2, height/2])
    .scale(5000)
    .center([11.4, 48.9]);
  const path = geoPath().projection(projection);

  svg.append('path')
    .attr('d', path(geoData))
    .attr('fill', '#6A6E7F')
    .attr('stroke', '#3A3C49')
    .attr('stroke-width', 1.5);

  for (let data of timelineData) {
    const mergedData = data.map(d => {
      const meta = metaData.filter(md => md.ags === d.ags)[0];
      return Object.assign({}, d, meta);
    })

    const circleUpdate = svg.selectAll('circle')
      .data(mergedData, d => d.ags)
        .attr('fill', 'orange')
        .attr('fill-opacity', 0.75)
        .attr('r', d => d.valuePer100Tsd ? scale(d.valuePer100Tsd) : 0)

    const circleEnter = circleUpdate
      .enter()
      .append('circle')
        .attr('fill', 'green')
        .attr('cx', d => projection([d.long, d.lat])[0])
        .attr('cy', d => projection([d.long, d.lat])[1]);

    const circleExit = circleUpdate.exit().remove();

    circleEnter.merge(circleUpdate)
        .attr('x', (d, i) => i * 16);

    dateCounter.text(data[0].date);

    await sleep(500)
  }

  // handleUpdate();

  // let timeout;
  // window.onresize = () => {
  //   clearTimeout(timeout);
  //   timeout = setTimeout(() => {
  //     handleUpdate();
  //   }, 200);
  // };
}

async function loadTimelineData() {
  return await import(/* webpackChunkName: 'timeline-data' */ '../data/bayern-timeline.json');
}

async function loadMetaData() {
  return await import(/* webpackChunkName: 'timeline-data' */ '../data/bayern-meta.json');
}

async function loadGeoData() {
  return await import(/* webpackChunkName: 'geo-data' */ '../data/bayern-counties.geo.json');
}

async function sleep(milliseconds) {
  return new Promise(resolve  => {
    setTimeout(() => {
      resolve(true);
    }, milliseconds);
  });
}

