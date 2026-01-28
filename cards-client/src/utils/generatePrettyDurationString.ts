export function generatePrettyDurationString(
  duration: {
    unit: 'hours' | 'minutes' | 'seconds';
    value?: number;
  },
  options?: {
    showHours?: boolean;
    showMinutes?: boolean;
    showSeconds?: boolean;
  },
): string {
  if (duration.value === 0) {
    return 'Unlimited';
  } else if (!duration.value) {
    return '';
  }
  // convert duration.value to seconds based on duration.unit
  duration.value =
    duration.unit === 'hours'
      ? duration.value * 60 * 60
      : duration.unit === 'minutes'
        ? duration.value * 60
        : duration.value;

  const { showHours, showMinutes, showSeconds } = {
    showHours: true,
    showMinutes: true,
    showSeconds: true,
    ...options,
  };

  const hours = Math.floor(duration.value / 3600);
  const minutes = Math.floor((duration.value % 3600) / 60);
  const seconds = Math.floor(duration.value % 60);

  const atLeastOneHour = duration.value >= 3600;
  const atLeastOneMinute = duration.value >= 60;

  const hoursString = showHours && atLeastOneHour ? `${hours}h ` : '';
  const minutesString = showMinutes && atLeastOneMinute ? `${minutes}m ` : '';
  const secondsString = showSeconds ? `${seconds}s ` : '';

  return `${hoursString}${minutesString}${secondsString}`.trim();
}
