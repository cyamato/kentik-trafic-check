/* global fetch */
class GetKentikPortalUrl {
  constructor(props) {
  }
  
  url(options) {
    return new Promise ((resolve, reject) => {
      const url = '/query/url';
      console.log(url);
      const startGetDataTime = Date.now();
      if (!options.dimensions || options.dimensions == []) options.dimensions = ["Traffic"];
      let urlRequestObj = {
        dimensions: options.dimensions,
        filters: options.filters,
        options: options.options,
      };
      fetch(url, {
        method: 'POST',
        mode: 'same-origin',
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(urlRequestObj),
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

export default GetKentikPortalUrl;