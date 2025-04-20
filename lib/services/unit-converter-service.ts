// Unit categories and their respective units
export type UnitCategory = {
  id: string
  name: string
  units: Unit[]
}

export type Unit = {
  id: string
  name: string
  symbol: string
}

export type ConversionHistory = {
  id: string
  fromValue: number
  fromUnit: string
  toUnit: string
  toValue: number
  category: string
  timestamp: number
}

// Define all available categories and their units
export const unitCategories: UnitCategory[] = [
  {
    id: "length",
    name: "Length",
    units: [
      { id: "meter", name: "Meter", symbol: "m" },
      { id: "kilometer", name: "Kilometer", symbol: "km" },
      { id: "centimeter", name: "Centimeter", symbol: "cm" },
      { id: "millimeter", name: "Millimeter", symbol: "mm" },
      { id: "micrometer", name: "Micrometer", symbol: "μm" },
      { id: "nanometer", name: "Nanometer", symbol: "nm" },
      { id: "mile", name: "Mile", symbol: "mi" },
      { id: "yard", name: "Yard", symbol: "yd" },
      { id: "foot", name: "Foot", symbol: "ft" },
      { id: "inch", name: "Inch", symbol: "in" },
      { id: "nautical_mile", name: "Nautical Mile", symbol: "nmi" },
    ],
  },
  {
    id: "weight",
    name: "Weight",
    units: [
      { id: "kilogram", name: "Kilogram", symbol: "kg" },
      { id: "gram", name: "Gram", symbol: "g" },
      { id: "milligram", name: "Milligram", symbol: "mg" },
      { id: "metric_ton", name: "Metric Ton", symbol: "t" },
      { id: "pound", name: "Pound", symbol: "lb" },
      { id: "ounce", name: "Ounce", symbol: "oz" },
      { id: "stone", name: "Stone", symbol: "st" },
      { id: "us_ton", name: "US Ton", symbol: "ton" },
      { id: "imperial_ton", name: "Imperial Ton", symbol: "long ton" },
    ],
  },
  {
    id: "temperature",
    name: "Temperature",
    units: [
      { id: "celsius", name: "Celsius", symbol: "°C" },
      { id: "fahrenheit", name: "Fahrenheit", symbol: "°F" },
      { id: "kelvin", name: "Kelvin", symbol: "K" },
    ],
  },
  {
    id: "area",
    name: "Area",
    units: [
      { id: "square_meter", name: "Square Meter", symbol: "m²" },
      { id: "square_kilometer", name: "Square Kilometer", symbol: "km²" },
      { id: "square_centimeter", name: "Square Centimeter", symbol: "cm²" },
      { id: "square_millimeter", name: "Square Millimeter", symbol: "mm²" },
      { id: "square_mile", name: "Square Mile", symbol: "mi²" },
      { id: "square_yard", name: "Square Yard", symbol: "yd²" },
      { id: "square_foot", name: "Square Foot", symbol: "ft²" },
      { id: "square_inch", name: "Square Inch", symbol: "in²" },
      { id: "acre", name: "Acre", symbol: "ac" },
      { id: "hectare", name: "Hectare", symbol: "ha" },
    ],
  },
  {
    id: "volume",
    name: "Volume",
    units: [
      { id: "cubic_meter", name: "Cubic Meter", symbol: "m³" },
      { id: "cubic_kilometer", name: "Cubic Kilometer", symbol: "km³" },
      { id: "cubic_centimeter", name: "Cubic Centimeter", symbol: "cm³" },
      { id: "cubic_millimeter", name: "Cubic Millimeter", symbol: "mm³" },
      { id: "liter", name: "Liter", symbol: "L" },
      { id: "milliliter", name: "Milliliter", symbol: "mL" },
      { id: "us_gallon", name: "US Gallon", symbol: "gal" },
      { id: "us_quart", name: "US Quart", symbol: "qt" },
      { id: "us_pint", name: "US Pint", symbol: "pt" },
      { id: "us_cup", name: "US Cup", symbol: "cup" },
      { id: "us_fluid_ounce", name: "US Fluid Ounce", symbol: "fl oz" },
      { id: "us_tablespoon", name: "US Tablespoon", symbol: "tbsp" },
      { id: "us_teaspoon", name: "US Teaspoon", symbol: "tsp" },
      { id: "imperial_gallon", name: "Imperial Gallon", symbol: "gal (UK)" },
      { id: "imperial_quart", name: "Imperial Quart", symbol: "qt (UK)" },
      { id: "imperial_pint", name: "Imperial Pint", symbol: "pt (UK)" },
      { id: "imperial_fluid_ounce", name: "Imperial Fluid Ounce", symbol: "fl oz (UK)" },
    ],
  },
  {
    id: "time",
    name: "Time",
    units: [
      { id: "second", name: "Second", symbol: "s" },
      { id: "millisecond", name: "Millisecond", symbol: "ms" },
      { id: "microsecond", name: "Microsecond", symbol: "μs" },
      { id: "nanosecond", name: "Nanosecond", symbol: "ns" },
      { id: "minute", name: "Minute", symbol: "min" },
      { id: "hour", name: "Hour", symbol: "h" },
      { id: "day", name: "Day", symbol: "d" },
      { id: "week", name: "Week", symbol: "wk" },
      { id: "month", name: "Month (avg)", symbol: "mo" },
      { id: "year", name: "Year", symbol: "yr" },
      { id: "decade", name: "Decade", symbol: "decade" },
      { id: "century", name: "Century", symbol: "century" },
    ],
  },
  {
    id: "speed",
    name: "Speed",
    units: [
      { id: "meter_per_second", name: "Meter per Second", symbol: "m/s" },
      { id: "kilometer_per_hour", name: "Kilometer per Hour", symbol: "km/h" },
      { id: "mile_per_hour", name: "Mile per Hour", symbol: "mph" },
      { id: "foot_per_second", name: "Foot per Second", symbol: "ft/s" },
      { id: "knot", name: "Knot", symbol: "kn" },
    ],
  },
  {
    id: "pressure",
    name: "Pressure",
    units: [
      { id: "pascal", name: "Pascal", symbol: "Pa" },
      { id: "kilopascal", name: "Kilopascal", symbol: "kPa" },
      { id: "megapascal", name: "Megapascal", symbol: "MPa" },
      { id: "bar", name: "Bar", symbol: "bar" },
      { id: "psi", name: "Pound per Square Inch", symbol: "psi" },
      { id: "atmosphere", name: "Atmosphere", symbol: "atm" },
      { id: "torr", name: "Torr", symbol: "Torr" },
      { id: "millimeter_of_mercury", name: "Millimeter of Mercury", symbol: "mmHg" },
    ],
  },
  {
    id: "energy",
    name: "Energy",
    units: [
      { id: "joule", name: "Joule", symbol: "J" },
      { id: "kilojoule", name: "Kilojoule", symbol: "kJ" },
      { id: "calorie", name: "Calorie", symbol: "cal" },
      { id: "kilocalorie", name: "Kilocalorie", symbol: "kcal" },
      { id: "watt_hour", name: "Watt Hour", symbol: "Wh" },
      { id: "kilowatt_hour", name: "Kilowatt Hour", symbol: "kWh" },
      { id: "electronvolt", name: "Electronvolt", symbol: "eV" },
      { id: "british_thermal_unit", name: "British Thermal Unit", symbol: "BTU" },
      { id: "us_therm", name: "US Therm", symbol: "thm" },
      { id: "foot_pound", name: "Foot-Pound", symbol: "ft⋅lb" },
    ],
  },
  {
    id: "data",
    name: "Data",
    units: [
      { id: "bit", name: "Bit", symbol: "b" },
      { id: "kilobit", name: "Kilobit", symbol: "kb" },
      { id: "megabit", name: "Megabit", symbol: "Mb" },
      { id: "gigabit", name: "Gigabit", symbol: "Gb" },
      { id: "terabit", name: "Terabit", symbol: "Tb" },
      { id: "byte", name: "Byte", symbol: "B" },
      { id: "kilobyte", name: "Kilobyte", symbol: "KB" },
      { id: "megabyte", name: "Megabyte", symbol: "MB" },
      { id: "gigabyte", name: "Gigabyte", symbol: "GB" },
      { id: "terabyte", name: "Terabyte", symbol: "TB" },
    ],
  },
]

