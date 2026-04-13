function clampFocusValue(value) {
  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    return null;
  }

  return Math.min(100, Math.max(0, parsedValue));
}

export function normalizeFocusPoint(focus) {
  if (!focus || typeof focus !== 'object') {
    return null;
  }

  const x = clampFocusValue(focus.x);
  const y = clampFocusValue(focus.y);

  if (x === null && y === null) {
    return null;
  }

  return {
    x: x ?? 50,
    y: y ?? 50,
  };
}

export function toFocalPointPickerValue(focus) {
  const normalizedFocus = normalizeFocusPoint(focus);

  return {
    x: (normalizedFocus?.x ?? 50) / 100,
    y: (normalizedFocus?.y ?? 50) / 100,
  };
}

export function fromFocalPointPickerValue(point) {
  if (!point || typeof point !== 'object') {
    return null;
  }

  return normalizeFocusPoint({
    x: point.x * 100,
    y: point.y * 100,
  });
}

export function getObjectPositionValue(focus) {
  const normalizedFocus = normalizeFocusPoint(focus);

  if (!normalizedFocus) {
    return '50% 50%';
  }

  return `${normalizedFocus.x}% ${normalizedFocus.y}%`;
}

export function getCoverCropRect({naturalWidth, naturalHeight, width, height, focus}) {
  if (!naturalWidth || !naturalHeight || !width || !height) {
    return null;
  }

  const normalizedFocus = normalizeFocusPoint(focus);
  const positionX = (normalizedFocus?.x ?? 50) / 100;
  const positionY = (normalizedFocus?.y ?? 50) / 100;
  const dstRatio = width / height;
  const srcRatio = naturalWidth / naturalHeight;

  let sx;
  let sy;
  let sWidth;
  let sHeight;

  if (srcRatio > dstRatio) {
    sHeight = naturalHeight;
    sWidth = sHeight * dstRatio;
    sx = (naturalWidth - sWidth) * positionX;
    sy = 0;
  } else {
    sWidth = naturalWidth;
    sHeight = sWidth / dstRatio;
    sx = 0;
    sy = (naturalHeight - sHeight) * positionY;
  }

  return {sx, sy, sWidth, sHeight};
}
