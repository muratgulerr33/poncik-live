export function hasSettledLiveWatchVideoPlayback(videoElement: HTMLVideoElement | null) {
  if (!videoElement || videoElement.srcObject === null) {
    return false;
  }

  if (videoElement.paused || videoElement.ended) {
    return false;
  }

  if (videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return false;
  }

  return videoElement.videoWidth > 0 && videoElement.videoHeight > 0;
}
