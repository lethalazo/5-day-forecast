// 'Day' class for access and rendering feasibility
class Day {
    max_temp;
    avg_humidity;
    date;

    constructor(maxTemp, avgHumidity, date) {
        this.max_temp = maxTemp;
        this.avg_humidity = avgHumidity;
        this.date = date;
    }
}

window.onload = main;

// array to store the required data for all the different days in the response
let days = [];

function main() {
    // load the coordinates and check if loaded properly
    let coords = getCoords();

    // if coords can't be loaded, load the lat-lon of London, UK
    if (coords == undefined) getAndParseResponse(51.509865, -0.118092);
}

// goes through each record in the response and populates the 'days' array.
// Pushes a 'day' object in the 'days' array after processing all the records for a specific date.
function parseResult(result) {
    // reset the days data
    days = [];

    // update response city
    document.getElementById('city').innerHTML = result.city.name + ', ' + result.city.country;

    const list = result.list; // the records list
    let records = []; // to store records for the same day
    let currDate = -1; // to check for the same day

    list.forEach(record => {
        // get the date of the current record
        const date = new Date(record.dt_txt);
        const recordDate = date.getDate();

        // use only the necessary data from this record
        const data = {  date: date.toLocaleDateString('en-GB'),
                        max_temp: record.main.temp_max,
                        humidity: record.main.humidity
                     };
        if (currDate == -1) {
            // if just starting
            currDate = recordDate;
        }
        else if (currDate != recordDate) {
            // if past the current date, update current date and push a 'day' object after processing all the records for the date
            currDate = recordDate;
            pushDay(records);
            records = [];
        }

        // push the data for this date
        records.push(data);
    });

    if (records.length > 0) pushDay(records); // edge case to not miss the records for last day
}

function pushDay(records) {
    let maxTemp = -10000;
    let sumHumidity = 0;
    let date = "";
    records.forEach(record => {
        date = record.date;
        maxTemp = Math.max(maxTemp, record.max_temp);
        sumHumidity += record.humidity;
    });

    // get the average humidity by dividing the sum by the number of records
    const avgHumidity = sumHumidity / records.length;

    // create a 'day' object using the necessary data
    const day = new Day(maxTemp.toFixed(2), avgHumidity.toFixed(2), date);

    days.push(day);
}

// renders the data for all the days parsed from the JSON response in a HTML table
function renderDays() {
    const table = document.getElementById('weather-table-body');
    let row = 0;

    days.forEach(day => {
        if (row == 0) document.getElementById('weather-from').innerHTML = day.date;

        // update 'To date' until the last date
        document.getElementById('weather-to').innerHTML = day.date;

        // clear the row if it already exists
        if (table.rows[row]) table.deleteRow(row);

        // populate
        const currRow = table.insertRow(row);
        row += 1;

        let cell = currRow.insertCell(0);
        cell.innerHTML = day.date;

        cell = currRow.insertCell(1);
        cell.innerHTML = day.max_temp + " °C";

        cell = currRow.insertCell(2);
        cell.innerHTML = day.avg_humidity + "%";
    });
}

// check for geolocation (supported with HTML5), get weather and return the co-ordinates object if position is obtained
function getCoords() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            getAndParseResponse(position.coords.latitude, position.coords.longitude);
            return position.coords;
        });
    }
    return undefined;
}

function fetchJSON(path, callback) {
    // snippet from an AJAX stackoverflow answer, implemented in order to not
    // include jQuery unnecessarily just for parsing JSON. This helps keep the app lightweight
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
}

function getAndParseResponse(lat, lon) {
    // using AJAX to load the JSON object from open weather map using a public api key
    fetchJSON("https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=5dd765a29b95b2e058dfd9f33a1dbd0d&units=metric", result => {
        console.log(result); // log the result object / the response
        parseResult(result);
        renderDays();
    });
}