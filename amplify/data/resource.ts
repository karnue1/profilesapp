import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Recipe: a
    .model({
      name: a.string(),
      description: a.string(),
    })
    .authorization((allow) => [allow.guest()]),

  askBedrock: a
    .query()
    .arguments({ ingredients: a.string().array() })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(
      a.handler.custom({
        dataSource: "BedrockDataSource",
        entry: "./bedrock.js",
      })
    ),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
