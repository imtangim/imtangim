// Service Worker for PWA and Notifications
const CACHE_NAME = 'routine-maker-v1';
const BASE_PATH = '/routine';
const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/style.css`,
  `${BASE_PATH}/script.js`,
  `${BASE_PATH}/data.js`,
  `${BASE_PATH}/manifest.json`
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Check for pending test notifications
      return checkPendingTestNotifications();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('/routine') && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow('/routine/');
        }
      })
  );
});

// Background sync for notifications (if needed)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  // This can be used to sync notification schedules
  console.log('Syncing notifications');
}

// Periodic background sync for checking class times
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-classes') {
    event.waitUntil(checkUpcomingClasses());
  }
});

// Check for upcoming classes and send notifications
async function checkUpcomingClasses() {
  try {
    // Get stored schedule data
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(`${BASE_PATH}/schedule-data.json`);
    
    if (response) {
      const scheduleData = await response.json();
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
      
      scheduleData.forEach(classItem => {
        if (classItem.day === 'FRI') return; // Skip holidays
        
        const dayIndex = getDayIndexFromName(classItem.day);
        if (dayIndex === -1) return;
        
        const [startTime] = classItem.time.split(' - ');
        const classTime = getNextClassTimeForDay(dayIndex, startTime);
        const notificationTime = new Date(classTime.getTime() - 10 * 60 * 1000);
        
        // Check if notification should be sent (within next 10 minutes)
        if (notificationTime >= now && notificationTime <= tenMinutesFromNow) {
          showNotificationForClass(classItem);
        }
      });
    }
  } catch (error) {
    console.error('Error checking upcoming classes:', error);
  }
}

// Helper functions for service worker
function getDayIndexFromName(dayName) {
  const dayMap = { 'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6 };
  return dayMap[dayName] ?? -1;
}

function parseTimeString(timeStr) {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes;
  if (period === 'PM' && hours !== 12) totalMinutes += 12 * 60;
  if (period === 'AM' && hours === 12) totalMinutes -= 12 * 60;
  return totalMinutes;
}

function getNextClassTimeForDay(dayIndex, timeString) {
  const now = new Date();
  const startMinutes = parseTimeString(timeString);
  const hours = Math.floor(startMinutes / 60);
  const minutes = startMinutes % 60;
  
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  
  const currentDay = now.getDay();
  let daysUntilTarget = dayIndex - currentDay;
  
  if (daysUntilTarget < 0 || (daysUntilTarget === 0 && target < now)) {
    daysUntilTarget += 7;
  }
  
  target.setDate(now.getDate() + daysUntilTarget);
  return target;
}

function showNotificationForClass(classItem) {
  const notificationTitle = `Class Reminder: ${classItem.courseId}-${classItem.section}`;
  const notificationBody = `${classItem.courseName}\nTime: ${classItem.time}\nRoom: ${classItem.room}`;
  
  return self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    icon: `${BASE_PATH}/manifest.json`,
    badge: `${BASE_PATH}/manifest.json`,
    tag: `class-${classItem.courseId}-${classItem.day}-${Date.now()}`,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      courseId: classItem.courseId,
      courseName: classItem.courseName,
      time: classItem.time,
      room: classItem.room
    }
  });
}

// Message handler for receiving schedule data from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATIONS') {
    const scheduleData = event.data.scheduleData;
    storeScheduleData(scheduleData);
    scheduleNotificationsFromServiceWorker(scheduleData);
  }
  
  if (event.data && event.data.type === 'SCHEDULE_TEST_NOTIFICATION') {
    const scheduledTime = event.data.scheduledTime;
    const timeString = event.data.timeString;
    scheduleTestNotificationInSW(scheduledTime, timeString);
  }
});

// Store schedule data (simplified - using IndexedDB would be better)
async function storeScheduleData(scheduleData) {
  // Store in cache for now
  const cache = await caches.open(CACHE_NAME);
  await cache.put(
    new Request(`${BASE_PATH}/schedule-data.json`),
    new Response(JSON.stringify(scheduleData))
  );
}

// Schedule notifications from service worker
function scheduleNotificationsFromServiceWorker(scheduleData) {
  console.log('Received schedule data in service worker');
  // Set up periodic checking (every 5 minutes)
  setInterval(() => {
    checkUpcomingClasses();
  }, 5 * 60 * 1000);
  
  // Also check immediately
  checkUpcomingClasses();
}

// Schedule test notification in service worker
async function scheduleTestNotificationInSW(scheduledTime, timeString) {
  const now = Date.now();
  const delay = scheduledTime - now;
  
  if (delay > 0) {
    console.log(`Service Worker: Test notification scheduled for ${new Date(scheduledTime).toLocaleString()}`);
    
    // Store test notification in cache for persistence
    const cache = await caches.open(CACHE_NAME);
    await cache.put(
      new Request(`${BASE_PATH}/test-notification.json`),
      new Response(JSON.stringify({ scheduledTime, timeString }))
    );
    
    // Use setTimeout to schedule the notification (works while SW is active)
    setTimeout(() => {
      showTestNotificationInSW(timeString);
    }, delay);
    
    // Also set up periodic check as backup (every 10 seconds)
    const checkInterval = setInterval(() => {
      const now = Date.now();
      if (now >= scheduledTime) {
        clearInterval(checkInterval);
        showTestNotificationInSW(timeString);
        // Remove from cache after showing
        cache.delete(`${BASE_PATH}/test-notification.json`);
      }
    }, 10000);
  } else {
    console.log('Service Worker: Test notification time has already passed');
  }
}

// Show test notification from service worker
function showTestNotificationInSW(timeString) {
  const notificationTitle = '🔔 Test Notification';
  const notificationBody = `This is a test notification!\nScheduled time: ${timeString}\n\nIf you see this after closing the app, notifications are working correctly!`;
  
  return self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    icon: './manifest.json',
    badge: './manifest.json',
    tag: `test-notification-${Date.now()}`,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      type: 'test',
      timeString: timeString
    }
  });
}

// Check for pending test notifications on service worker activation
async function checkPendingTestNotifications() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(`${BASE_PATH}/test-notification.json`);
    
    if (response) {
      const data = await response.json();
      const now = Date.now();
      
      if (now >= data.scheduledTime) {
        // Time has passed, show notification immediately
        showTestNotificationInSW(data.timeString);
        await cache.delete(`${BASE_PATH}/test-notification.json`);
      } else {
        // Reschedule for remaining time
        const remainingTime = data.scheduledTime - now;
        setTimeout(() => {
          showTestNotificationInSW(data.timeString);
          cache.delete(`${BASE_PATH}/test-notification.json`);
        }, remainingTime);
      }
    }
  } catch (error) {
    console.error('Error checking pending test notifications:', error);
  }
}

