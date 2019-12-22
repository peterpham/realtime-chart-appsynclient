A sample webpage to render Real Time chart with AppSyncClient

# Set up

## AppSync

Create an AppSync API with following schema
```
type ChartData @aws_iam
@aws_api_key {
	x: AWSTimestamp!
	y: Int!
}

type Mutation {
	updateData: ChartData
}

type Query {
	getChartData: ChartData
}

type Subscription {
	dataUpdatedSubscription: ChartData
		@aws_subscribe(mutations: ["updateData"])
}

schema {
	query: Query
	mutation: Mutation
	subscription: Subscription
}
```

Create resolver(s) using Datasource of your choice and attach to updateData and getChartData.

## Config

Create a file `config/config.js` using the sample `config/example.config.js` and update with GraphQL endpoint, region and API Key.

# Run the app

```
npm run start
```