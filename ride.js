// Combined route, date/time, and recurrence payload construction.
// The Telegram bot must still validate every submitted field server-side.
const rideState = {
  areas: {},
  from: {
    city: "",
    area: "",
  },
  to: {
    city: "",
    area: "",
  },
  datetime: "",
  date: "",
  time: "",
  display: "",
  isRecurring: false,
  repeatCount: "",
};

const maxRepeatCount = 30;
const longRideOptionLength = 18;
const rideAreaCollator = new Intl.Collator("ar", { numeric: true });

const endpointLabels = {
  from: {
    areaPlaceholder: "ابحث عن منطقة الانطلاق",
    cityFirstPlaceholder: "اختر مدينة الانطلاق أولاً",
    cityEmptyText: "لا توجد مدن انطلاق مطابقة.",
    areaEmptyText: "لا توجد مناطق انطلاق مطابقة.",
  },
  to: {
    areaPlaceholder: "ابحث عن منطقة الوصول",
    cityFirstPlaceholder: "اختر مدينة الوصول أولاً",
    cityEmptyText: "لا توجد مدن وصول مطابقة.",
    areaEmptyText: "لا توجد مناطق وصول مطابقة.",
  },
};

const rideElements = {
  loadError: document.getElementById("loadError"),
  routeError: document.getElementById("routeError"),
  dateTimeInput: document.getElementById("dateTimeInput"),
  quickTimeButtons: document.querySelectorAll(".quick-time-button"),
  recurringCheckbox: document.getElementById("recurringCheckbox"),
  repeatCountGroup: document.getElementById("repeatCountGroup"),
  repeatCountInput: document.getElementById("repeatCountInput"),
  summaryFrom: document.getElementById("summaryFrom"),
  summaryTo: document.getElementById("summaryTo"),
  summaryDateTime: document.getElementById("summaryDateTime"),
  summaryRecurring: document.getElementById("summaryRecurring"),
  summaryRepeatRow: document.getElementById("summaryRepeatRow"),
  summaryRepeatCount: document.getElementById("summaryRepeatCount"),
  submitButton: document.getElementById("submitButton"),
  fallback: {
    wrapper: document.getElementById("browserFallback"),
    status: document.getElementById("fallbackStatus"),
    output: document.getElementById("fallbackOutput"),
    copyButton: document.getElementById("copyButton"),
  },
  endpoints: {
    from: {
      citySearch: document.getElementById("fromCitySearch"),
      cityList: document.getElementById("fromCityList"),
      areaSearch: document.getElementById("fromAreaSearch"),
      areaList: document.getElementById("fromAreaList"),
    },
    to: {
      citySearch: document.getElementById("toCitySearch"),
      cityList: document.getElementById("toCityList"),
      areaSearch: document.getElementById("toAreaSearch"),
      areaList: document.getElementById("toAreaList"),
    },
  },
};

const minimumRideDateTime = getNextMinuteDate();

MiniApp.initTelegram();
rideElements.dateTimeInput.min = toDateTimeLocalValue(minimumRideDateTime);
setupEndpoint("from");
setupEndpoint("to");
loadRideAreas();
updateRideSummary();

rideElements.dateTimeInput.addEventListener("input", () => {
  setSelectedRideDateTime(rideElements.dateTimeInput.value);
});

rideElements.quickTimeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const minutes = Number(button.dataset.minutes);
    const selectedValue = toDateTimeLocalValue(getQuickRideDateTime(minutes));
    rideElements.dateTimeInput.value = selectedValue;
    setSelectedRideDateTime(selectedValue);
  });
});

rideElements.recurringCheckbox.addEventListener("change", () => {
  rideState.isRecurring = rideElements.recurringCheckbox.checked;
  if (!rideState.isRecurring) {
    rideState.repeatCount = "";
    rideElements.repeatCountInput.value = "";
  }
  updateRecurringControls();
  updateRideSummary();
});

rideElements.repeatCountInput.addEventListener("input", () => {
  rideState.repeatCount = normalizeDigitText(rideElements.repeatCountInput.value.trim());
  updateRideSummary();
});

