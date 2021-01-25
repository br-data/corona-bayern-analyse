import './map.scss';
import { select } from 'd3-selection';
import { max } from 'd3-array';
import { geoPath, geoMercator } from 'd3-geo';
import { scaleSqrt } from 'd3-scale';
import 'd3-transition';

let timelineData, metaData, geoData;
let playButton, resetButton, dateInput, dateElement, tooltipElement;
let map, projection, scale, animation, timeout;

(async function init() {
  const timelineDataPromise = loadTimelineData()
    .then(({ default: data }) => data);
  const metaDataPromise = loadMetaData()
    .then(({ default: data }) => data);
  const geoDataPromise = loadGeoData()
    .then(({ default: data }) => data);
  [timelineData, metaData, geoData] = await Promise.all([timelineDataPromise, metaDataPromise, geoDataPromise]);

  registerEvents();
  draw();
})();

function draw() {
  const container = select('.app');
  container.select('svg.map').remove();

  const bounds = container.node().getBoundingClientRect();
  const width = bounds.width;
  const height = bounds.height;

  const maxValue = max(timelineData.map(td => max(td, d => d.valuePer100Tsd)));

  scale = scaleSqrt()
    .domain([0, maxValue])
    .range([3, 20]);

  projection = geoMercator()
    .translate([width/2, height/2])
    .scale((width > 600) ? 4500 : 4000)
    .center((width > 600) ? [10.4, 48.9] : [11.4, 49.1]);

  const path = geoPath().projection(projection);

  const svg = container.append('svg')
    .attr('class', 'map')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  map = svg.append('g');

  map.append('path')
    .attr('d', path(geoData))
    .attr('fill', '#6A6E7F')
    .attr('stroke', '#3A3C49')
    .attr('stroke-width', 1.5);

  animation = new AnimationControl();
  animation.start();
}

function update(data, index) {
  const mergedData = data.map(d => {
    const meta = metaData.filter(md => md.ags === d.ags)[0];
    return Object.assign({}, d, meta);
  });

  const circleUpdate = map.selectAll('circle')
    .data(mergedData, d => d.ags)
    .style('mix-blend-mode', 'hard-light')
    .on('mouseenter', handleMouseenter)
    .on('mouseleave', handleMouseleave);

  circleUpdate
    .transition()
    .duration(300)
    .attr('fill', d => getColor(d.valuePer100Tsd))
    .attr('r', d => d.valuePer100Tsd ? scale(d.valuePer100Tsd) : 0);

  circleUpdate
    .enter()
    .append('circle')
    .attr('cx', d => projection([d.long, d.lat])[0])
    .attr('cy', d => projection([d.long, d.lat])[1]);

  dateElement.text(germanDate(data[0].date));
  dateInput.property('value', index);
}

function registerEvents() {
  playButton = select('.play-button');
  playButton.on('click', handlePlay);

  resetButton = select('.reset-button');
  resetButton.on('click', handleReset);

  dateInput = select('.date-input');
  dateInput.on('input', handleInput);

  dateElement = select('.date');
  tooltipElement = select('.tooltip');

  select(window).on('resize', handleResize);
}

function handlePlay() {
  if (playButton.classed('playing')) {
    playButton.classed('playing', false);
    animation.stop();
  } else {
    playButton.classed('playing', true);
    animation.start();
  }
}

function handleReset() {
  animation.stop();
  setTimeout(() => {
    animation.set(0);
    animation.start();
  }, 300);
}

function handleInput() {
  const value = parseInt(dateInput.property('value'));
  update(timelineData[value], value);
  animation.stop();
  animation.set(value);
  playButton.classed('playing', false);
}

function handleMouseenter() {
  const d = select(this).datum();

  if (animation.status().isPlaying === false) {
    tooltipElement.style('opacity', 1);
    tooltipElement.style('left', `${projection([d.long, d.lat])[0] - 120}px`);
    tooltipElement.style('top', `${projection([d.long, d.lat])[1] - 120}px`);
    tooltipElement.html(`<span><strong>${d.name} (${d.type}):</strong> ${d.valuePer100Tsd} ${d.valuePer100Tsd > 1 ? 'neue Fälle' : 'neuer Fall'} pro 100.000 Einwohner in den vergangenen 7 Tagen</span>`);
  }
}

function handleMouseleave() {
  tooltipElement.style('opacity', 0);
}

function handleResize() {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    animation.stop();
    animation.set(0);
    draw();
  }, 300);
}

function AnimationControl() {
  let isPlaying = false;
  let maxIndex = timelineData.length;
  let currentIndex = 0;

  function tick(index) {
    if (index < maxIndex && isPlaying) {
      update(timelineData[index], index);
      currentIndex = ++index;
      setTimeout(() => tick(currentIndex), 300);
    } else if (isPlaying) {
      currentIndex = 0;
      setTimeout(() => tick(currentIndex), 300);
    }
  }

  function set(newIndex) {
    currentIndex = newIndex;
  }

  function start() {
    isPlaying = true;
    tick(currentIndex);
  }

  function stop() {
    isPlaying = false;
  }

  function status() {
    return { isPlaying, currentIndex };
  }

  return { set, start, stop, status };
}

function getColor(value) {
  if (value >= 200) {
    // dark red
    return '#bd0026';
  } else if (value >= 50) {
    // red
    return '#f03b20';
  } else if (value >= 35) {
    // orange
    return '#feb24c';
  } else {
    // yellow
    return '#ffeda0';
  }
}

function germanDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);

  return date.toLocaleDateString('de-DE', options);
}

async function loadTimelineData() {
  return await import(/* webpackChunkName: 'timeline-data' */ '../data/bayern-timeline.json');
}

async function loadMetaData() {
  return await import(/* webpackChunkName: 'meta-data' */ '../data/bayern-meta.json');
}

async function loadGeoData() {
  return await import(/* webpackChunkName: 'geo-data' */ '../data/bayern-counties.geo.json');
}
