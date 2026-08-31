// registerPush.js — asks for notification permission and subscribes this
// device to Web Push, via the service worker registered in main.jsx.

import { api } from './api.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function enablePushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' };
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') {
    return { ok: false, reason: 'denied' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const { vapid_public_key: vapidPublicKey } = await api.get('/push/vapid-public-key/');
    if (!vapidPublicKey) return { ok: false, reason: 'not-configured' };

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    await api.post('/push/subscribe/', subscription.toJSON());
    return { ok: true };
  } catch (err) {
    console.warn('Push subscription failed:', err);
    return { ok: false, reason: 'error', error: err };
  }
}
