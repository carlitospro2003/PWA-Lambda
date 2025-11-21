import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lambda.app',
  appName: 'Lambda',
  webDir: 'dist/lambda/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
