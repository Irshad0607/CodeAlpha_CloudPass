const { app } = require('@azure/functions');
const { passesContainer } = require('../cosmosClient');

app.http('getPass', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'pass/{userId}',
  handler: async (request, context) => {
    const userId = request.params.userId;

    try {
      const { resources } = await passesContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
          parameters: [{ name: '@userId', value: userId }]
        })
        .fetchAll();

      if (resources.length === 0) {
        return { status: 404, jsonBody: { message: 'No passes found' } };
      }

      return { status: 200, jsonBody: resources };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { message: 'Server error', error: err.message } };
    }
  }
});