// Auth Service (:4001) — accounts, sign-in and profiles, backed by the SQLite DB
// in server/db.js. Passwords are salted scrypt hashes; they never leave the service.
const { service, id } = require('./lib');
const { users, hash, verify, publicUser } = require('./db');

const fail = (message, status) => { throw Object.assign(new Error(message), { status }); };

service('auth-service', 4001, {
  // FR-01/02/03 — sign-up; role decides the account shape
  'POST /register': (body) => {
    if (!body.email) fail('Email is required.', 400);
    const existing = users.findByEmail(body.email);
    if (existing) {
      // Social sign-in reuses register: same provider + email → welcome back
      if (body.provider && body.provider !== 'email' && body.provider === existing.provider)
        return publicUser(existing);
      fail('An account with that email already exists — please log in.', 409);
    }
    if ((body.provider ?? 'email') === 'email' && !body.password) fail('Please choose a password.', 400);
    return publicUser(users.create({
      id: id(),
      name: body.name || 'Guest',
      email: body.email,
      passhash: hash(body.password),
      phone: body.phone || '',
      location: body.location || '',
      role: body.role || 'client',
      provider: body.provider || 'email',
      avatar: body.avatar,
    }));
  },
  // Sign-in — email lookup + scrypt verify (social accounts have no password)
  'POST /login': (body) => {
    const user = users.findByEmail(body.email);
    if (!user) fail('No account with that email — sign up first.', 401);
    if (!verify(body.password, user.passhash)) fail('Wrong password.', 401);
    return publicUser(user);
  },
  'GET /users/:id': (_b, { params }) => publicUser(users.findById(params.id)),
  // FR-06 — profile management (name, email, phone, location, avatar, password)
  'PATCH /users/:id': (body, { params }) => publicUser(users.update(params.id, body)),
});
