var CL = require('./searchcraigslist');
var fs = require('fs');
var Promise = require('bluebird');

//To get results from Craigslist, use either getLinks or getLinksCallback

//first argument for both is the city
//second is craigslist search category


//getLinks returns a promise that resolves to the array of first 100 listings


//getLinksCallback takes as its third argument a callback to perform on the array of listings

//use whichever pattern makes more sense
//
var neighborhoodCodes = {
  'soma': 1,
  'south beach': 1,
  'USF': 2,
  'panhandle': 2,
  'bernal heights': 3,
  'castro': 4,
  'upper market': 4,
  'cole valley': 5,
  'ashbury heights': 5,
  'downtown': 6,
  'civic': 6,
  'van ness': 6,
  'exelsior': 7,
  'outer mission': 7,
  'financial district': 8,
  'glen park': 9,
  'lower haight': 10,
  'haight-ashbury': 11,
  'haight ashbury': 11,
  'hayes valley': 12,
  'ingleside': 13,
  'sfsu': 13,
  'ccsf': 13,
  'inner richmond': 14,
  'inner sunset': 15,
  'ucsf': 15,
  'laurel heights': 16,
  'presidio': 16,
  'marina': 17,
  'cow hollow': 17,
  'mission': 18,
  'mission district': 18,
  'nob hill': 19,
  'lower nob hill': 20,
  'noe valley': 21,
  'north beach': 22,
  'telegraph hill': 22,
  'pacific heights': 23,
  'lower pac heights': 24,
  'potrero hill': 25,
  'richmond': 26,
  'seacliff': 26,
  'russian hill': 27,
  'sunset': 28,
  'parkside': 28,
  'twin peaks': 29,
  'diamond heights': 29,
  'western addition': 30,
  'bayview': 110,
  'west portal': 114,
  'forest hill': 114,
  'visitacion valley': 118,
  'alamo square': 149,
  'nopa': 149,
  'tenderloin': 156,
  'treasure island': 157,
  'portola district': 164,
};


//getLinks example, see all room shares in Boston

var composeQuery = function(neighborhoods, maxprice) {
  var neighborhoodUrls = [];
  neighborhoods.map(function(neighborhood, index) {
    neighborhood = neighborhood.toLowerCase();
    var neighborhoodCode = neighborhoodCodes[neighborhood];
    var queryString = [];
    var url = 'http://sfbay.craigslist.org/search/sfc/roo';
    queryString.push('nh=' + neighborhoodCode);
    if (maxprice) {
      queryString.push('max_price=' + maxprice);
    }
    neighborhoodUrls.push(url + '?' + queryString.join('&'));
  })
  console.log(neighborhoodUrls);
  return neighborhoodUrls;
};


// function returns an object, like this:
//
// {
//   neighborhoods: ['nob hill', 'mission', 'sunset'],
//   listings: {
//     nob hill: [
//       {
//         >> nob hill listings <<
//       }
//     ],
//     mission: [
//       {
//         >> mission listings <<
//       }
//     ],
//     sunset: [
//       {
//         >> sunset listings <<
//       }
//     ]
//   }
// }
//

var craigslistData = function(neighborhoods, maxprice) {
  return new Promise(function(resolve, reject) {
    var results = {};
    results.neighborhoods = neighborhoods;
    neighborhoodUrls = composeQuery(neighborhoods, maxprice);
    results.listings = {};
    neighborhoodUrls.map(function(url, index) {
      var neighborhood = neighborhoods[index];
      CL.getLinks(url)
      .then(function(data) {
        results.listings[neighborhood] = data;
        if (Object.keys(results.listings).length === neighborhoodUrls.length) {
          resolve(results);
          fs.writeFile('results.json', JSON.stringify(results.listings), function(err) {
            if (err) { console.log("error writing results: ", err); }
          });
          //   return results;
          // console.log(index, results.listings);
        }
      });
    });
  });
};

craigslistData(['tenderloin', 'mission', 'nob hill']).then(function(res) {
  console.log(res);
});

//CL.getLinks('boston','roo').then(function(res){console.log(res)})
//getLinksCallback example
//CL.getLinksCallback('boston','roo',function(res){console.log(res)})
