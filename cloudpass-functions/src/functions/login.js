const { app } = require('@azure/functions');
const { usersContainer } = require('../cosmosClient');

app.http('login', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'login',
  handler: async (request, context) => {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return { status: 400, jsonBody: { message: 'All fields required' } };
    }

    try {
      const { resources } = await usersContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.email = @email AND c.password = @password',
          parameters: [
            { name: '@email', value: email },
            { name: '@password', value: password }
          ]
        })
        .fetchAll();

      if (resources.length === 0) {
        return { status: 401, jsonBody: { message: 'Invalid email or password' } };
      }

      const user = resources[0];
      return {
        status: 200,
        jsonBody: { message: 'Login successful', userId: user.id, name: user.name }
      };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { message: 'Server error', error: err.message } };
    }
  }
});