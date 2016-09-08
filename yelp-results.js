var apiKey = require('./api-key.js');
var request = require('request');
var sampleYelpResults = require('./yelp-results.json');
var sampleTwoYelpResults = require('./yelp-two-results.json');
var request = require('request');

/*
   results = {
categories: ['pizza shop', 'book store']
allData: [{},{},{}] //all the results
}
*/

var searchYelp = function(location, terms) {
  var results = {};
  results.categories = [];
  for (var i = 0; i < terms.length; i++) {
    var request_data = {
      method: 'GET',
      url: 'https://api.yelp.com/v2/search?'
    }
    request({
      url: request_data.url,
      method: request_data.method,
      oauth: {
        consumer_key: apiKey.Consumer_Key,
        consumer_secret: apiKey.Consumer_Secret,
        token: apiKey.Token,
        token_secret: apiKey.Token_Secret,
        signature_method: 'HMAC-SHA1',
      },
      qs: {
        location: location,
        term: terms[i],
        limit: 5,
        sort: 2,
      }
    }, function(err, response, body) {
      var term = response.socket._httpMessage.path.split('&')[1].split('=')[1];
      if (err) {
        return console.log('Error: ', err);
      }
      var data = [];
      var categories = {};
      resData = JSON.parse(body);
      for (var x = 0; x < resData.businesses.length; x++) {
        for (var j = 0; j < resData.businesses[x].categories.length; j++) {
          if (!categories[resData.businesses[x].categories[j][1]]) {
            categories[resData.businesses[x].categories[j][1]] = 1;
          } else {
            categories[resData.businesses[x].categories[j][1]]++;
          }
        }
        data.push({
          type: term,
          name: resData.businesses[x].name,
          rating: resData.businesses[x].rating,
          reviewCount: resData.businesses[x].review_count,
          url: resData.businesses[x].url,
          phone: resData.businesses[x].display_phone,
          address: resData.businesses[x].location.display_address,
          neighborhoods: resData.businesses[x].location.neighborhoods
        });
      }
      var catArray = [];
      for (item in categories) {
        catArray.push({category: item, value: categories[item]});
      }
      catArray.sort(function(a, b) {
        b.value - a.value;
      })
      if (!results.allData) {
        results.allData = data;
        results.categories.push(catArray[0].category);
      } else {
        results.allData = results.allData.concat(data);
        results.categories.push(catArray[0].category);
        //        console.log(results.allData);
        return results;
      }
    });
  };
};


var getNeighborhoods = function(results) {
  //var writeBlurb = function(neighborhood, numberOfTerm1, term1, numberOfTerm2, term2);
  //var str = name + ' is a good fit because it has ' + numberOfTerm1 + ' ' + term1 + ' and ' + numberOfTerm2 + ' ' + term2;
  var neighborhoodCount = {};
  results.allData.map(function(item, index) {
    for (var i = 0; i < item.neighborhoods.length; i++) {
      if (!neighborhoodCount[item.neighborhoods[i]]) {
        neighborhoodCount[item.neighborhoods[i]] = {};
        neighborhoodCount[item.neighborhoods[i]].count = 1;
        neighborhoodCount[item.neighborhoods[i]].types = {};
        neighborhoodCount[item.neighborhoods[i]].typeArr = [];
        neighborhoodCount[item.neighborhoods[i]].typeArr.push(item.type);
        neighborhoodCount[item.neighborhoods[i]].types[item.type] = 1
      } else {
        neighborhoodCount[item.neighborhoods[i]].count++;
        if (!neighborhoodCount[item.neighborhoods[i]].types[item.type]) {
          neighborhoodCount[item.neighborhoods[i]].types[item.type] = 1;
          neighborhoodCount[item.neighborhoods[i]].typeArr.push(item.type);
        } else {
          neighborhoodCount[item.neighborhoods[i]].types[item.type].count++;
        }
      }
    }
  });


  var neighborhoods = [];
  for (neighborhood in neighborhoodCount) {
    neighborhoods.push({neighborhood: neighborhood, value: neighborhoodCount[neighborhood].count});
  }
  sortedNeighborhoods = neighborhoods.sort(function(a, b) {
    return b.value - a.value;
  });

  var top3 = sortedNeighborhoods.slice(0, 3);
  top3.forEach(function(item, index) {
    var str = item.neighborhood + ' is a good match for you. It has';
    var n = neighborhoodCount[item.neighborhood];
    //    console.log(n);
    for (var i = 0; i < n.typeArr.length; i++) {
      var typeCount = n.types[n.typeArr[i]];
      var type = n.typeArr[i];
      if (i > 0) {
        str += ' and'
      }
      if (typeCount === 1) {
        str += ' a highly rated place to get ' + type;
      } else if (typeCount > 1) {
        str += typeCount + ' popular places to get ' + type;
      }
    }
    str += '.';
    top3[index].blurb = str;
  });
  console.log(top3);
  return top3;
};
//getNeighborhoods(sampleYelpResults);
getNeighborhoods(sampleTwoYelpResults);


[ { neighborhood: 'Inner Richmond',
    value: 2,
    blurb: 'Inner Richmond is a good match for you. It has a highly rated place to get matcha and a highly rated place to get books.' },
  { neighborhood: 'Mission',
    value: 2,
    blurb: 'Mission is a good match for you. It has a highly rated place to get matcha and a highly rated place to get books.' },
  { neighborhood: 'SoMa',
    value: 2,
    blurb: 'SoMa is a good match for you. It has a highly rated place to get matcha.' } ]

