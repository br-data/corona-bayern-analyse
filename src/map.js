import './map.scss';
import { select } from 'd3-selection';
import { geoPath, geoMercator } from 'd3-geo';
import { scaleSqrt } from 'd3-scale';
import 'd3-transition';

document.addEventListener('DOMContentLoaded', init, false);

async function init() {
  const timelineDataPromise = loadTimelineData()
    .then(({ default: data }) => data);
  const metaDataPromise = loadMetaData()
    .then(({ default: data }) => data);
  const geoDataPromise = loadGeoData()
    .then(({ default: data }) => data);
  const [timelineData, metaData, geoData] = await Promise.all([timelineDataPromise, metaDataPromise, geoDataPromise]);

  const playButton = select('.play-button')
    .on('click', handlePlay);;
  const resetButton = select('.reset-button')
    .on('click', handleReset);;
  const dateInput = select('.date-input')
    .on('input', handleInput);;
  const dateCounterElement = select('.date');

  const container = select('.map');

  const bounds = container.node().getBoundingClientRect();
  const width = bounds.width;
  const height = bounds.height;

  const scale = scaleSqrt()
    .domain([0, 100])
    .range([3, 12]);

  const projection = geoMercator()
    .translate([width/2, height/2])
    .scale(4500)
    .center([11.4, 48.9]);

  const path = geoPath().projection(projection);

  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  const map = svg.append('g')

  map.append('path')
    .attr('d', path(geoData))
    .attr('fill', '#6A6E7F')
    .attr('stroke', '#3A3C49')
    .attr('stroke-width', 1.5);

  function update(data, index) {
    const mergedData = data.map(d => {
      const meta = metaData.filter(md => md.ags === d.ags)[0];
      return Object.assign({}, d, meta);
    })

    const circleUpdate = map.selectAll('circle')
      .data(mergedData, d => d.ags)
      .attr('fill-opacity', 0.75)
      .on('mouseenter', d => console.log(d))

    circleUpdate
      .transition()
      .duration(500)
      .attr('fill', d => {
        if (d.valuePer100Tsd >= 50) {
          return '#f03b20'; // red
        } else if (d.valuePer100Tsd >= 35) {
          return '#feb24c'; // orange
        } else {
          return '#ffeda0'; // yellow
        }
      })
      .attr('r', d => d.valuePer100Tsd ? scale(d.valuePer100Tsd) : 0);

    circleUpdate
      .enter()
      .append('circle')
      .attr('cx', d => projection([d.long, d.lat])[0])
      .attr('cy', d => projection([d.long, d.lat])[1]);

    dateCounterElement.text(toGermanDate(data[0].date));
    dateInput.property('value', index);
  }

  const animation = animationControl();
  animation.start();

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
    }, 500);
  }

  function handleInput() {
    const value = parseInt(dateInput.property('value'));
    update(timelineData[value], value);
    animation.stop();
    animation.set(value);
    playButton.classed('playing', false);
  }

  function animationControl() {
    let isPlaying = false;
    let maxIndex = timelineData.length;
    let currentIndex = 0;

    function tick(index) {
      if (index < maxIndex && isPlaying) {
        update(timelineData[index], index);
        currentIndex = ++index;
        // await sleep(500);
        setTimeout(() => tick(currentIndex), 500);
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

    return { set, start, stop }
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

function toGermanDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);

  return date.toLocaleDateString('de-DE', options);
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

