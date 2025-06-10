// import React from 'react';
// import NotificationToast from './NotificationToast';

// const NotificationManager = ({ notifications, onDismiss }) => {
//   return (
//     <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 1000 }}>
//       {notifications.map((notification, index) => (
//         <div
//           key={notification.id}
//           style={{
//             marginTop: index * 80 // Better spacing for stacked notifications
//           }}
//         >
//           <NotificationToast
//             notification={notification}
//             onClose={() => onDismiss(notification.id)}
//           />
//         </div>
//       ))}
//     </div>
//   );
// };

// export default NotificationManager;

import React from 'react';
import NotificationToast from './NotificationToast';

const NotificationManager = ({ notifications, onDismiss }) => {
  // Only show the first notification (sequential display)
  const currentNotification = notifications.length > 0 ? notifications[0] : null;

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 1000 }}>
      {currentNotification && (
        <NotificationToast
          notification={currentNotification}
          onClose={() => onDismiss(currentNotification.id)}
        />
      )}
    </div>
  );
};

export default NotificationManager;