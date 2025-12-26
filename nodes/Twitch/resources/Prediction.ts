import type { IDataObject, INodeProperties } from 'n8n-workflow';
import { resolveUserIdOrLogin } from '../shared/userIdConverter';
import { updateDisplayOptions } from '../shared/updateDisplayOptions';

// Field definitions for each operation
const createPredictionFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or login name. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Will I win this match?',
		description: 'The question that viewers are predicting. Maximum: 45 characters.',
	},
	{
		displayName: 'Outcome 1 Title',
		name: 'outcome1Title',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Yes',
		description: 'The title for the first outcome. Maximum: 25 characters.',
	},
	{
		displayName: 'Outcome 2 Title',
		name: 'outcome2Title',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. No',
		description: 'The title for the second outcome. Maximum: 25 characters.',
	},
	{
		displayName: 'Prediction Window',
		name: 'predictionWindow',
		type: 'number',
		default: 120,
		required: true,
		typeOptions: {
			minValue: 30,
			maxValue: 1800,
		},
		description: 'The length of time (in seconds) that viewers have to make a prediction. Minimum: 30. Maximum: 1800.',
	},
];

const getPredictionsFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or login name. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Prediction',
		name: 'predictionId',
		type: 'string',
		default: '',
		placeholder: 'e.g. abc123-def456-ghi789',
		description: 'Prediction ID. ID of the prediction to get. To specify multiple IDs, separate them with commas. Maximum of 25 IDs. If not specified, returns all predictions for the broadcaster.',
	},
	{
		displayName: 'First',
		name: 'first',
		type: 'number',
		default: 20,
		typeOptions: {
			minValue: 1,
			maxValue: 25,
		},
		description: 'Maximum number of items to return per page (1-25)',
	},
	{
		displayName: 'After',
		name: 'after',
		type: 'string',
		default: '',
		placeholder: 'e.g. eyJiIjpudWxsLCJhIjp7Ik9mZnNldCI6NX19',
		description: 'The cursor used to get the next page of results',
	},
];

const endPredictionFields: INodeProperties[] = [
	{
		displayName: 'Broadcaster',
		name: 'broadcasterId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 123456789 or username',
		description: 'The broadcaster user ID or login name. If a login name is provided, it will be automatically converted to user ID.',
	},
	{
		displayName: 'Prediction',
		name: 'endPredictionId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. abc123-def456-ghi789',
		description: 'Prediction ID. ID of the prediction to end.',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{
				name: 'RESOLVED',
				value: 'RESOLVED',
				description: 'The winning outcome is determined and points are distributed',
			},
			{
				name: 'CANCELED',
				value: 'CANCELED',
				description: 'The prediction is canceled and points are refunded',
			},
			{
				name: 'LOCKED',
				value: 'LOCKED',
				description: 'The prediction is locked and viewers can no longer make predictions',
			},
		],
		default: 'RESOLVED',
		required: true,
		description: 'The status to set the prediction to',
	},
	{
		displayName: 'Winning Outcome',
		name: 'winningOutcomeId',
		type: 'string',
		displayOptions: {
			show: {
				status: ['RESOLVED'],
			},
		},
		default: '',
		required: true,
		placeholder: 'e.g. outcome123',
		description: 'The ID of the winning outcome (required when status is RESOLVED)',
	},
];

export const predictionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['prediction'],
			},
		},
		options: [
			{
				name: 'Create Prediction',
				value: 'createPrediction',
				action: 'Create a prediction',
				description: 'Create a Channel Points Prediction',
				routing: {
					request: {
						method: 'POST',
						url: '/predictions',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const title = this.getNodeParameter('title', 0) as string;
								const predictionWindow = this.getNodeParameter('predictionWindow', 0) as number;
								const outcome1Title = this.getNodeParameter('outcome1Title', 0) as string;
								const outcome2Title = this.getNodeParameter('outcome2Title', 0) as string;

								const body = {
									broadcaster_id: broadcasterId,
									title: title,
									outcomes: [
										{ title: outcome1Title },
										{ title: outcome2Title },
									],
									prediction_window: predictionWindow,
								};

								requestOptions.body = body;
								return requestOptions;
							},
						],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Predictions',
				value: 'getPredictions',
				action: 'Get predictions',
				description: 'Get Channel Points Predictions',
				routing: {
					request: {
						method: 'GET',
						url: '/predictions',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const qs: IDataObject = {
									broadcaster_id: broadcasterId,
								};

								const predictionId = this.getNodeParameter('predictionId', '') as string;
								if (predictionId) {
									// Support multiple IDs separated by commas
									const ids = predictionId.split(',').map(id => id.trim()).filter(id => id);
									if (ids.length === 1) {
										qs.id = ids[0];
									} else if (ids.length > 1) {
										// For multiple IDs, we need to add them as separate query parameters
										qs.id = ids;
									}
								}

								const first = this.getNodeParameter('first', '') as number;
								if (first) {
									qs.first = first;
								}

								const after = this.getNodeParameter('after', '') as string;
								if (after) {
									qs.after = after;
								}

								requestOptions.qs = qs;
								return requestOptions;
							},
						],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'End Prediction',
				value: 'endPrediction',
				action: 'End a prediction',
				description: 'End a Channel Points Prediction',
				routing: {
					request: {
						method: 'PATCH',
						url: '/predictions',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const broadcasterIdInput = this.getNodeParameter('broadcasterId', 0) as string;
								const broadcasterId = await resolveUserIdOrLogin.call(this, broadcasterIdInput);
								const predictionId = this.getNodeParameter('endPredictionId', 0) as string;
								const status = this.getNodeParameter('status', 0) as string;

								const body: IDataObject = {
									broadcaster_id: broadcasterId,
									id: predictionId,
									status: status,
								};

								if (status === 'RESOLVED') {
									const winningOutcomeId = this.getNodeParameter('winningOutcomeId', 0) as string;
									body.winning_outcome_id = winningOutcomeId;
								}

								requestOptions.body = body;
								return requestOptions;
							},
						],
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
		],
		default: 'getPredictions',
	},
];

export const predictionFields: INodeProperties[] = [
	...updateDisplayOptions({ show: { resource: ['prediction'], operation: ['createPrediction'] } }, createPredictionFields),
	...updateDisplayOptions({ show: { resource: ['prediction'], operation: ['getPredictions'] } }, getPredictionsFields),
	...updateDisplayOptions({ show: { resource: ['prediction'], operation: ['endPrediction'] } }, endPredictionFields),
];
