export default function (baseURL, raceList, candidateList) {
  // ---------------------------------------------------------------------------
  // JOINING THE DATA INTO ONE ARRAY

  // Below collects comprehensive list of race ids, along with combining the
  // candidates with the individual races.
  // ---------------------------------------------------------------------------

  // join up the candidates with their corresponding races by iterating over
  // all the candidates and ...
  // 1. identifying their race id
  // 2. using that id to find the race's index in the race array
  // 3. assinging that race to a variable
  // 4. checking if that race has a candidates array. if it does, add the
  //    candidate to it, else, create the array then add the candidate

  return new Promise((resolve, reject) => {
    candidateList.forEach((candidate) => {
      /* 1. */ const candidateRace = candidate.race;
      /* 2. */ const raceIndex = raceList.findIndex(race => race.id === candidateRace);
      /* 3. */ const thisRace = raceList[raceIndex];
  
      if (raceIndex > -1) {
        /* 4. */
        if (thisRace.candidates) {
          thisRace.candidates.push(candidate);
        } else {
          thisRace.candidates = [];
          thisRace.candidates.push(candidate);
        }
      }
    });

    if (raceList) {
      resolve(raceList);
    } else {
      reject(Error('Race list does not exist'));
    }
  });
}
