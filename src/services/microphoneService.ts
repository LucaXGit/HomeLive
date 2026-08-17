import {
  AudioModule,
  RecordingPresets,
  useAudioRecorder,
} from 'expo-audio';

export interface MicrophonePermissionResult {
  granted: boolean;
  canAskAgain: boolean;
}

export async function getMicrophonePermission():
  Promise<MicrophonePermissionResult> {
  const permission =
    await AudioModule.getRecordingPermissionsAsync();

  return {
    granted: permission.granted,
    canAskAgain: permission.canAskAgain,
  };
}

export async function requestMicrophonePermission():
  Promise<MicrophonePermissionResult> {
  const permission =
    await AudioModule.requestRecordingPermissionsAsync();

  return {
    granted: permission.granted,
    canAskAgain: permission.canAskAgain,
  };
}

export {
  RecordingPresets,
  useAudioRecorder,
};