const request = require('supertest');
const app = require('./backend/server');
jest = { mock: () => {} }; // Mock jest for clean standalone run
request(app)
  .post('/api/process')
  .send({ userInput: "My father is having a heart attack!" })
  .set('Content-Type', 'application/json')
  .end((err, res) => {
      console.log("STATUS:", res.status);
      console.log("BODY:", res.body);
      console.log("TEXT:", res.text);
      process.exit();
  });
