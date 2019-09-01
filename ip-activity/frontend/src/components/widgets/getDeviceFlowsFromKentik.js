/* global fetch */
class GetDeviceFlowsFromKentik {
  constructor(props) {
  }
  
  query(options) {
    return new Promise ((resolve, reject) => {
      const url = '/device/flow/' + options.deviceName;
      console.log(url);
      const startGetDataTime = Date.now();
      
      fetch(url, {
        method: 'GET',
        mode: 'same-origin',
        cache: "no-cache",
      })
      .then(response => {
        if (response.status == 429) {
          console.log('To many calls, waiting 1 sec');
          setTimeout(() => {
            this.url(options)
            .then(url => {
              resolve(url);
            })
            .catch(err => {
              reject(err);
            });
          },
          1000);
        } else {
          console.log((Date.now() - startGetDataTime) / 1000 + 'sec');
          response.json()
          .then(data => {
            if (data.code) {
              reject(data.message);
            } else {
              resolve(data);
            }
          });
        }
      })
      .catch(err => {
        reject(err);
      });
    });
  }
}

export default GetDeviceFlowsFromKentik;