// Conversion functions
export function convert(value: number, fromUnitId: string, toUnitId: string, categoryId: string): number {
  // If units are the same, return the value
  if (fromUnitId === toUnitId) {
    return value
  }

  // Convert to base unit first, then to target unit
  const baseValue = convertToBase(value, fromUnitId, categoryId)
  return convertFromBase(baseValue, toUnitId, categoryId)
}

// Convert from any unit to the base unit of its category
function convertToBase(value: number, unitId: string, categoryId: string): number {
  switch (categoryId) {
    case "length":
      return convertLengthToBase(value, unitId)
    case "weight":
      return convertWeightToBase(value, unitId)
    case "temperature":
      return convertTemperatureToBase(value, unitId)
    case "area":
      return convertAreaToBase(value, unitId)
    case "volume":
      return convertVolumeToBase(value, unitId)
    case "time":
      return convertTimeToBase(value, unitId)
    case "speed":
      return convertSpeedToBase(value, unitId)
    case "pressure":
      return convertPressureToBase(value, unitId)
    case "energy":
      return convertEnergyToBase(value, unitId)
    case "data":
      return convertDataToBase(value, unitId)
    default:
      return value
  }
}

// Convert from base unit to any unit
function convertFromBase(value: number, unitId: string, categoryId: string): number {
  switch (categoryId) {
    case "length":
      return convertLengthFromBase(value, unitId)
    case "weight":
      return convertWeightFromBase(value, unitId)
    case "temperature":
      return convertTemperatureFromBase(value, unitId)
    case "area":
      return convertAreaFromBase(value, unitId)
    case "volume":
      return convertVolumeFromBase(value, unitId)
    case "time":
      return convertTimeFromBase(value, unitId)
    case "speed":
      return convertSpeedFromBase(value, unitId)
    case "pressure":
      return convertPressureFromBase(value, unitId)
    case "energy":
      return convertEnergyFromBase(value, unitId)
    case "data":
      return convertDataFromBase(value, unitId)
    default:
      return value
  }
}

