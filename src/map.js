import './map.scss';
import { select } from 'd3';
import { geoPath, geoMercator } from 'd3';

document.addEventListener('DOMContentLoaded', init, false);

async function init() {
  const timelineDataPromise = loadTimelineData()
    .then(({ default: data }) => data);
  const geoDataPromise = loadGeoData().then(({ default: data }) => data);
  const [timelineData, geoData] = await Promise.all([timelineDataPromise, geoDataPromise]);

  const container = select('#map');

  const bounds = container.node().getBoundingClientRect();
  const width = bounds.width;
  const height = bounds.height;

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
    .attr('fill', 'black')
    .attr('stroke', 'white');


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
  return await import(/* webpackChunkName: "timeline-data" */ '../data/bayern-timeline.json');
}

async function loadGeoData() {
  return await import(/* webpackChunkName: "geo-data" */ '../data/bayern-counties.geo.json');
}