rideElements.submitButton.addEventListener("click", () => {
  if (rideElements.submitButton.disabled) {
    return;
  }

  MiniApp.submitPayload(
    {
      type: "ride_selection",
      from_city: rideState.from.city,
      from_area: rideState.from.area,
      to_city: rideState.to.city,
      to_area: rideState.to.area,
      datetime: rideState.datetime,
      date: rideState.date,
      time: rideState.time,
      is_recurring: rideState.isRecurring,
      repeat_count: rideState.isRecurring ? rideState.repeatCount : null,
    },
    rideElements.fallback,
  );
});

function setupEndpoint(key) {
  const elements = rideElements.endpoints[key];

  elements.citySearch.addEventListener("input", () => {
    if (elements.citySearch.value !== rideState[key].city) {
      clearEndpointCity(key);
    }
    renderEndpointCities(key);
  });

  elements.areaSearch.addEventListener("input", () => {
    if (elements.areaSearch.value !== rideState[key].area) {
      rideState[key].area = "";
      updateRideSummary();
    }
    renderEndpointAreas(key);
  });
}

async function loadRideAreas() {
  try {
    const response = await fetch("data/areas.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`areas.json returned ${response.status}`);
    }

    const data = await response.json();
    validateRideAreaData(data);
    rideState.areas = data;
    renderEndpointCities("from");
    renderEndpointCities("to");
    updateRideSummary();
  } catch (error) {
    console.error(error);
    rideElements.loadError.hidden = false;
    rideElements.submitButton.disabled = true;
  }
}

function validateRideAreaData(data) {
  const valid =
    data &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    Object.values(data).every((areas) => Array.isArray(areas));

  if (!valid) {
    throw new Error("areas.json must be an object of city arrays");
  }
}

function renderEndpointCities(key) {
  const elements = rideElements.endpoints[key];
  const cities = Object.keys(rideState.areas).sort((a, b) => rideAreaCollator.compare(a, b));
  const matches = MiniApp.filterValues(cities, elements.citySearch.value);
  updateRideOptionDensity(elements.cityList, cities);

  MiniApp.renderOptions(
    elements.cityList,
    matches,
    rideState[key].city,
    (city) => selectEndpointCity(key, city),
    endpointLabels[key].cityEmptyText,
  );
}

function renderEndpointAreas(key) {
  const elements = rideElements.endpoints[key];
  if (!rideState[key].city) {
    updateRideOptionDensity(elements.areaList, []);
    elements.areaList.replaceChildren();
    return;
  }

  const areas = [...rideState.areas[rideState[key].city]].sort((a, b) => rideAreaCollator.compare(a, b));
  const matches = MiniApp.filterValues(areas, elements.areaSearch.value);
  updateRideOptionDensity(elements.areaList, areas);
  MiniApp.renderOptions(
    elements.areaList,
    matches,
    rideState[key].area,
    (area) => selectEndpointArea(key, area),
    endpointLabels[key].areaEmptyText,
  );
}

function updateRideOptionDensity(optionList, values) {
  optionList.classList.toggle(
    "long-options",
    values.some((value) => [...value].length > longRideOptionLength),
  );
}

function selectEndpointCity(key, city) {
  const elements = rideElements.endpoints[key];
  rideState[key].city = city;
  rideState[key].area = "";
  elements.citySearch.value = city;
  elements.areaSearch.value = "";
  elements.areaSearch.disabled = false;
  elements.areaSearch.placeholder = endpointLabels[key].areaPlaceholder;
  renderEndpointCities(key);
  renderEndpointAreas(key);
  updateRideSummary();
}

function clearEndpointCity(key) {
  const elements = rideElements.endpoints[key];
  rideState[key].city = "";
  rideState[key].area = "";
  elements.areaSearch.value = "";
  elements.areaSearch.disabled = true;
  elements.areaSearch.placeholder = endpointLabels[key].cityFirstPlaceholder;
  elements.areaList.replaceChildren();
  updateRideSummary();
}

function selectEndpointArea(key, area) {
  const elements = rideElements.endpoints[key];
  rideState[key].area = area;
  elements.areaSearch.value = area;
  renderEndpointAreas(key);
  updateRideSummary();
}