// Length conversions (base: meter)
function convertLengthToBase(value: number, unitId: string): number {
  switch (unitId) {
    case "meter":
      return value
    case "kilometer":
      return value * 1000
    case "centimeter":
      return value * 0.01
    case "millimeter":
      return value * 0.001
    case "micrometer":
      return value * 0.000001
    case "nanometer":
      return value * 0.000000001
    case "mile":
      return value * 1609.344
    case "yard":
      return value * 0.9144
    case "foot":
      return value * 0.3048
    case "inch":
      return value * 0.0254
    case "nautical_mile":
      return value * 1852
    default:
      return value
  }
}

function convertLengthFromBase(value: number, unitId: string): number {
  switch (unitId) {
    case "meter":
      return value
    case "kilometer":
      return value / 1000
    case "centimeter":
      return value / 0.01
    case "millimeter":
      return value / 0.001
    case "micrometer":
      return value / 0.000001
    case "nanometer":
      return value / 0.000000001
    case "mile":
      return value / 1609.344
    case "yard":
      return value / 0.9144
    case "foot":
      return value / 0.3048
    case "inch":
      return value / 0.0254
    case "nautical_mile":
      return value / 1852
    default:
      return value
  }
}

// Weight conversions (base: kilogram)
function convertWeightToBase(value: number, unitId: string): number {
  switch (unitId) {
    case "kilogram":
      return value
    case "gram":
      return value * 0.001
    case "milligram":
      return value * 0.000001
    case "metric_ton":
      return value * 1000
    case "pound":
      return value * 0.45359237
    case "ounce":
      return value * 0.028349523125
    case "stone":
      return value * 6.35029318
    case "us_ton":
      return value * 907.18474
    case "imperial_ton":
      return value * 1016.0469088
    default:
      return value
  }
}

