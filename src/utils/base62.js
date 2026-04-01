const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const base = chars.length;

function encode(num) {
  let result = "";

  while (num > 0) {
    result = chars[num % base] + result;
    num = Math.floor(num / base);
  }

  return result || "a";
}

module.exports = { encode };
