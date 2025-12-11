export const environment = {
  production: true,
  apiUrl: 'https://api.safekids.site/api',
  appName: 'Lambda Fitness',
  version: '1.3.7',
  recaptchaSiteKey: '6LcgbCUsAAAAABvBxNT4pRRYdd70_gkmmTXpmu2z', // Reemplazar con tu Site Key de Google reCAPTCHA v3
  firebase: {
    apiKey: "AIzaSyDPQ3HcafZsG9MJgwTYDM-oV-uCOBCIlnM",
    authDomain: "lambda-6054d.firebaseapp.com",
    projectId: "lambda-6054d",
    storageBucket: "lambda-6054d.firebasestorage.app",
    messagingSenderId: "204320046510",
    appId: "1:204320046510:web:6dce5bbc96f091d8991c3f",
    vapidKey: 'BFDF7N7KcP2mXjS0h1_kIu3hDprXcuZVeBC2eoccIcIWz1EBcqtbtvxEafx1eu0DvwE0cNF5usBhfQCC--ZTK4c'
  }
};

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  REFRESH_TOKEN: '/refreshToken',
  PROFILE: '/profile',
  VERIFY_2FA: '/verify2FA',
  
  // User endpoints
  USERS: '/users',
  UPDATE_PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/change-password',
  EDIT_USER: '/editUser',
  GET_USER: '/getUser',
  TOGGLE_2FA: '/toggle2FA',
  
  // Exercise endpoints
  EXERCISES: '/exercises',
  EXERCISE_BY_ID: '/exercises',
  CREATE_EXERCISE: '/createExcercise',
  GET_EXERCISES_BY_ROOM: '/getExcercisesByRoom',
  GET_EXERCISE: '/getExcercise',
  EDIT_EXERCISE: '/editExcercise',
  DELETE_EXERCISE: '/deleteExcercise',
  
  // Room endpoints
  ROOMS: '/rooms',
  ROOM_EXERCISES: '/rooms',
  CREATE_ROOM: '/createRoom',
  GET_MY_ROOMS: '/getMyRooms',
  GET_MY_ROOMS_DATA: '/getMyRoomsData',
  EDIT_ROOM: '/editRoom',
  DELETE_ROOM: '/deleteRoom',
  SEARCH_ROOM: '/searchRoom',
  JOIN_ROOM: '/joinRoom',
  GET_MY_JOINED_ROOMS: '/getMyJoinedRooms',
  LEAVE_ROOM: '/leaveRoom',
  
  // Trainer endpoints
  TRAINERS: '/trainers',
  TRAINER_ROOMS: '/trainers/rooms',
  
  // Routine endpoints
  CREATE_ROUTINE: '/createRoutine',
  GET_MY_ROUTINES: '/getMyRoutines',
  ADD_FAVORITE: '/AddFavorite',
  
  // Notification endpoints
  GET_NOTIFICATIONS: '/notifications', // GET /notifications
  MARK_NOTIFICATION_AS_READ: '/notifications' // PUT /notifications/{id}
};