function convertWeightFromBase(value: number, unitId: string): number {
  switch (unitId) {
    case "kilogram":
      return value
    case "gram":
      return value / 0.001
    case "milligram":
      return value / 0.000001
    case "metric_ton":
      return value / 1000
    case "pound":
      return value / 0.45359237
    case "ounce":
      return value / 0.028349523125
    case "stone":
      return value / 6.35029318
    case "us_ton":
      return value / 907.18474
    case "imperial_ton":
      return value / 1016.0469088
    default:
      return value
  }
}

// Temperature conversions (base: Kelvin)
function convertTemperatureToBase(value: number, unitId: string): number {
  switch (unitId) {
    case "celsius":
      return value + 273.15
    case "fahrenheit":
      return (value - 32) * (5 / 9) + 273.15
    case "kelvin":
      return value
    default:
      return value
  }
}

function convertTemperatureFromBase(value: number, unitId: string): number {
  switch (unitId) {
    case "celsius":
      return value - 273.15
    case "fahrenheit":
      return (value - 273.15) * (9 / 5) + 32
    case "kelvin":
      return value
    default:
      return value
  }
}

// Area conversions (base: square meter)
function convertAreaToBase(value: number, unitId: string): number {
  switch (unitId) {
    case "square_meter":
      return value
    case "square_kilometer":
      return value * 1000000
    case "square_centimeter":
      return value * 0.0001
    case "square_millimeter":
      return value * 0.000001
    case "square_mile":
      return value * 2589988.11
    case "square_yard":
      return value * 0.83612736
    case "square_foot":
      return value * 0.09290304
    case "square_inch":
      return value * 0.00064516
    case "acre":
      return value * 4046.8564224
    case "hectare":
      return value * 10000
    default:
      return value
  }
}

function convertAreaFromBase(value: number, unitId: string): number {
  switch (unitId) {
    case "square_meter":
      return value
    case "square_kilometer":
      return value / 1000000
    case "square_centimeter":
      return value / 0.0001
    case "square_millimeter":
      return value / 0.000001
    case "square_mile":
      return value / 2589988.11
    case "square_yard":
      return value / 0.83612736
    case "square_foot":
      return value / 0.09290304
    case "square_inch":
      return value / 0.00064516
    case "acre":
      return value / 4046.8564224
    case "hectare":
      return value / 10000
    default:
      return value
  }
}

// Volume conversions (base: cubic meter)
function convertVolumeToBase(value: number, unitId: string): number {
  switch (unitId) {
    case "cubic_meter":
      return value
    case "cubic_kilometer":
      return value * 1000000000
    case "cubic_centimeter":
      return value * 0.000001
    case "cubic_millimeter":
      return value * 0.000000001
    case "liter":
      return value * 0.001
    case "milliliter":
      return value * 0.000001
    case "us_gallon":
      return value * 0.00378541
    case "us_quart":
      return value * 0.000946353
    case "us_pint":
      return value * 0.000473176
    case "us_cup":
      return value * 0.000236588
    case "us_fluid_ounce":
      return value * 0.0000295735
    case "us_tablespoon":
      return value * 0.0000147868
    case "us_teaspoon":
      return value * 0.00000492892
    case "imperial_gallon":
      return value * 0.00454609
    case "imperial_quart":
      return value * 0.00113652
    case "imperial_pint":
      return value * 0.000568261
    case "imperial_fluid_ounce":
      return value * 0.0000284131
    default:
      return value
  }
}

