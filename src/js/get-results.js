export default function (raceData) {

  return new Promise((resolve, reject) => {
    // set up a variable to map all of the race fetches too. 
    const resultsFetches = raceData.map((race) => {
      // fetch the new results for each race
      return fetch(`https://s3.amazonaws.com/elections.dallasnews.com${race.url}`)
        .then(response => response.json())
        .then((data) => {
          // assign the returned data to the race
          Object.assign(race, data);
          // iterate over each candidate in the race.candidates array
          race.candidates.forEach((candidate) => {
            // find the index of that candidate in the new data
            const resultIndex = data.candidateTotals.findIndex(total => total.candidateId === candidate.id);
            if (resultIndex === -1) {
              // if the index is -1, then the candidate did candidate did not exist in the fetched data
              reject(Error('Could not find candidate results'));
            } else {
              // else, assign the candidate data to the candidate object in the race
              Object.assign(candidate, data.candidateTotals[resultIndex]);
            }
          });
          // sort the race's candidates by total votes
          race.candidates.sort((a, b) => b.votes - a.votes);
        });
    });

    // once all the results fetches have resolved, return the raceData. This is returned to scripts.js,
    // where it's assigned as updated results to the app's results key
    Promise.all(resultsFetches)
      .then(() => {
        resolve(raceData);
      });
  });
}
