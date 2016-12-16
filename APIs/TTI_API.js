var request = require('request');
var base64 = require('base-64');

// Link Location Index
var assessmentInfoByCode = {
  "6754": {
    name: "Indigo Assessment",
    code: "IDS-INDIGO",
    suffix: ""
  },
  "6797": {
    name: "Indigo Me",
    code: "IDS-INDIGO2",
    suffix: " - indigo-me"
  },
  "6966": {
    name: "Indigo Skills",
    code: "INDIGO5",
    suffix: " - indigo-skills"
  }
}

var assessmentInfoByName = {
  "Indigo Assessment": {
    code: "6754",
    code: "IDS-INDIGO",
    suffix: ""
  },
  "Indigo Me": {
    code: "6797",
    code: "IDS-INDIGO2",
    suffix: " - indigo-me"
  },
  "Indigo Skills": {
    code: "6966",
    code: "INDIGO5",
    suffix: " - indigo-skills"
  }
}

// APIs
var APIs = {

  // constants
  baseURL: "http://api.ttiadmin.com",

  // Universal API Request Format
  requestFormat: function(method, endpoint, login, password) {
    return new Promise(function(resolve,reject) {
      var encodeString = base64.encode(login + ":" + password);
      var options = {
        method: method,
        url: endpoint,
        headers: {
          'Authorization': 'Basic ' + encodeString,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
      request(options, function(err, httpResponse, body){
        if (err) {
          reject(err);
        } else {
          // console.log(body);
          if (body === '<html><body>You are being <a href="http://api.ttiadmin.com/admin/login?_r=1">redirected</a>.</body></html>') {
            reject("Internal Error: INCORRECT METHOD");
          } else if (body === "HTTP Basic: Access denied.\n") {
            reject("Error: Access Denied,\nPlease Correct Authentication Credentials");
          } else if (body === "Link Not Found") {
            reject("Error: Link Not Found,\nPlease Correct Link ID");
          } else {
            resolve(body);
          }
        }
      })
    })
  },

  // Show Link API
  showLink: {
    generateEndpoint: function(accountID, linkID) {
      return APIs.baseURL + "/api/accounts/" + accountID + "/links/" + linkID + ".json?include=reportviews";
    }
  },
  listReports: {
    generateEndpoint: function(accountID, linkID) {
      return APIs.baseURL + "/api/accounts/" + accountID + "/links/" + linkID + "/reports.csv";
    }
  },
  showReport: {
    generateEndpoint: function(accountID, linkID, reportID) {
      return APIs.baseURL + "/api/accounts/" + accountID + "/links/" + linkID + "/reports/" + reportID + ".pdf";
    }
  },

}

exportTypeIdentifier = {
  "Trimetrix HD Talent (Legacy)": {
    length: 161,
    category: 'assessment'
  },
  "Talent Insights": {
    length: 67,
    category: 'assessment'
  },
  "Hartman Value Profile": {
    length: 141,
    category: 'instrument'
  },
  "TTI DNA Personal Soft Skills Indicator": {
    length: 50,
    category: 'instrument'
  },
  "Motivation Insights": {
    length: 45,
    category: 'instrument'
  },
  "Style Insights": {
    length: 49,
    category: 'instrument'
  }

}

dashboardSchoolNames = {
  "indigo-school": {
    name: "Indigo Test",
    optionDisplay: "Indigo Test (Sample)"
  },
  "lewiston-porter": {
    name: "Lewiston Porter",
    optionDisplay: "Lewiston Porter"
  },
  "manchester-hs": {
    name: "Manchester High School",
    optionDisplay: "Manchester HS"
  },
  "mntblo_bell-gardens": {
    name: "Bell Gardens",
    optionDisplay: "Montebello - Bell Gardens HS"
  },
  "mntblo_comm-ds": {
    name: "Community Day School",
    optionDisplay: "Montebello - Community DS"
  },
  "mntblo_mntblo-hs": {
    name: "Montebello High School",
    optionDisplay: "Montebello - Montebello HS"
  },
  "mntblo_schurr-hs": {
    name: "Schurr High School",
    optionDisplay: "Montebello - Schurr HS"
  },
  "mntblo_vail-hs": {
    name: "Vail High School",
    optionDisplay: "Montebello - Vail HS"
  },
  "new-vista": {
    name: "New Vista",
    optionDisplay: "New Vista HS"
  },
  "peak-to-peak": {
    name: "Peak to Peak",
    optionDisplay: "Peak to Peak"
  },
  "prospect-ridge": {
    name: "Prospect Ridge",
    optionDisplay: "Prospect Ridge HS"
  },
  "two-roads": {
    name: "Two Roads",
    optionDisplay: "Two Roads HS"
  },
  "vssa": {
    name: "Vail Ski & Snowboard Academy",
    optionDisplay: "Vail Ski & Snowboard Academy"
  }
}

module.exports = {
  assessmentInfoByCode,
  assessmentInfoByName,
  APIs,
  exportTypeIdentifier,
  dashboardSchoolNames
}
