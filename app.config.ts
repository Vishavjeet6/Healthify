import type { ExpoConfig } from 'expo/config';

/**
 * app.config.ts runs in Expo's config-loading Node process, which does
 * not resolve extensionless requires of sibling .ts files reliably —
 * importing src/constants/brand.ts from here fails at load time. These
 * four values are duplicated from that file as a pragmatic exception;
 * app code (Metro-bundled) still treats src/constants/brand.ts as the
 * single source of truth. Keep both in sync on a rename.
 */
const APP_NAME = 'Foundation';
const BUNDLE_ID_IOS = 'com.fdn.app';
const BUNDLE_ID_ANDROID = 'com.fdn.app';
const URL_SCHEME = 'foundation';

const config: ExpoConfig = {
  name: APP_NAME,
  slug: URL_SCHEME,
  scheme: URL_SCHEME,
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: BUNDLE_ID_IOS,
  },
  android: {
    package: BUNDLE_ID_ANDROID,
    adaptiveIcon: {
      backgroundColor: '#0F1513',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router', 'expo-status-bar', 'expo-sqlite', 'expo-secure-store', 'expo-font'],
};

export default config;
