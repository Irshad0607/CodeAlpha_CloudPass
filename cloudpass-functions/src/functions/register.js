const { app } = require('@azure/functions');
const { usersContainer } = require('../cosmosClient');

app.http('register', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'register',
  handler: async (request, context) => {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return { status: 400, jsonBody: { message: 'All fields required' } };
    }

    try {
      const { resources: existing } = await usersContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.email = @email',
          parameters: [{ name: '@email', value: email }]
        })
        .fetchAll();

      if (existing.length > 0) {
        return { status: 400, jsonBody: { message: 'Email already registered' } };
      }

      const newUser = {
        id: email,
        name,
        email,
        password,
        createdAt: new Date().toISOString()
      };

      await usersContainer.items.create(newUser);

      return { status: 200, jsonBody: { message: 'Registration successful' } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { message: 'Server error', error: err.message } };
    }
  }
});