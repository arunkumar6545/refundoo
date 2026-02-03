// Dynamic imports to avoid breaking web builds
let Capacitor: any = null;
let AppModule: any = null;

// Lazy load Capacitor
const loadCapacitor = async () => {
  if (!Capacitor) {
    try {
      const capacitorModule = await import('@capacitor/core');
      Capacitor = capacitorModule.Capacitor;
      const appModule = await import('@capacitor/app');
      AppModule = appModule.App;
    } catch (error) {
      // Capacitor not available - running in web mode
      Capacitor = { isNativePlatform: () => false };
    }
  }
  return { Capacitor, App: AppModule };
};

export interface PermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export class MobilePermissions {
  static async isNativePlatform(): Promise<boolean> {
    const { Capacitor: Cap } = await loadCapacitor();
    return Cap?.isNativePlatform?.() || false;
  }
  
  static isNativePlatformSync(): boolean {
    // Fallback for synchronous checks
    return typeof window !== 'undefined' && 
           (window as any).Capacitor?.isNativePlatform?.() || false;
  }

  static async requestSMSPermission(): Promise<PermissionStatus> {
    const { Capacitor: Cap } = await loadCapacitor();
    if (!(await this.isNativePlatform())) {
      return { granted: false, denied: false, prompt: true };
    }

    // For Android
    if (Cap?.getPlatform?.() === 'android') {
      try {
        // @ts-ignore - Native plugin
        const { SmsRetriever } = window.cordova?.plugins || {};
        if (SmsRetriever) {
          const result = await new Promise<PermissionStatus>((resolve) => {
            SmsRetriever.requestPermission(
              () => resolve({ granted: true, denied: false, prompt: false }),
              () => resolve({ granted: false, denied: true, prompt: false })
            );
          });
          return result;
        }
      } catch (error) {
        console.error('SMS permission error:', error);
      }
    }

    // For iOS - SMS reading requires special entitlements
    if (Cap?.getPlatform?.() === 'ios') {
      // iOS doesn't allow direct SMS reading, but we can use MessageUI
      return { granted: false, denied: false, prompt: true };
    }

    return { granted: false, denied: false, prompt: true };
  }

  static async requestEmailPermission(): Promise<PermissionStatus> {
    if (!(await this.isNativePlatform())) {
      return { granted: false, denied: false, prompt: true };
    }

    // Email access typically requires user to grant access to email accounts
    // This is handled through system settings on both platforms
    return { granted: false, denied: false, prompt: true };
  }

  static async checkSMSPermission(): Promise<PermissionStatus> {
    const { Capacitor: Cap } = await loadCapacitor();
    if (!(await this.isNativePlatform())) {
      return { granted: false, denied: false, prompt: true };
    }

    if (Cap?.getPlatform?.() === 'android') {
      try {
        // @ts-ignore
        const { SmsRetriever } = window.cordova?.plugins || {};
        if (SmsRetriever) {
          const hasPermission = await new Promise<boolean>((resolve) => {
            SmsRetriever.hasPermission((granted: boolean) => resolve(granted));
          });
          return { granted: hasPermission, denied: !hasPermission, prompt: false };
        }
      } catch (error) {
        console.error('SMS permission check error:', error);
      }
    }

    return { granted: false, denied: false, prompt: true };
  }

  static async openAppSettings(): Promise<void> {
    const { App: AppClass } = await loadCapacitor();
    if (await this.isNativePlatform() && AppClass) {
      AppClass.openUrl({ url: 'app-settings:' });
    } else {
      alert('Please enable permissions in your device settings');
    }
  }
}
