import gql from 'graphql-tag';
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import AppConfig from './config/config'; 

console.info('------------- RUNNING -------------');

const client = new AWSAppSyncClient({
    url: AppConfig.aws_appsync_graphqlEndpoint,
    region: AppConfig.aws_appsync_region,
    auth: {
        type: AppConfig.aws_appsync_authenticationType,
        apiKey: AppConfig.aws_appsync_apiKey,
    }
});

const getChartData = `
query get {
  getChartData {
    x,
    y
  }
}
`;

const onDataUpdatedSubscription = `subscription dataUpdatedSubscription {
    dataUpdatedSubscription {
        x,
        y
    }
}
`;

let subscription;

(async () => {
  
  const RealTimeChartData = [];
  const getInitialData = async () => {
    const {data} = await client.query({
      query: gql(getChartData)
    }) 
    return [data.getChartData.x * 1000, data.getChartData.y];
  }
  const subscribeToRealTimeData = async () => {
  }
  
  
  Highcharts.stockChart('container', {
    chart: {
      type: "area",

      events: {
        load: async function () {
          
          // get initial data
          let that = this;
          let series = this.series[0];
          const initialData = await getInitialData();
          // series.addPoint(initialData, true, true);
          // console.log(initialData, series);
          
          // subscribe 
          let subscription = client.subscribe({ 
            query: gql(onDataUpdatedSubscription)
          }).subscribe({
              next: ({data}) => {
                console.log('data updated', data)
                const {dataUpdatedSubscription} = data;
                series.addPoint([dataUpdatedSubscription.x, dataUpdatedSubscription.y], true, true);
              },
              error: error => {
                  console.error('onDataUpdatedSubscription', error);
              }
          });
          console.log('subscribe', subscription)              
        }
      }
    },
    series: [{
        name: 'Random data',
        data: (function () {
            // generate an array of data
            var data = [],
                time = (new Date()).getTime(),
                i;

            for (i = -99; i <= 0; i += 1) {
                data.push([
                    time + i * 1000,
                    0
                ]);
            }
            
            return data;
        }())
    }],

    time: {
      useUTC: false
    },

    yAxis: {
      max: 100,
      min: 0
  },

  rangeSelector: {
      buttons: [{
          count: 1,
          type: 'minute',
          text: '1M'
      }, {
          count: 5,
          type: 'minute',
          text: '5M'
      }, {
          type: 'all',
          text: 'All'
      }],
      inputEnabled: false,
      selected: 0
  },

  colors: [
    "#f90"
  ]

  });

})();
