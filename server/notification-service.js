// Notification Service (:4004) — alert feed, radius alerts, booking + digest pushes (FR-26..FR-30).
const { service, store, id } = require('./lib');

const notifications = store('notifications', [
  { id: 'n1', userId: 'all', type: 'digest', read: false, at: new Date(Date.now() - 86400e3).toISOString(),
    title: 'Weekly Inspiration', body: 'New luxury wedding styles trending in Kumasi this week — tap to explore.' },
]);

const push = (userId, type, title, body) =>
  notifications.add({ id: id(), userId, type, title, body, read: false, at: new Date().toISOString() });

service('notification-service', 4004, {
  'GET /notifications': (_b, { query }) =>
    notifications.all()
      .filter((n) => n.userId === 'all' || n.userId === (query.userId || ''))
      .sort((a, b) => b.at.localeCompare(a.at)),
  'POST /notifications': (body) => push(body.userId || 'all', body.type, body.title, body.body),
  'PATCH /notifications/:id/read': (_b, { params }) => notifications.update(params.id, { read: true }),

  // FR-26 — called by the gateway after an AI item list is produced near registered shops
  'POST /notifications/radius-alert': (body) => {
    (body.shops || []).forEach((s) =>
      push(`shop-${s.id}`, 'radius',
        'A client nearby is looking for items you stock',
        `A client in ${body.area || 'your area'} searched for: ${(body.items || []).slice(0, 4).join(', ')}.`));
    return { alerted: (body.shops || []).length };
  },
  // FR-27 — new brief alert to the decorator
  'POST /notifications/brief-alert': (body) =>
    push(`decorator-${body.decoratorId}`, 'brief',
      'New decoration brief received',
      `${body.clientName} sent you a ${body.eventType} brief with an AI design attached.`),
  // FR-28 — booking status updates to both parties
  'POST /notifications/booking-status': (body) => {
    push(body.clientId, 'booking', 'Booking update', `Your ${body.eventType} booking is now ${body.status}.`);
    push(`decorator-${body.decoratorId}`, 'booking', 'Booking update', `Booking for ${body.eventType} is now ${body.status}.`);
  },
});