function convertVolumeFromBase(value: number, unitId: string): number {
  switch (unitId) {
    case "cubic_meter":
      return value
    case "cubic_kilometer":
      return value / 1000000000
    case "cubic_centimeter":
      return value / 0.000001
    case "cubic_millimeter":
      return value / 0.000000001
    case "liter":
      return value / 0.001
    case "milliliter":
      return value / 0.000001
    case "us_gallon":
      return value / 0.00378541
    case "us_quart":
      return value / 0.000946353
    case "us_pint":
      return value / 0.000473176
    case "us_cup":
      return value / 0.000236588
    case "us_fluid_ounce":
      return value / 0.0000295735
    case "us_tablespoon":
      return value / 0.0000147868
    case "us_teaspoon":
      return value / 0.00000492892
    case "imperial_gallon":
      return value / 0.00454609
    case "imperial_quart":
      return value / 0.00113652
    case "imperial_pint":
      return value / 0.000568261
    case "imperial_fluid_ounce":
      return value / 0.0000284131
    default:
      return value
  }
}

// Time conversions (base: second)
function convertTimeToBase(value: number, unitId: string): number {
  switch (unitId) {
    case "second":
      return value
    case "millisecond":
      return value * 0.001
    case "microsecond":
      return value * 0.000001
    case "nanosecond":
      return value * 0.000000001
    case "minute":
      return value * 60
    case "hour":
      return value * 3600
    case "day":
      return value * 86400
    case "week":
      return value * 604800
    case "month":
      return value * 2629746 // Average month (30.44 days)
    case "year":
      return value * 31556952 // Average year (365.24 days)
    case "decade":
      return value * 315569520
    case "century":
      return value * 3155695200
    default:
      return value
  }
}

function convertTimeFromBase(value: number, unitId: string): number {
  switch (unitId) {
    case "second":
      return value
    case "millisecond":
      return value / 0.001
    case "microsecond":
      return value / 0.000001
    case "nanosecond":
      return value / 0.000000001
    case "minute":
      return value / 60
    case "hour":
      return value / 3600
    case "day":
      return value / 86400
    case "week":
      return value / 604800
    case "month":
      return value / 2629746
    case "year":
      return value / 31556952
    case "decade":
      return value / 315569520
    case "century":
      return value / 3155695200
    default:
      return value
  }
}

// Speed conversions (base: meter per second)
function convertSpeedToBase(value: number, unitId: string): number {
  switch (unitId) {
    case "meter_per_second":
      return value
    case "kilometer_per_hour":
      return value * (1000 / 3600)
    case "mile_per_hour":
      return value * 0.44704
    case "foot_per_second":
      return value * 0.3048
    case "knot":
      return value * 0.514444
    default:
      return value
  }
}

function convertSpeedFromBase(value: number, unitId: string): number {
  switch (unitId) {
    case "meter_per_second":
      return value
    case "kilometer_per_hour":
      return value / (1000 / 3600)
    case "mile_per_hour":
      return value / 0.44704
    case "foot_per_second":
      return value / 0.3048
    case "knot":
      return value / 0.514444
    default:
      return value
  }
}

// Pressure conversions (base: pascal)
function convertPressureToBase(value: number, unitId: string): number {
  switch (unitId) {
    case "pascal":
      return value
    case "kilopascal":
      return value * 1000
    case "megapascal":
      return value * 1000000
    case "bar":
      return value * 100000
    case "psi":
      return value * 6894.76
    case "atmosphere":
      return value * 101325
    case "torr":
      return value * 133.322
    case "millimeter_of_mercury":
      return value * 133.322
    default:
      return value
  }
}

function convertPressureFromBase(value: number, unitId: string): number {
  switch (unitId) {
    case "pascal":
      return value
    case "kilopascal":
      return value / 1000
    case "megapascal":
      return value / 1000000
    case "bar":
      return value / 100000
    case "psi":
      return value / 6894.76
    case "atmosphere":
      return value / 101325
    case "torr":
      return value / 133.322
    case "millimeter_of_mercury":
      return value / 133.322
    default:
      return value
  }
}

