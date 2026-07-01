export type WearableProviderId = 'google_fit' | 'fitbit' | 'oura';

export type WearableProvider = {
  id: WearableProviderId;
  name: string;
  description: string;
  /** Shown when a member clicks "Connect" — nothing is wired up yet, so this
   * explains what has to exist (on our side, via env vars) before it can. */
  setupInstructions: string;
  devConsoleUrl: string;
  devConsoleLabel: string;
};

export const WEARABLE_PROVIDERS: WearableProvider[] = [
  {
    id: 'google_fit',
    name: 'Google Fit',
    description: 'Steps, workouts, and heart rate from Android and Wear OS devices.',
    setupInstructions:
      'Not connected yet. To enable Google Fit sync, we need to register a project in Google Cloud Console, enable the Fitness API, and add the resulting client ID/secret to the app\'s environment variables. No app review is required for this one — it\'s the quickest of the three to turn on.',
    devConsoleUrl: 'https://console.cloud.google.com/',
    devConsoleLabel: 'Google Cloud Console',
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    description: 'Steps, sleep, heart rate, and workouts from Fitbit devices.',
    setupInstructions:
      'Not connected yet. To enable Fitbit sync, we need to register an app at the Fitbit developer portal and add the client ID/secret to the app\'s environment variables. Heads up: Fitbit requires an app review before it can read real user data in production, which can take a few days.',
    devConsoleUrl: 'https://dev.fitbit.com/apps/new',
    devConsoleLabel: 'Fitbit Developer Portal',
  },
  {
    id: 'oura',
    name: 'Oura',
    description: 'Sleep quality, readiness, and recovery from the Oura Ring.',
    setupInstructions:
      'Not connected yet. To enable Oura sync, we need to register an application at the Oura developer portal and add the client ID/secret to the app\'s environment variables.',
    devConsoleUrl: 'https://cloud.ouraring.com/oauth/applications',
    devConsoleLabel: 'Oura Developer Portal',
  },
];
