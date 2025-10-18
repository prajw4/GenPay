// Simple test script to create two users and perform a transfer
// Run with: node scripts/test-transfer.js

const base = 'http://localhost:3000/api/v1'

function randEmail(prefix){
  return `${prefix}-${Date.now()}@example.com`
}

async function post(path, body, token){
  const res = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let json;
  try{ json = JSON.parse(text) }catch(e){ json = { raw: text } }
  return { ok: res.ok, status: res.status, data: json }
}

async function get(path, token){
  const res = await fetch(base + path, {
    headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}) }
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, data: json }
}

async function main(){
  console.log('Starting transfer test...')
  const password = 'pass1234'
  const userA = { username: randEmail('alice'), password, firstName: 'Alice', lastName: 'T' }
  const userB = { username: randEmail('bob'), password, firstName: 'Bob', lastName: 'R' }

  console.log('Signing up user A')
  let res = await post('/user/signup', userA)
  console.log('signup A:', res.status, res.data)
  if(!res.ok){ console.log('Stopping test: signup A failed'); return }

  console.log('Signing up user B')
  res = await post('/user/signup', userB)
  console.log('signup B:', res.status, res.data)
  if(!res.ok){ console.log('Stopping test: signup B failed'); return }

  // sign in as A
  console.log('Signing in as user A')
  res = await post('/user/signin', { username: userA.username, password })
  console.log('signin A:', res.status, res.data)
  if(!res.ok){ console.log('Stopping test: signin A failed'); return }
  const tokenA = res.data.token

  // get users list to find B id
  console.log('Fetching user list to find recipient id')
  const list = await get('/user/bulk')
  const users = list.data.user || []
  const foundB = users.find(u => u.username === userB.username)
  if(!foundB){ console.log('Could not find user B in list'); return }
  console.log('Found user B id:', foundB._id)

  // get balance before
  console.log('Fetching balance before transfer')
  let bal = await get('/account/balance', tokenA)
  console.log('balance before:', bal.status, bal.data)

  // transfer
  console.log('Performing transfer of 10 to B')
  res = await post('/account/transfer', { to: foundB._id, amount: 10 }, tokenA)
  console.log('transfer res:', res.status, res.data)

  // get balance after
  bal = await get('/account/balance', tokenA)
  console.log('balance after:', bal.status, bal.data)
}

main().catch(e => { console.error(e); process.exit(1) })
