import http from 'k6/http';
// export default function () {
//     const responses = []
//     for(var x = 38591; x < 38691; x++){
//         for(var y = 49282; y < 49292; y++){
//             responses.push(['GET', `http://167.172.239.172/tile/17/${x}/${y}.png`, null, { tags: { ctype: 'images' } }])
//             //http.get(`http://167.172.239.172/tile/17/${x}/${y}.png`);
//         }
//     }
//     http.batch(responses)
//   }

import { sleep } from 'k6';

export const options = {
    scenarios: {
        constant_load: {
          executor: 'constant-arrival-rate',
          rate: 4000, // 4000 requests per second
          timeUnit: '1s', // adjust this if you want to run for a different duration
          duration: '30s', // adjust this if you want to run for a different duration
          preAllocatedVUs: 1000, // adjust this based on your desired concurrency
          maxVUs: 8000, // adjust this based on your desired max concurrency
        },
      },
};

export default () => {
    let x = Math.floor(Math.random() * (35000 - 30000 + 1)) + 30000;
    let y = Math.floor(Math.random() * (49000 - 44000 + 1)) + 44000;
    const urlRes = http.get(`http://167.172.239.172/tile/17/${x}/${y}.png`);
    sleep(1);
};