import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricAvailability {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

export async function getBiometricAvailability(): Promise<BiometricAvailability> {
  const [
    hasHardware,
    isEnrolled,
    supportedTypes,
  ] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);

  return {
    hasHardware,
    isEnrolled,
    supportedTypes,
  };
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  const availability = await getBiometricAvailability();

  if (!availability.hasHardware || !availability.isEnrolled) {
    return false;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Desbloquear HomeLive',
    promptSubtitle: 'Confirma tu identidad para continuar',
    cancelLabel: 'Cancelar',
    biometricsSecurityLevel: 'strong',
    disableDeviceFallback: false,
  });

  return result.success;
}
