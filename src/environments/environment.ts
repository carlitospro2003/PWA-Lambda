export const environment = {
  production: false,
  apiUrl: 'http://127.0.0.1:8000/api',
  appName: 'Lambda Fitness',
  version: '1.0.0'
};

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/login',
  REGISTER: '/register',
  LOGOUT: '/logout',
  REFRESH_TOKEN: '/refresh',
  PROFILE: '/profile',
  
  // User endpoints
  USERS: '/users',
  UPDATE_PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/change-password',
  EDIT_USER: '/editUser',
  GET_USER: '/getUser',
  
  // Exercise endpoints
  EXERCISES: '/exercises',
  EXERCISE_BY_ID: '/exercises',
  CREATE_EXERCISE: '/createExcercise',
  GET_EXERCISES_BY_ROOM: '/getExcercisesByRoom',
  
  // Room endpoints
  ROOMS: '/rooms',
  ROOM_EXERCISES: '/rooms',
  CREATE_ROOM: '/createRoom',
  GET_MY_ROOMS: '/getMyRooms',
  
  // Trainer endpoints
  TRAINERS: '/trainers',
  TRAINER_ROOMS: '/trainers/rooms'
};