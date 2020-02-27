/* global Handlebars:true, moment:true */

import pym from 'pym.js';

import getResults from './get-results';
import joinData from './join-race-data';

const pymChild = new pym.Child();

const baseURL = 'https://s3.amazonaws.com/elections.dallasnews.com/super-tuesday-2020-test-0227/2020-03-03';
const displayedParties = ['D', 'D', 'R'];
const displayedRaces = ['51c9f158', '63f147ad', 'c19fee2e'];

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

function determineRunoff(race, candidates, candidateID) {
  // check to see if there's a majority winner, if there is, we won't mark a runoff
  const majWinner = candidates.filter(can => can.votePercent >= 0.5001);

  // takes in a list of candidates ordered by vote totals, and a candidateID, and returns true
  // if that candidate is in the top two in vote totals race wide
  const candidateIndex = candidates.findIndex(candidate => candidate.id === candidateID);
  if (candidateIndex <= 1 && 
      race.eligibleForRunoff === true && 
      race.precinctsReportingPct === 1 && 
      majWinner.length === 0) {
    return true;
  } return false;
}

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
      displayedRaces.reverse();
      displayedRaces.forEach((raceID) => {
        const i = results.findIndex(race => race.id === raceID);
        const reorderedRace = results.splice(i, 1)[0];
        results.splice(0, 0, reorderedRace);
      });

      results.forEach((race, i) => {
        if (displayedParties && displayedParties.length > 0) {
          race.party = displayedParties[i];
        } 
        race.candidates.forEach((candidate) => {
          candidate.advancesToRunoff = determineRunoff(race, race.candidates, candidate.id);
        });
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
            race.candidates.forEach((candidate) => {
              candidate.advancesToRunoff = determineRunoff(race, race.candidates, candidate.id);
            });
            const html = template(race);
            document.getElementById('results').innerHTML += html;
          });

          pymChild.sendHeight();
        });
      }, 300000);
    });
});

pymChild.sendHeight();
