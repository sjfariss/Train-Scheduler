// Initialize Firebase
var config = {
  apiKey: "AIzaSyAZca5Dx1AdkMbaWBMuNn1O28QQdPcfQWI",
  authDomain: "train-schedule-project-6889a.firebaseapp.com",
  databaseURL: "https://train-schedule-project-6889a.firebaseio.com",
  projectId: "train-schedule-project-6889a",
  storageBucket: "train-schedule-project-6889a.appspot.com",
  messagingSenderId: "491767211384"
};
firebase.initializeApp(config);

// Create a variable to reference the database
var database = firebase.database();

//set timer for current time count by seconds for minutes
setInterval(function(startTime) {
  $("#time").html(moment().format("h:mm: a"));
}, 1000);

// Capture Button Click and prevent refreshing of page
$("#add-train").on("click", function() {
  event.preventDefault();

  // set train data variables from form input
  var train = $("#trname-ip")
    .val()
    .trim();
  var destination = $("#trdest-ip")
    .val()
    .trim();
  var firstTime = $("#trfirsttime-ip")
    .val()
    .trim();
  var frequency = $("#trfreq-ip")
    .val()
    .trim();

  //variable from form to firebase

  var trainData = {
    formtrain: train,
    formdestination: destination,
    formfirsttime: firstTime,
    formfrequency: frequency,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  };
  //push to firebease so we can have retrieval
  database.ref().push(trainData);

  console.log(trainData.formtrain);
  console.log(trainData.formdestination);
  console.log(trainData.formfirsttime);
  console.log(trainData.formfrequency);
  console.log(trainData.dateAdded);

  // Clears all of the input(ip) form text-boxes
  $("#trname-ip").val("");
  $("#trdest-ip").val("");
  $("#trfreq-ip").val("");
  $("#trfirsttime-ip").val("");
});

// Firebase initial data loader
database.ref().on(
  "child_added",
  function(childSnapshot, prevChildKey) {
    var train = childSnapshot.val().formtrain;
    var destination = childSnapshot.val().formdestination;
    var firstTime = childSnapshot.val().formfirsttime;
    var frequency = childSnapshot.val().formfrequency;

    //set var for current time
    var currentTime = moment();
    console.log("CURRENT TIME: " + moment(currentTime).format("h:mm: a"));

    //capture time function
    $("#time").text(currentTime.format("h:mm: a"));

    //logic for calculation of difference in time
    var timeDiff = moment().diff(moment(firstTimeConversion), "minutes");
    console.log("DIFFERENCE IN TIME: " + timeDiff);

    //  set variable and calculation for remainder
    var remainTime = timeDiff % frequency;
    console.log("REMAINING TIME: " + remainTime);

    //determine Minutes Away
    var minutesAway = frequency - remainTime;
    console.log("MINUTES AWAY: " + minutesAway);

    //determine Next Train Arrival
    var nextArrival = moment()
      .add(minutesAway, "minutes")
      .format("h:mm: a");
    console.log("NEXT ARRIVAL: " + moment(nextArrival).format("h:mm: a"));

    //append to add updated train data to new row each time
    $("#train-table > tbody").append(
      "<tr><td>" +
        "</td><td>" +
        train +
        "</td><td>" +
        destination +
        "</td><td>" +
        frequency +
        "</td><td>" +
        nextArrival +
        "</td><td>" +
        minutesAway +
        "</td></tr>"
    );
    //check for error out
  },
  function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  }
);

// Update minutes away
function updateTime() {
  //empty train table before appending new information
  $("#train-table > tbody").empty();

  database.ref().on("child_added", function(childSnapshot, prevChildKey) {
    var train = childSnapshot.val().formtrain;
    var destination = childSnapshot.val().formdestination;
    var frequency = childSnapshot.val().formfrequency;
    var firstTime = childSnapshot.val().formfirsttime;

    // First Time (pushed back 1 year to make sure it comes before current time)
    var firstTimeConversion = moment(firstTime, "MMM Do YY, h:mm")
      .subtract(365, "days")
      .calendar();
    console.log(firstTimeConversion);

    // Current Time
    var currentTime = moment();
    console.log("CURRENT TIME: " + moment(currentTime).format("h:mm: a"));
    //add current time to html at ID=time
    $("#time").text(currentTime.format("h:mm: a"));
    //start logic calculations and console check each one make easy to see with all other console logs!
    // Difference between the times
    var diffTime = moment().diff(moment(firstTimeConversion), "minutes");
    console.log("TIME DIFFERENCE: " + diffTime);

    // set remaining time calculation
    var remainTime = diffTime % frequency;
    console.log("TIME REMAINING: " + remainTime);

    //determine Minutes Away
    var minutesAway = frequency - remainTime;
    console.log("MINUTES AWAY: " + minutesAway);

    //determine Next Train Arrival
    var nextArrival = moment()
      .add(minutesAway, "minutes")
      .format("h:mm: a");
    console.log("NEXT ARRIVAL: " + moment(nextArrival).format("h:mm: a"));
    //error "invalid date" as have not added day category, but calculates correctly to next day!!

    //push to current train table and append with logic added
    $("#train-table > tbody").append(
      "<tr><td>" +
        train +
        "</td><td>" +
        destination +
        "</td><td>" +
        frequency +
        "</td><td>" +
        nextArrival +
        "</td><td>" +
        minutesAway +
        "</td></tr>"
    );
  });
}
//added to minutes away updated every 60 seconds WORKS
setInterval(updateTime, 6000);