function setSelectedRideDateTime(value) {
  const selectedDate = parseDateTimeLocalValue(value);

  if (!selectedDate || selectedDate < minimumRideDateTime) {
    rideState.datetime = "";
    rideState.date = "";
    rideState.time = "";
    rideState.display = "";
    updateRideSummary();
    return;
  }

  rideState.date = padDatePart(selectedDate.getFullYear(), 4) +
    `-${padDatePart(selectedDate.getMonth() + 1)}-${padDatePart(selectedDate.getDate())}`;
  rideState.time = `${padDatePart(selectedDate.getHours())}:${padDatePart(selectedDate.getMinutes())}`;
  rideState.datetime = `${rideState.date} ${rideState.time}`;
  rideState.display = formatDisplayDateTime(selectedDate);
  updateRideSummary();
}

function updateRecurringControls() {
  rideElements.repeatCountGroup.hidden = !rideState.isRecurring;
  rideElements.repeatCountInput.disabled = !rideState.isRecurring;
  rideElements.repeatCountInput.required = rideState.isRecurring;
  rideElements.summaryRepeatRow.hidden = !rideState.isRecurring;
}

function updateRideSummary() {
  const sameRoute = hasSameRouteSelection();

  MiniApp.setSummaryText(rideElements.summaryFrom, selectedEndpointValue("from"));
  MiniApp.setSummaryText(rideElements.summaryTo, selectedEndpointValue("to"));
  MiniApp.setSummaryText(rideElements.summaryDateTime, rideState.display);
  rideElements.summaryRecurring.textContent = rideState.isRecurring ? "مكرر يومياً" : "عادي";
  MiniApp.setSummaryText(rideElements.summaryRepeatCount, rideState.repeatCount);
  rideElements.routeError.hidden = !sameRoute;

  rideElements.submitButton.disabled =
    !hasCompleteEndpoint("from") ||
    !hasCompleteEndpoint("to") ||
    !rideState.datetime ||
    sameRoute ||
    (rideState.isRecurring && !isValidRepeatCount(rideState.repeatCount));
}

function selectedEndpointValue(key) {
  if (!hasCompleteEndpoint(key)) {
    return "";
  }

  return `${rideState[key].city} - ${rideState[key].area}`;
}

function hasCompleteEndpoint(key) {
  return Boolean(rideState[key].city && rideState[key].area);
}

function hasSameRouteSelection() {
  return (
    hasCompleteEndpoint("from") &&
    hasCompleteEndpoint("to") &&
    rideState.from.city === rideState.to.city &&
    rideState.from.area === rideState.to.area
  );
}

function isValidRepeatCount(value) {
  if (!/^\d+$/.test(value)) {
    return false;
  }

  const count = Number(value);
  return Number.isInteger(count) && count >= 1 && count <= maxRepeatCount;
}

function normalizeDigitText(value) {
  return String(value || "").replace(/[٠-٩۰-۹]/g, (digit) => {
    const arabicIndic = "٠١٢٣٤٥٦٧٨٩".indexOf(digit);
    if (arabicIndic >= 0) {
      return String(arabicIndic);
    }

    return String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit));
  });
}

function parseDateTimeLocalValue(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match.map(Number);
  const parsed = new Date(year, month - 1, day, hour, minute, 0, 0);

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day ||
    parsed.getHours() !== hour ||
    parsed.getMinutes() !== minute
  ) {
    return null;
  }

  return parsed;
}

function getNextMinuteDate() {
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() + 1);
  return now;
}

function getQuickRideDateTime(minutesFromNow) {
  const selected = getNextMinuteDate();
  selected.setMinutes(selected.getMinutes() + minutesFromNow);
  return selected;
}

function toDateTimeLocalValue(date) {
  return `${padDatePart(date.getFullYear(), 4)}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

function padDatePart(value, size = 2) {
  return String(value).padStart(size, "0");
}

function formatDisplayDateTime(date) {
  return new Intl.DateTimeFormat("ar-SY", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}
