const { app } = require('@azure/functions');
const { passesContainer } = require('../cosmosClient');

const PRICES = {
  student: 300,
  monthly: 500,
  quarterly: 1200
};

function generatePassNumber() {
  return 'PASS-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

app.http('applyPass', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'apply-pass',
  handler: async (request, context) => {
    const body = await request.json();
    const { userId, route, destination, passType } = body;

    if (!userId || !route || !destination || !passType) {
      return { status: 400, jsonBody: { message: 'All fields required' } };
    }

    const type = passType.toLowerCase();
    if (!PRICES[type]) {
      return { status: 400, jsonBody: { message: 'Invalid pass type' } };
    }

    const price = PRICES[type];

    try {
      const { resources: existing } = await passesContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.userId = @userId AND c.status = "active"',
          parameters: [{ name: '@userId', value: userId }]
        })
        .fetchAll();

      if (existing.length > 0) {
        return {
          status: 400,
          jsonBody: { message: 'You already have an active pass. Cannot apply for another.' }
        };
      }

      const passNumber = generatePassNumber();

      const newPass = {
        id: passNumber,
        userId,
        route,
        destination,
        passType: type,
        price,
        passNumber,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      await passesContainer.items.create(newPass);

      return { status: 200, jsonBody: { message: 'Pass applied successfully', passNumber, price } };
    } catch (err) {
      context.error(err);
      return { status: 500, jsonBody: { message: 'Server error', error: err.message } };
    }
  }
});