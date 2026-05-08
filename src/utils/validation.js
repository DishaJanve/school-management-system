function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidLatitude(value) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isValidLongitude(value) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

function validateSchoolPayload(payload) {
  const errors = [];
  const latitude = Number(payload.latitude);
  const longitude = Number(payload.longitude);

  if (!isNonEmptyString(payload.name)) {
    errors.push("name must be a non-empty string");
  }
  if (!isNonEmptyString(payload.address)) {
    errors.push("address must be a non-empty string");
  }
  if (!isValidLatitude(latitude)) {
    errors.push("latitude must be a valid number between -90 and 90");
  }
  if (!isValidLongitude(longitude)) {
    errors.push("longitude must be a valid number between -180 and 180");
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanedData: {
      name: payload.name?.trim(),
      address: payload.address?.trim(),
      latitude,
      longitude,
    },
  };
}

function validateUserCoordinates(query) {
  const latitude = Number(query.latitude);
  const longitude = Number(query.longitude);
  const errors = [];

  if (!isValidLatitude(latitude)) {
    errors.push("latitude query param must be a valid number between -90 and 90");
  }
  if (!isValidLongitude(longitude)) {
    errors.push("longitude query param must be a valid number between -180 and 180");
  }

  return {
    isValid: errors.length === 0,
    errors,
    latitude,
    longitude,
  };
}

module.exports = {
  validateSchoolPayload,
  validateUserCoordinates,
};
