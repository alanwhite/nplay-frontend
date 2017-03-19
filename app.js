/* global window document localStorage fetch alert */

// Fill in with your values
const AUTH0_CLIENT_ID = 'vdjlidkvjW7FzbpMqaF8ubd1lci5qUr7';
const AUTH0_DOMAIN = 'arw001.eu.auth0.com';
const AUTH0_CALLBACK_URL = window.location.href; // eslint-disable-line
const PUBLIC_ENDPOINT = 'https://5kaml809og.execute-api.eu-west-1.amazonaws.com/dev/nplay/hello';
const PRIVATE_ENDPOINT = 'https://5kaml809og.execute-api.eu-west-1.amazonaws.com/dev/nplay/private';

// initialize auth0 lock

var options = {
  auth: {
    responseType: 'token',
    params: {scope: 'openid name email'}
  }
};

const lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, options); // eslint-disable-line

// Listening for the authenticated event
lock.on("authenticated", function(authResult) {
  // Use the token in authResult to getUserInfo() and save it to localStorage
  lock.getUserInfo(authResult.accessToken, function(error, profile) {
    if (error) {
      console.error('Something went wrong: ', err);
      alert('Something went wrong, check the Console errors'); // eslint-disable-line no-alert
      return;
    }

    console.log(authResult.idToken);
    localStorage.setItem('accessToken', authResult.accessToken);
    localStorage.setItem('idToken', authResult.idToken);
    localStorage.setItem('profile', JSON.stringify(profile));

    document.getElementById('btn-login').style.display = 'none';
    document.getElementById('btn-logout').style.display = 'flex';
    document.getElementById('nick').textContent = profile.nickname;
  });
});

const jwtToken = localStorage.getItem('idToken');
if (jwtToken) {
  document.getElementById('btn-login').style.display = 'none';
  document.getElementById('btn-logout').style.display = 'inline';
  const profile = JSON.parse(localStorage.getItem('profile'));
  document.getElementById('nick').textContent = profile.nickname;
}

// Handle login
document.getElementById('btn-login').addEventListener('click', function() {
  lock.show();
});

// Handle logout
document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('idToken');
  localStorage.removeItem('profile');
  document.getElementById('btn-login').style.display = 'flex';
  document.getElementById('btn-logout').style.display = 'none';
  document.getElementById('nick').textContent = '';
});

// Handle public api call
document.getElementById('btn-public').addEventListener('click', () => {
  // call public API
  const getdata = fetch(PUBLIC_ENDPOINT, {
    method: 'GET',
    cache: 'no-store',
  });

  getdata.then((response) => {
    response.json().then((data) => {
      console.log('Message:', data);
      document.getElementById('message').textContent = '';
      document.getElementById('message').textContent = data.message;
    });
  });
});

// Handle private api call
document.getElementById('btn-private').addEventListener('click', () => {
  // Call private API with JWT in header
  const token = localStorage.getItem('idToken');
  if (!token) {
    document.getElementById('message').textContent = '';
    document.getElementById('message').textContent = 'You must login to call this protected endpoint!';
    return false;
  }
  const getdata = fetch(PRIVATE_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: 'GET',
    cache: 'no-store',
  });

  getdata.then((response) => {
    response.json().then((data) => {
      console.log('Token:', data);
      document.getElementById('message').textContent = '';
      document.getElementById('message').textContent = data.message;
    });
  });
  // bc linting...
  return false;
});
