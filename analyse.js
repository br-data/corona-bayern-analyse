const fs = require('fs');

const caseData = require('./data/bayern-cases.json');
const metaData = require('./data/bayern-meta.json');

const days = [...new Set(caseData.map(datum => datum.date))].sort((a, b) => new Date(b.date) - new Date(a.date));

// Aggregate cases by day and week
const weeklyCasesByDay = days.map(date => caseData.filter(datum => datum.date === date));
const weeklyCasesByDayAndCounty = weeklyCasesByDay.map((day, index) => {
  const offset = (index < 7) ? index : 7;
  const currentWeek = weeklyCasesByDay.slice(
    index - offset,
    index
  );

  return day.map(county => {
    const countyMeta = metaData.filter(datum => datum.rkiName === county.Landkreis)[0];
    const countyCases = currentWeek.flat().filter(datum => datum.Landkreis === county.Landkreis);
    const countyCasesSum = countyCases.reduce((sum, curr) => (sum += curr.value), 0);
    const casesPer100Tsd = Math.round((countyCasesSum * 100000) / countyMeta.pop);

    // return Object.assign({}, county, countyMeta);
    return {
      ags: countyMeta.ags,
      date: county.date,
      value: countyCasesSum,
      valuePer100Tsd: casesPer100Tsd
    };
  });
});

fs.writeFileSync('./data/bayern-timeline.json', JSON.stringify(weeklyCasesByDayAndCounty));

// // Aggregate cases by day
// const casesByDay = days.map(date => caseData.filter(datum => datum.date === date));
// const casesByDayAndCounty = casesByDay.map(day => {
//   return day.map(county => {
//     const countyMeta = metaData.filter(datum => datum.rkiName === county.Landkreis)[0];
//     // return Object.assign({}, county, countyMeta);
//     return {
//       ags: countyMeta.ags,
//       date: county.date,
//       value: county.value,
//       valuePer100Tsd: Math.round((county.value * 100000) / countyMeta.pop)
//     };
//   });
// });

// fs.writeFileSync('./data/bayern-timeline-daily.json', JSON.stringify(casesByDayAndCounty));


// // Aggregate cases by week
// const casesByWeek = aggregateByWeek(caseData, days);
// const casesByWeekAndCounty = aggregateByCounty(casesByWeek);

// function aggregateByWeek(caseData, days) {
//   return days.reduce((weeks, date) => {
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
//       // return Object.assign({}, countyCases[0], {});
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
