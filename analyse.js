const fs = require('fs');
// const utils = require('./utils');

const caseData = require('./data/bayern-cases.json');
const metaData = require('./data/bayern-meta.json');

const dates = [...new Set(caseData.map(datum => datum.date))].sort((a, b) => new Date(b.date) - new Date(a.date));
// const casesByDay = dates.map(date => caseData.filter(datum => datum.date === date));
const casesByWeek = aggregateByWeek(caseData, dates);
const casesByWeekAndCounty = aggregateByCounty(casesByWeek);

const over35Cases = casesByWeekAndCounty.flat().reduce((acc, curr) => {
  acc[curr.Landkreis] = acc[curr.Landkreis] || {};
  
  if (curr.valuePer100Tsd >= 35) {
    acc[curr.Landkreis].over35 = acc[curr.Landkreis].over35 || 0;
    acc[curr.Landkreis].over35 += 1;
  }

  if (curr.valuePer100Tsd >= 50) {
    acc[curr.Landkreis].over50 = acc[curr.Landkreis].over50 || 0;
    acc[curr.Landkreis].over50 += 1;
  }

  return acc;
}, {});

const over35CasesFlat = Object.keys(over35Cases).map(d => {
  return Object.assign({}, { name: d }, over35Cases[d])
});

function aggregateByWeek(caseData, dates) {
  return dates.reduce((weeks, date) => {
    const week = caseData.filter(datum => datum.date === date)
    weeks[weeks.length-1].push(...week);

    // News week starts on Monday
    if (new Date(date).getDay() === 0) {
      weeks.push([]);
    }

    return weeks;
  }, [[]]);
}

function aggregateByCounty(casesByWeek) {
  return casesByWeek.reduce((weeks, week) => {
    const counties = [...new Set(week.map(datum => datum.Landkreis))];
    const aggregation = counties.map(county => {
      const countyMeta = metaData.filter(datum => datum.rkiName === county)[0];
      const countyCases = week.filter(datum => datum.Landkreis === county);
      const countySum = countyCases.reduce((sum, date) => sum + date.value, 0);
      return Object.assign({}, countyCases[0], {
        value: countySum,
        valuePer100Tsd: Math.round((countySum * 100000) / countyMeta.pop)
      });
    })
    
    weeks.push(aggregation.sort((a, b) => b.valuePer100Tsd - a.valuePer100Tsd));
    
    return weeks;
  }, []);
}

function toCsv(json) {
  let csv = '';

  json.forEach(arr => {
    arr.forEach(obj => {
      csv += [obj.date, obj.Landkreis, obj.value, obj.valuePer100Tsd].join(',');
      csv += ','
    })
    csv += '\n'
  })

  console.log(csv);
  

  return csv;
}