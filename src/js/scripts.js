/* global Handlebars:true, moment:true */

import pym from 'pym.js';

import getResults from './get-results';
import joinData from './join-race-data';

const pymChild = new pym.Child();

const baseURL = 'https://s3.amazonaws.com/elections.dallasnews.com/super-tuesday-2020-test-0219/2020-03-03';
const displayedRaces = ['4f39e027', '3f816448', '8724915e'];
const electionName = '2020 Super Tuesday primaries';
const electionLink = 'https://interactives.dallasnews.com/2020/super-tuesday-2020-elections';

document.getElementById('election-name').innerText = electionName;
document.getElementById('election-link').setAttribute('href', electionLink);

const racesURL = `${baseURL}/races.json`;
const candidatesURL = `${baseURL}/candidates.json`;

let results;
// adds commas to numbers larger than 999
Handlebars.registerHelper('formatNumber', (n) => {
  const parts = n.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
});

// formats vote percentages into readable style (i.e. .923 -> 92.3)
Handlebars.registerHelper('formatPercent', n => (n * 100).toFixed(1));

// formats party name down to first letter
Handlebars.registerHelper('partyAbrev', n => n.charAt(0));

// limits number of candidates shown in results to specified limit
Handlebars.registerHelper('limit', (arr, limit) => {
  if (!Array.isArray(arr)) {
    return [];
  } return arr.slice(0, limit);
});

Handlebars.registerHelper('formatDateTime', (dt => moment(dt).format('hh:mm a, MMM D, YYYY')));

// compiling our handlebars templates
const source = document.getElementById('results-template').innerHTML;
const template = Handlebars.compile(source);


// fetch the list of races for this election, then filter those races
// down to the targetRace passed in the url
const races = fetch(racesURL)
  .then(response => response.json())
  .then(json => json.filter(race => displayedRaces.includes(race.id)))
  .catch(err => console.log(err));

// fetch the candidates for this election
const candidates = fetch(candidatesURL)
  .then(response => response.json())
  .catch(err => console.log(err));

// once the races and candidates have been fetched ...
Promise.all([races, candidates]).then((responses) => {
  const [raceList, candidateList] = responses;

  // ... join those two data files together ... 
  joinData(baseURL, raceList, candidateList)
    .then(compiledData => getResults(compiledData)) // ... then get the results for that compiled data
    .then((initialResults) => {
      results = initialResults;
      // fill in the race name

      results.forEach((race) => {
        const html = template(race);
        document.getElementById('results').innerHTML += html;
      });

      // redraw the embed
      pymChild.sendHeight();

      // set an interval to fetch new data every 3 minutes
      setInterval(() => {
        getResults(results).then((updatedResults) => {
          results = updatedResults;

          document.getElementById('results').innerHTML = '';
          results.forEach((race) => {
            const html = template(race);
            document.getElementById('results').innerHTML += html;
          });

          pymChild.sendHeight();
        });
      }, 180000);
    });
});

pymChild.sendHeight();
