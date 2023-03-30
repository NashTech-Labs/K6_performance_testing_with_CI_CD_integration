# K6 Performance Testing: From Setup to CI/CD Integration
This template contains how to write scripts in k6 & integrate them with CI/CD. In this template, The sripts contains performance test scenarios like load testing and stress testing. Also, I have defined checks and thresholds for pass/fail criteria & By executing these k6 sripts, it will automatically generate performance metrics.

# Technologies

Tool : k6, Github Actions

IDE : Visual Studio

Programming Language : JavaSript

# Integrate k6 with github Actions

To integrate k6 with github Actions and execute our load test, first we need to create a workflow and place it in `.github/workflows`. Once this file has been pushed to our repository, each commit to our repository will result in the workflow being run.

```
name: Cypress GitHub Actions
on: [push]

jobs:
  k6_load_test:
    name: k6 Load Test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v1

      - name: Run local k6 test
        uses: grafana/k6-action@v0.2.0
        with:
          filename: k6/reqes.js

      - name: Store performance test results
        uses: actions/upload-artifact@v3
        with:
          name: k6-report
          path: results.json
```

# Report Generation
k6 can also report the general overview of the test results. To accomplish this, we will need to export a handleSummary function as demonstrated in the code snippet below:

```
export function handleSummary(data) {
	return {
		'result.html': htmlReport(data),
		stdout: textSummary(data, { indent: ' ', enableColors: true }),
	};
}
```

In the handleSummary function, we have specified the `result.html` file to store the results. Below is an example of a GitHub workflow that demonstrates how to upload the summary results to GitHub:

```
- name: Store performance test results
        uses: actions/upload-artifact@v3
        with:
          name: k6-report
          path: results.json
```

# Steps for execution

1. Prerequisites:-

```
Install the K6 in your system- https://k6.io/docs/getting-started/installation/
Install any IDE- Visual Studio- https://dzone.com/articles/install-visual-studio-code-on-ubuntu-1804
```

2. Clone the repository
`https://github.com/knoldus/K6_performance_testing_with_CI_CD_integration`

3. To run the k6 scripts on your local system:
`k6 run k6/reqes.js`
