import fetch from 'node-fetch';

async function run(){
  try{
    const signup = await fetch('http://localhost:3000/api/v1/user/signup',{
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({username: 'testuser@example.com', password: 'TestPass123', firstName: 'Test', lastName: 'User'})
    });
    console.log('signup status', signup.status);
    console.log(await signup.text());

    const signin = await fetch('http://localhost:3000/api/v1/user/signin',{
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({username: 'testuser@example.com', password: 'TestPass123'})
    });
    console.log('signin status', signin.status);
    console.log(await signin.text());
  }catch(e){
    console.error(e);
  }
}

run();
