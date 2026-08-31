import { useEffect, useState } from 'react';
import { enablePushNotifications, getNotificationPermission } from '../registerPush.js';

// Shown on a dashboard while notification permission hasn't been decided
// yet. Disappears once the user grants/denies, or if the browser doesn't
// support push at all.
export default function PushBanner() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    setStatus(getNotificationPermission());
  }, []);

  if (status !== 'default') return null;

  async function handleEnable() {
    const result = await enablePushNotifications();
    setStatus(result.ok ? 'granted' : getNotificationPermission());
  }

  return (
    <div className="push-banner" style={{ display: 'flex' }}>
      <div className="left">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <div>
          <strong>Get notified the moment Robert replies</strong>
          <span>Allow notifications and we'll alert this device, even if the app isn't open.</span>
        </div>
      </div>
      <div className="actions">
        <button type="button" className="pill-btn blue-solid sm" onClick={handleEnable}>
          Enable alerts
        </button>
      </div>
    </div>
  );
}
