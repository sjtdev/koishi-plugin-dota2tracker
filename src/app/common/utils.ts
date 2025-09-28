import { I18NService } from "./i18n";
import { DateTime } from "luxon";

export function sec2time(sec: number): string {
  return sec ? (sec < 0 ? "-" : "") + Math.floor(Math.abs(sec) / 60) + ":" + ("00" + (Math.abs(sec) % 60)).slice(-2) : "--:--";
}
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/** 四舍五入小数
 * @param decimalPlaces 保留位数
 * @param number 进行四舍五入的数值
 * @returns 四舍五入后的数值
 */
export function roundToDecimalPlaces(number: number, decimalPlaces: number = 2) {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(number * factor) / factor;
}

/**
 * 将输入字符串进行简单哈希处理，并返回一个 [0, 1) 区间的随机数。
 * @param inputString
 * @returns 根据输入字符串生成的[0, 1) 区间的数值。
 */
export function enhancedSimpleHashToSeed(inputString) {
  // 将字符串转化为 Base64 编码
  const encoded = btoa(inputString);

  // 多轮处理以增加散列性
  let total = 0;
  let complexFactor = 1; // 引入一个复杂因子，每次循环后递增
  for (let i = 0; i < encoded.length; i++) {
    // 计算字符代码，并通过复杂因子增加变化
    total += encoded.charCodeAt(i) * complexFactor;
    // 逐轮改变复杂因子，例如递增
    complexFactor++;
    // 为避免数字过大，及时应用取模
    total %= 9973; // 使用质数增加随机性
  }

  // 应用更复杂的散列方法，不必等到最后再平方
  total = ((total % 9973) * (total % 9973)) % 9973; // 再次应用模以保持数字大小

  // 通过取模操作和除法将总和转化为 [0, 1) 区间内的数
  return (total % 1000) / 1000;
}
/**
 * 格式化一个日期为自定义的、支持多语言的相对时间字符串 (使用 Luxon)。
 * @param targetDate Luxon 的 DateTime 对象
 * @param i18n 你的 I18NService 实例
 * @param languageTag 当前的语言标签 (e.g., 'zh-CN')
 * @returns 格式化后的字符串
 */
export function formatCustomRelativeTime(targetDate: DateTime, i18n: I18NService, languageTag: string): string {
  const now = DateTime.now();

  // Luxon 可以直接计算出月份差
  const diffInMonths = now.diff(targetDate, "months").get("months");

  // Luxon 内置的 toRelative() 功能非常强大
  if (diffInMonths < 12) {
    // 设置语言，然后获取相对时间
    return targetDate.setLocale(languageTag.toLowerCase()).toRelative({ base: now });
  } else {
    const years = Math.floor(diffInMonths / 12);
    const months = Math.floor(diffInMonths % 12);

    // 调用你的 i18n 服务，这部分逻辑不变
    if (months === 0) {
      return i18n.$t(languageTag, "dota2tracker.time.years_ago", { years });
    } else {
      return i18n.$t(languageTag, "dota2tracker.time.years_months_ago", { years, months });
    }
  }
}
/**
 * 将一个数字限制在指定的最小和最大值之间。
 *
 * @param num 需要被限制的数字。
 * @param min 允许的最小值。
 * @param max 允许的最大值。
 * @param defaultValue 如果 num 不是有效数字，则使用这个默认值。
 * @returns 返回一个在 [min, max] 区间内的新数字。
 */
export function clamp(num: number, min: number, max: number, defaultValue: number = 0): number {
  // 步骤 1: 检查 num 是否为有效数字，如果不是，则使用 defaultValue
  const valueToClamp = Number.isFinite(num) ? num : defaultValue;

  // 确保 min 不会大于 max
  if (min > max) {
    [min, max] = [max, min]; // 如果 min > max，则交换它们的值
    console.warn(`'clamp' function's min value (${min}) was greater than its max value (${max}). Their values have been swapped.`);
  }

  // 先用 Math.max 确保结果不小于 min
  // 然后用 Math.min 确保结果不大于 max
  return Math.min(Math.max(valueToClamp, min), max);
}
