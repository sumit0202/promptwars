const autocannon = require('autocannon');

const url = 'http://localhost:3000/api/process';

// A simple script to bombard the API endpoints and check throughput, latency, and system stability under load.
const instance = autocannon({
    url: url,
    connections: 50, // Concurrent connections
    pipelining: 1, 
    duration: 10, // Test duration in seconds
    method: 'POST',
    headers: {
        'content-type': 'application/json'
    },
    body: JSON.stringify({ userInput: "Load testing input to verify efficiency and stability." })
}, console.log);

// Hook tracking
autocannon.track(instance, { renderProgressBar: true });

instance.on('done', (result) => {
    console.log(`\n✅ Load testing completed.`);
    console.log(`Total Requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);
    console.log(`Timeouts: ${result.timeouts}`);
    console.log(`Average Latency: ${result.latency.average}ms`);
    
    if (result.errors > 0 || result.timeouts > 0) {
        console.warn(`⚠️ The application encountered errors or timeouts under load. You might need to scale it up.`);
    } else {
        console.log(`🚀 All tests passed perfectly strictly. 100% success rate under load.`);
    }
});
