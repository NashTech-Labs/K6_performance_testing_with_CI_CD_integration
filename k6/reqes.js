import { check, group, sleep, fail } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const baseUrl = 'https://reqres.in';
const users = JSON.parse(open('test-data.json'));

//Transaction Metrics

const createUserAPITrend = new Trend('POST /createUser Create User API ');
const updateUserAPITrend = new Trend('PUT /updateUser Update User API ');
const fetchAllUsersAPITrend = new Trend('GET /userList Fetch list of Users ');
const fetchSingleUsersAPITrend = new Trend('GET /userList Fetch single Users ');
const deleteUserAPITrend = new Trend('DELETE /deleteUser Delete User API');

export let options = {
	stages: [
		{ duration: '1m', target: 50 },
		{ duration: '2m', target: 100 },
		{ duration: '2m', target: 0 },
	],
	thresholds: {
        'http_req_failed': ['rate<0.10'],
		'http_req_duration': ['p(95)<1000'], // 95 percent of response times must be below 1000ms
		'http_req_duration{status:200}': ['max>=0'],
        'http_req_duration{status:201}': ['max>=0'],
        'http_req_duration{status:400}': ['max>=0'],
        'http_req_duration{status:500}': ['max>=0'],
	},
	'summaryTrendStats': ['min', 'med', 'avg', 'p(90)', 'p(95)', 'max', 'count'],
};

export default function goRestAPI() {	
    
	let user = users[Math.floor(Math.random() * users.length)];

    let createPayload = JSON.stringify({
		name: user.name,
        job: user.job
	});

	// Create cart
	const createUser_response = httpPost(
		`${baseUrl}/api/users`,
        createPayload,
		201
	);

	createUserAPITrend.add(createUser_response.timings.duration);

    let userId;
	check(createUser_response, {
		'Create user response success  ': (r) => r.status === 201,
        'Create user response has user id ': (r) => r.json().id != undefined,
	});

    userId = 2;
 	
    // Fetch Single User API
	const fetchSingleUser_response = httpGet(
		`${baseUrl}/api/users/${userId}`,
		undefined,
		200
	);
		
	fetchSingleUsersAPITrend.add(fetchSingleUser_response.timings.duration);
	check(fetchSingleUser_response, {
		'Get single user response success  ': (r) => r.status === 200,
        'Get single user response has user id  ': (r) => r.json().data.id === userId,
	});

    // Fetch All User API
    const fetchAllUser_response = httpGet(
		`${baseUrl}/api/users?page=1`,
		undefined,
		200
	);
		
	fetchAllUsersAPITrend.add(fetchAllUser_response.timings.duration);
	check(fetchAllUser_response, {
		'Get all user response success  ': (r) => r.status === 200,
	});

    // Update User API
    let updatePayload = JSON.stringify({
		name: user.name,
        job: user.job
	});

	const updateUser_response = httpPut(
		`${baseUrl}/api/users/${userId}`,
        updatePayload,
		200
	);

	updateUserAPITrend.add(updateUser_response.timings.duration);

	check(updateUser_response, {
		'Update user API response success  ': (r) => r.status === 200,
	});

    // Delete User API
	const deleteUser_response = httpDelete(
		`${baseUrl}/api/users/${userId}`,
		undefined,
		204
	);

	deleteUserAPITrend.add(deleteUser_response.timings.duration);
	check(deleteUser_response, {
		'Delete user API response success > ': (r) => r.status === 204,
	});
    }

function httpGet(url, params, expectedResponseCode) {
	var res;
	for (var retries = 3; retries > 0; retries--) {
		res = http.get(url, params);
		if (res.status == expectedResponseCode) {
			return res;
		}
	}
	return res;
}

function httpPost(url, payload, params, expectedResponseCode) {
	var res;
	for (var retries = 2; retries > 0; retries--) {
		res = http.post(url, payload, params);
		if (res.status == expectedResponseCode) {
			return res;
		}
	}
	return res;
}

function httpPut(url, payload, params, expectedResponseCode) {
	var res;
	for (var retries = 2; retries > 0; retries--) {
		res = http.put(url, payload, params);
		if (res.status == expectedResponseCode) {
			return res;
		}
	}
	return res;
}

function httpDelete(url, payload, params, expectedResponseCode) {
	var res;
	for (var retries = 3; retries > 0; retries--) {
		res = http.del(url, payload, params);
		if (res.status == expectedResponseCode) {
			return res;
		}
	}
	return res;
}

export function handleSummary(data) {
	return {
		'result.html': htmlReport(data),
		stdout: textSummary(data, { indent: ' ', enableColors: true }),
	};
}