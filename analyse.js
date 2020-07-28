const fs = require('fs');
// const utils = require('./utils');

const caseData = require('./data/bayern-cases.json');
const metaData = require('./data/bayern-meta.json');

const dates = [...new Set(caseData.map(datum => datum.date))].sort((a, b) => new Date(b.date) - new Date(a.date));

// Aggregate cases by day
const casesByDay = dates.map(date => caseData.filter(datum => datum.date === date));
const casesByDayAndCounty = casesByDay.map(day => {
  return day.map(county => {
    const countyMeta = metaData.filter(datum => datum.rkiName === county.Landkreis)[0];
    // return Object.assign({}, county, countyMeta);
    return {
      ags: countyMeta.ags,
      date: county.date,
      value: county.value,
      valuePer100Tsd: Math.round((county.value * 100000) / countyMeta.pop)
    }
  });
});

fs.writeFileSync('./data/bayern-timeline-daily.json', JSON.stringify(casesByDayAndCounty));

// Aggregate cases by week
// const casesByWeek = aggregateByWeek(caseData, dates);
// const casesByWeekAndCounty = aggregateByCounty(casesByWeek);

// function aggregateByWeek(caseData, dates) {
//   return dates.reduce((weeks, date) => {
//     const week = caseData.filter(datum => datum.date === date)
//     weeks[weeks.length-1].push(...week);

//     // News week starts on Monday
//     if (new Date(date).getDay() === 0) {
//       weeks.push([]);
//     }

//     return weeks;
//   }, [[]]);
// }

// function aggregateByCounty(casesByWeek) {
//   return casesByWeek.reduce((weeks, week) => {
//     const counties = [...new Set(week.map(datum => datum.Landkreis))];
//     const aggregation = counties.map(county => {
//       const countyMeta = metaData.filter(datum => datum.rkiName === county)[0];
//       const countyCases = week.filter(datum => datum.Landkreis === county);
//       const countySum = countyCases.reduce((sum, date) => sum + date.value, 0);

//       return {
//         ags: countyMeta.ags,
//         date: countyCases[0].date,
//         value: countySum,
//         valuePer100Tsd: Math.round((countySum * 100000) / countyMeta.pop)
//       };
//     })

//     weeks.push(aggregation.sort((a, b) => b.valuePer100Tsd - a.valuePer100Tsd));

//     return weeks;
//   }, []);
// }

// fs.writeFileSync('./data/bayern-timeline-weekly.json', JSON.stringify(casesByWeekAndCounty));
