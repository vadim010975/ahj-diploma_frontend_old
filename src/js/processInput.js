export default function processInput(str) {
  str = str.replace(/\[|\]|\s/gi, "");
  if (!/^-?\d+\.?\d*,{1}-?\d+\.?\d*$/.test(str)) {
    return { error: "Данные введены не корректно" };
  }
  const [latitude, longitude] = str.split(",");
  if (Math.abs(latitude) > 90) {
    return { error: "Широта введена не корректно" };
  }
  if (Math.abs(longitude) > 180) {
    return { error: "Долгота введена не корректно" };
  }
  return {
    latitude,
    longitude,
  };
}