// Energy conversions (base: joule)
function convertEnergyToBase(value: number, unitId: string): number {
  switch (unitId) {
    case "joule":
      return value
    case "kilojoule":
      return value * 1000
    case "calorie":
      return value * 4.184
    case "kilocalorie":
      return value * 4184
    case "watt_hour":
      return value * 3600
    case "kilowatt_hour":
      return value * 3600000
    case "electronvolt":
      return value * 1.602176634e-19
    case "british_thermal_unit":
      return value * 1055.06
    case "us_therm":
      return value * 105506000
    case "foot_pound":
      return value * 1.35582
    default:
      return value
  }
}

function convertEnergyFromBase(value: number, unitId: string): number {
  switch (unitId) {
    case "joule":
      return value
    case "kilojoule":
      return value / 1000
    case "calorie":
      return value / 4.184
    case "kilocalorie":
      return value / 4184
    case "watt_hour":
      return value / 3600
    case "kilowatt_hour":
      return value / 3600000
    case "electronvolt":
      return value / 1.602176634e-19
    case "british_thermal_unit":
      return value / 1055.06
    case "us_therm":
      return value / 105506000
    case "foot_pound":
      return value / 1.35582
    default:
      return value
  }
}

// Data conversions (base: bit)
function convertDataToBase(value: number, unitId: string): number {
  switch (unitId) {
    case "bit":
      return value
    case "kilobit":
      return value * 1000
    case "megabit":
      return value * 1000000
    case "gigabit":
      return value * 1000000000
    case "terabit":
      return value * 1000000000000
    case "byte":
      return value * 8
    case "kilobyte":
      return value * 8000
    case "megabyte":
      return value * 8000000
    case "gigabyte":
      return value * 8000000000
    case "terabyte":
      return value * 8000000000000
    default:
      return value
  }
}

function convertDataFromBase(value: number, unitId: string): number {
  switch (unitId) {
    case "bit":
      return value
    case "kilobit":
      return value / 1000
    case "megabit":
      return value / 1000000
    case "gigabit":
      return value / 1000000000
    case "terabit":
      return value / 1000000000000
    case "byte":
      return value / 8
    case "kilobyte":
      return value / 8000
    case "megabyte":
      return value / 8000000
    case "gigabyte":
      return value / 8000000000
    case "terabyte":
      return value / 8000000000000
    default:
      return value
  }
}

// Format the result with appropriate precision
export function formatResult(value: number): string {
  if (Math.abs(value) < 0.000001 && value !== 0) {
    return value.toExponential(6)
  }

  if (Number.isInteger(value)) {
    return value.toString()
  }

  // For decimal numbers, limit to 6 significant digits
  return value.toPrecision(6).replace(/\.?0+$/, "")
}

// Save conversion to history
export function saveToHistory(
  fromValue: number,
  fromUnit: string,
  toUnit: string,
  toValue: number,
  category: string,
): void {
  try {
    const history = getHistory()
    const newEntry: ConversionHistory = {
      id: Date.now().toString(),
      fromValue,
      fromUnit,
      toUnit,
      toValue,
      category,
      timestamp: Date.now(),
    }

    history.unshift(newEntry)

    // Limit history to 50 entries
    if (history.length > 50) {
      history.pop()
    }

    localStorage.setItem("unitConverterHistory", JSON.stringify(history))
  } catch (error) {
    console.error("Failed to save to history:", error)
  }
}

// Get conversion history
export function getHistory(): ConversionHistory[] {
  try {
    const history = localStorage.getItem("unitConverterHistory")
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error("Failed to get history:", error)
    return []
  }
}

// Clear conversion history
export function clearHistory(): void {
  try {
    localStorage.removeItem("unitConverterHistory")
  } catch (error) {
    console.error("Failed to clear history:", error)
  }
}
