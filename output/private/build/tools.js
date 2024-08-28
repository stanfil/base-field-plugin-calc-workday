"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateWorkdays = calculateWorkdays;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc")); // ES 2015
const timezone_1 = __importDefault(require("dayjs/plugin/timezone")); // ES 2015
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
async function fetchYear(year, fetch) {
    const shouldFetch = !(year in WorkDayData);
    if (!shouldFetch)
        return;
    // const url = `https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/${year}.json`;
    // 换成 国内源
    const url = `https://gitee.com/chenkis/holiday-cn/raw/master/${year}.json`;
    const options = {
        method: 'GET',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Cache-Control': 'max-age=0',
            'DNT': '1',
            'If-None-Match': 'W/"d5060afb488f0104168e8274e565cfc775caff0e65df85848840ab4f963a0316"',
            'Priority': 'u=0, i',
            'Sec-CH-UA': '"Chromium";v="127", "Not)A;Brand";v="99"',
            'Sec-CH-UA-Mobile': '?0',
            'Sec-CH-UA-Platform': '"macOS"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
        },
    };
    try {
        const response = await fetch(url);
        // console.log(11111, response.json())
        if (!response.ok) {
            throw new Error(`Failed to fetch data for year ${year}`);
        }
        const data = await response.json();
        // console.log(1111111, JSON.stringify(data))
        WorkDayData[year] = data;
    }
    catch (e) {
        // console.log(222222, JSON.stringify(e))
    }
}
// 获取指定年份的节假日数据
async function getHolidayData(year, fetch) {
    if (year > 2024) {
        // 从 GitHub 获取数据
        fetchYear(year, fetch);
        fetchYear(year + 1, fetch);
    }
    // 找到当年和下一年的数据，merge。因为元旦数据可能在下一年
    const curYearData = WorkDayData[year]?.days || [];
    const nextYearData = WorkDayData[(year + 1)]?.days || [];
    const days = curYearData.concat(nextYearData);
    return days;
}
// 判断某天是否为工作日
async function isWorkday(date, fetch) {
    const year = date.year();
    const holidayData = await getHolidayData(year, fetch);
    // 转换日期格式为 YYYY-MM-DD
    const dateStr = date.format('YYYY-MM-DD');
    // console.log(dateStr)
    const dayInfo = holidayData.find(d => d.date === dateStr);
    if (dayInfo) {
        return [!dayInfo.isOffDay, true]; // 特殊的一天
    }
    // 如果不在 holidays 中，判断是否是周末
    const dayOfWeek = date.day();
    return [dayOfWeek !== 0 && dayOfWeek !== 6, false]; // 0: Sunday, 6: Saturday
}
// 计算两个日期之间的工作日天数
async function calculateWorkdays(startTimestamp, endTimestamp, includeEndDay, fetch) {
    // 设置时区，方便和中国时间比较
    dayjs_1.default.tz.setDefault("Asia/Shanghai");
    let workdays = 0;
    const startDate = (0, dayjs_1.default)(startTimestamp).startOf('day');
    let currentDate = startDate;
    let endDate = (0, dayjs_1.default)(endTimestamp).startOf('day');
    // 处理 endDay
    !includeEndDay && (endDate = endDate.subtract(1, 'day'));
    // console.log(currentDate, startDate, endDate)
    const workdayList = [];
    const dayoffList = [];
    while (currentDate.valueOf() <= endDate.valueOf()) {
        const [f, isSpecial] = await isWorkday(currentDate, fetch);
        if (f) {
            workdays++;
        }
        if (isSpecial) {
            if (f) {
                workdayList.push(currentDate.format('YYYY-MM-DD'));
            }
            else {
                dayoffList.push(currentDate.format('YYYY-MM-DD'));
            }
        }
        // console.log(currentDate, f)
        // 自增一天
        currentDate = currentDate.add(1, 'day');
    }
    // console.log(1111, workdays)
    return [workdays, dayoffList.join('\n'), workdayList.join('\n')];
}
const WorkDayData = {
    2024: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2024.json",
        "year": 2024,
        "papers": [
            "https://www.gov.cn/zhengce/zhengceku/202310/content_6911528.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2024-01-01",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2024-02-04",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2024-02-10",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2024-02-11",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2024-02-12",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2024-02-13",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2024-02-14",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2024-02-15",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2024-02-16",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2024-02-17",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2024-02-18",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2024-04-04",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2024-04-05",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2024-04-06",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2024-04-07",
                "isOffDay": false
            },
            {
                "name": "劳动节",
                "date": "2024-04-28",
                "isOffDay": false
            },
            {
                "name": "劳动节",
                "date": "2024-05-01",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2024-05-02",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2024-05-03",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2024-05-04",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2024-05-05",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2024-05-11",
                "isOffDay": false
            },
            {
                "name": "端午节",
                "date": "2024-06-10",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2024-09-14",
                "isOffDay": false
            },
            {
                "name": "中秋节",
                "date": "2024-09-15",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2024-09-16",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2024-09-17",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2024-09-29",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2024-10-01",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2024-10-02",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2024-10-03",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2024-10-04",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2024-10-05",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2024-10-06",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2024-10-07",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2024-10-12",
                "isOffDay": false
            }
        ]
    },
    2023: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2023.json",
        "year": 2023,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2022-12/08/content_5730844.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2022-12-31",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2023-01-01",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2023-01-02",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2023-01-21",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2023-01-22",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2023-01-23",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2023-01-24",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2023-01-25",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2023-01-26",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2023-01-27",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2023-01-28",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2023-01-29",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2023-04-05",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2023-04-23",
                "isOffDay": false
            },
            {
                "name": "劳动节",
                "date": "2023-04-29",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2023-04-30",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2023-05-01",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2023-05-02",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2023-05-03",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2023-05-06",
                "isOffDay": false
            },
            {
                "name": "端午节",
                "date": "2023-06-22",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2023-06-23",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2023-06-24",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2023-06-25",
                "isOffDay": false
            },
            {
                "name": "中秋节、国庆节",
                "date": "2023-09-29",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2023-09-30",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2023-10-01",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2023-10-02",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2023-10-03",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2023-10-04",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2023-10-05",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2023-10-06",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2023-10-07",
                "isOffDay": false
            },
            {
                "name": "中秋节、国庆节",
                "date": "2023-10-08",
                "isOffDay": false
            }
        ]
    },
    2022: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2022.json",
        "year": 2022,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2021-10/25/content_5644835.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2022-01-01",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2022-01-02",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2022-01-03",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2022-01-29",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2022-01-30",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2022-01-31",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2022-02-01",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2022-02-02",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2022-02-03",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2022-02-04",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2022-02-05",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2022-02-06",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2022-04-02",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2022-04-03",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2022-04-04",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2022-04-05",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2022-04-24",
                "isOffDay": false
            },
            {
                "name": "劳动节",
                "date": "2022-04-30",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2022-05-01",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2022-05-02",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2022-05-03",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2022-05-04",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2022-05-07",
                "isOffDay": false
            },
            {
                "name": "端午节",
                "date": "2022-06-03",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2022-06-04",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2022-06-05",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2022-09-10",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2022-09-11",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2022-09-12",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2022-10-01",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2022-10-02",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2022-10-03",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2022-10-04",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2022-10-05",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2022-10-06",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2022-10-07",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2022-10-08",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2022-10-09",
                "isOffDay": false
            }
        ]
    },
    2021: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2021.json",
        "year": 2021,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2020-11/25/content_5564127.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2021-01-01",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2021-01-02",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2021-01-03",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2021-02-07",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2021-02-11",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2021-02-12",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2021-02-13",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2021-02-14",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2021-02-15",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2021-02-16",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2021-02-17",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2021-02-20",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2021-04-03",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2021-04-04",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2021-04-05",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2021-04-25",
                "isOffDay": false
            },
            {
                "name": "劳动节",
                "date": "2021-05-01",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2021-05-02",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2021-05-03",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2021-05-04",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2021-05-05",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2021-05-08",
                "isOffDay": false
            },
            {
                "name": "端午节",
                "date": "2021-06-12",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2021-06-13",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2021-06-14",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2021-09-18",
                "isOffDay": false
            },
            {
                "name": "中秋节",
                "date": "2021-09-19",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2021-09-20",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2021-09-21",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2021-09-26",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2021-10-01",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2021-10-02",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2021-10-03",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2021-10-04",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2021-10-05",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2021-10-06",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2021-10-07",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2021-10-09",
                "isOffDay": false
            }
        ]
    },
    2020: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2020.json",
        "year": 2020,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2019-11/21/content_5454164.htm",
            "http://www.gov.cn/zhengce/zhengceku/2020-01/27/content_5472352.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2020-01-01",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2020-01-19",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2020-01-24",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2020-01-25",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2020-01-26",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2020-01-27",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2020-01-28",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2020-01-29",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2020-01-30",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2020-01-31",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2020-02-01",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2020-02-02",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2020-02-03",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2020-04-04",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2020-04-05",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2020-04-06",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2020-04-26",
                "isOffDay": false
            },
            {
                "name": "劳动节",
                "date": "2020-05-01",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2020-05-02",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2020-05-03",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2020-05-04",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2020-05-05",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2020-05-09",
                "isOffDay": false
            },
            {
                "name": "端午节",
                "date": "2020-06-25",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2020-06-26",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2020-06-27",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2020-06-28",
                "isOffDay": false
            },
            {
                "name": "国庆节、中秋节",
                "date": "2020-09-27",
                "isOffDay": false
            },
            {
                "name": "国庆节、中秋节",
                "date": "2020-10-01",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2020-10-02",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2020-10-03",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2020-10-04",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2020-10-05",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2020-10-06",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2020-10-07",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2020-10-08",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2020-10-10",
                "isOffDay": false
            }
        ]
    },
    2019: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2019.json",
        "year": 2019,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2018-12/06/content_5346276.htm",
            "http://www.gov.cn/zhengce/zhengceku/2019-03/22/content_5375877.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2018-12-29",
                "isOffDay": false
            },
            {
                "name": "元旦",
                "date": "2018-12-30",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2018-12-31",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2019-01-01",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2019-02-02",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2019-02-03",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2019-02-04",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2019-02-05",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2019-02-06",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2019-02-07",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2019-02-08",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2019-02-09",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2019-02-10",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2019-04-05",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2019-04-28",
                "isOffDay": false
            },
            {
                "name": "劳动节",
                "date": "2019-05-01",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2019-05-02",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2019-05-03",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2019-05-04",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2019-05-05",
                "isOffDay": false
            },
            {
                "name": "端午节",
                "date": "2019-06-07",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2019-09-13",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2019-09-29",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2019-10-01",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2019-10-02",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2019-10-03",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2019-10-04",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2019-10-05",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2019-10-06",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2019-10-07",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2019-10-12",
                "isOffDay": false
            }
        ]
    },
    2018: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2018.json",
        "year": 2018,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2017-11/30/content_5243579.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2018-01-01",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2018-02-11",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2018-02-15",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2018-02-16",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2018-02-17",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2018-02-18",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2018-02-19",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2018-02-20",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2018-02-21",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2018-02-24",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2018-04-05",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2018-04-06",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2018-04-07",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2018-04-08",
                "isOffDay": false
            },
            {
                "name": "劳动节",
                "date": "2018-04-28",
                "isOffDay": false
            },
            {
                "name": "劳动节",
                "date": "2018-04-29",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2018-04-30",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2018-05-01",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2018-06-18",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2018-09-24",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2018-09-29",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2018-09-30",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2018-10-01",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2018-10-02",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2018-10-03",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2018-10-04",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2018-10-05",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2018-10-06",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2018-10-07",
                "isOffDay": true
            }
        ]
    },
    2017: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2017.json",
        "year": 2017,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2016-12/01/content_5141603.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2017-01-01",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2017-01-02",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2017-01-22",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2017-01-27",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2017-01-28",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2017-01-29",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2017-01-30",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2017-01-31",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2017-02-01",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2017-02-02",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2017-02-04",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2017-04-01",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2017-04-02",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2017-04-03",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2017-04-04",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2017-05-01",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2017-05-27",
                "isOffDay": false
            },
            {
                "name": "端午节",
                "date": "2017-05-28",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2017-05-29",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2017-05-30",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2017-09-30",
                "isOffDay": false
            },
            {
                "name": "中秋节、国庆节",
                "date": "2017-10-01",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2017-10-02",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2017-10-03",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2017-10-04",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2017-10-05",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2017-10-06",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2017-10-07",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2017-10-08",
                "isOffDay": true
            }
        ]
    },
    2016: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2016.json",
        "year": 2016,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2015-12/10/content_10394.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2016-01-01",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2016-02-06",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2016-02-07",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2016-02-08",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2016-02-09",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2016-02-10",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2016-02-11",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2016-02-12",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2016-02-13",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2016-02-14",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2016-04-04",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2016-05-01",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2016-05-02",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2016-06-09",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2016-06-10",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2016-06-11",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2016-06-12",
                "isOffDay": false
            },
            {
                "name": "中秋节",
                "date": "2016-09-15",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2016-09-16",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2016-09-17",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2016-09-18",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2016-10-01",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2016-10-02",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2016-10-03",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2016-10-04",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2016-10-05",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2016-10-06",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2016-10-07",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2016-10-08",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2016-10-09",
                "isOffDay": false
            }
        ]
    },
    2015: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2015.json",
        "year": 2015,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2014-12/16/content_9302.htm",
            "http://www.gov.cn/zhengce/zhengceku/2015-05/13/content_9742.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2015-01-01",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2015-01-02",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2015-01-03",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2015-01-04",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2015-02-15",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2015-02-18",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2015-02-19",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2015-02-20",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2015-02-21",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2015-02-22",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2015-02-23",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2015-02-24",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2015-02-28",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2015-04-05",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2015-04-06",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2015-05-01",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2015-06-20",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2015-06-22",
                "isOffDay": true
            },
            {
                "name": "抗日战争暨世界反法西斯战争胜利70周年纪念日",
                "date": "2015-09-03",
                "isOffDay": true
            },
            {
                "name": "抗日战争暨世界反法西斯战争胜利70周年纪念日",
                "date": "2015-09-04",
                "isOffDay": true
            },
            {
                "name": "抗日战争暨世界反法西斯战争胜利70周年纪念日",
                "date": "2015-09-05",
                "isOffDay": true
            },
            {
                "name": "抗日战争暨世界反法西斯战争胜利70周年纪念日",
                "date": "2015-09-06",
                "isOffDay": false
            },
            {
                "name": "中秋节",
                "date": "2015-09-27",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2015-10-01",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2015-10-02",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2015-10-03",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2015-10-04",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2015-10-05",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2015-10-06",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2015-10-07",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2015-10-10",
                "isOffDay": false
            }
        ]
    },
    2014: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2014.json",
        "year": 2014,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2014-01/02/content_1194.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2014-01-01",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2014-01-26",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2014-01-31",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2014-02-01",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2014-02-02",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2014-02-03",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2014-02-04",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2014-02-05",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2014-02-06",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2014-02-08",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2014-04-05",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2014-04-07",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2014-05-01",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2014-05-02",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2014-05-03",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2014-05-04",
                "isOffDay": false
            },
            {
                "name": "端午节",
                "date": "2014-06-02",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2014-09-08",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2014-09-28",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2014-10-01",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2014-10-02",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2014-10-03",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2014-10-04",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2014-10-05",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2014-10-06",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2014-10-07",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2014-10-11",
                "isOffDay": false
            }
        ]
    },
    2013: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2013.json",
        "year": 2013,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2012-12/10/content_1353.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2013-01-01",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2013-01-02",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2013-01-03",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2013-01-05",
                "isOffDay": false
            },
            {
                "name": "元旦",
                "date": "2013-01-06",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2013-02-09",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2013-02-10",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2013-02-11",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2013-02-12",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2013-02-13",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2013-02-14",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2013-02-15",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2013-02-16",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2013-02-17",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2013-04-04",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2013-04-05",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2013-04-06",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2013-04-07",
                "isOffDay": false
            },
            {
                "name": "劳动节",
                "date": "2013-04-27",
                "isOffDay": false
            },
            {
                "name": "劳动节",
                "date": "2013-04-28",
                "isOffDay": false
            },
            {
                "name": "劳动节",
                "date": "2013-04-29",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2013-04-30",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2013-05-01",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2013-06-08",
                "isOffDay": false
            },
            {
                "name": "端午节",
                "date": "2013-06-09",
                "isOffDay": false
            },
            {
                "name": "端午节",
                "date": "2013-06-10",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2013-06-11",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2013-06-12",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2013-09-19",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2013-09-20",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2013-09-21",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2013-09-22",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2013-09-29",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2013-10-01",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2013-10-02",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2013-10-03",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2013-10-04",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2013-10-05",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2013-10-06",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2013-10-07",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2013-10-12",
                "isOffDay": false
            }
        ]
    },
    2012: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2012.json",
        "year": 2012,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2011-12/06/content_1411.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2011-12-31",
                "isOffDay": false
            },
            {
                "name": "元旦",
                "date": "2012-01-01",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2012-01-02",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2012-01-03",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2012-01-21",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2012-01-22",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2012-01-23",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2012-01-24",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2012-01-25",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2012-01-26",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2012-01-27",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2012-01-28",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2012-01-29",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2012-03-31",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2012-04-01",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2012-04-02",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2012-04-03",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2012-04-04",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2012-04-28",
                "isOffDay": false
            },
            {
                "name": "劳动节",
                "date": "2012-04-29",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2012-04-30",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2012-05-01",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2012-06-22",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2012-06-23",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2012-06-24",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2012-09-29",
                "isOffDay": false
            },
            {
                "name": "中秋节、国庆节",
                "date": "2012-09-30",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2012-10-01",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2012-10-02",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2012-10-03",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2012-10-04",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2012-10-05",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2012-10-06",
                "isOffDay": true
            },
            {
                "name": "中秋节、国庆节",
                "date": "2012-10-07",
                "isOffDay": true
            }
        ]
    },
    2011: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2011.json",
        "year": 2011,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2010-12/10/content_1423.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2011-01-01",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2011-01-02",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2011-01-03",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2011-01-30",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2011-02-02",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2011-02-03",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2011-02-04",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2011-02-05",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2011-02-06",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2011-02-07",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2011-02-08",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2011-02-12",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2011-04-02",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2011-04-03",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2011-04-04",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2011-04-05",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2011-04-30",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2011-05-01",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2011-05-02",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2011-06-04",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2011-06-05",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2011-06-06",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2011-09-10",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2011-09-11",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2011-09-12",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2011-10-01",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2011-10-02",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2011-10-03",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2011-10-04",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2011-10-05",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2011-10-06",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2011-10-07",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2011-10-08",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2011-10-09",
                "isOffDay": false
            }
        ]
    },
    2010: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2010.json",
        "year": 2010,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2009-12/08/content_1476.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2010-01-01",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2010-01-02",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2010-01-03",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2010-02-13",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2010-02-14",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2010-02-15",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2010-02-16",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2010-02-17",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2010-02-18",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2010-02-19",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2010-02-20",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2010-02-21",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2010-04-03",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2010-04-04",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2010-04-05",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2010-05-01",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2010-05-02",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2010-05-03",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2010-06-12",
                "isOffDay": false
            },
            {
                "name": "端午节",
                "date": "2010-06-13",
                "isOffDay": false
            },
            {
                "name": "端午节",
                "date": "2010-06-14",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2010-06-15",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2010-06-16",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2010-09-19",
                "isOffDay": false
            },
            {
                "name": "中秋节",
                "date": "2010-09-22",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2010-09-23",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2010-09-24",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2010-09-25",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2010-09-26",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2010-10-01",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2010-10-02",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2010-10-03",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2010-10-04",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2010-10-05",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2010-10-06",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2010-10-07",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2010-10-09",
                "isOffDay": false
            }
        ]
    },
    2009: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2009.json",
        "year": 2009,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2008-12/10/content_1572.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2009-01-01",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2009-01-02",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2009-01-03",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2009-01-04",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2009-01-24",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2009-01-25",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2009-01-26",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2009-01-27",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2009-01-28",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2009-01-29",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2009-01-30",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2009-01-31",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2009-02-01",
                "isOffDay": false
            },
            {
                "name": "清明节",
                "date": "2009-04-04",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2009-04-05",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2009-04-06",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2009-05-01",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2009-05-02",
                "isOffDay": true
            },
            {
                "name": "劳动节",
                "date": "2009-05-03",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2009-05-28",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2009-05-29",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2009-05-30",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2009-05-31",
                "isOffDay": false
            },
            {
                "name": "国庆节、中秋节",
                "date": "2009-09-27",
                "isOffDay": false
            },
            {
                "name": "国庆节、中秋节",
                "date": "2009-10-01",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2009-10-02",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2009-10-03",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2009-10-04",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2009-10-05",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2009-10-06",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2009-10-07",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2009-10-08",
                "isOffDay": true
            },
            {
                "name": "国庆节、中秋节",
                "date": "2009-10-10",
                "isOffDay": false
            }
        ]
    },
    2008: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2008.json",
        "year": 2008,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2008-03/28/content_1645.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2007-12-29",
                "isOffDay": false
            },
            {
                "name": "元旦",
                "date": "2007-12-30",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2007-12-31",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2008-01-01",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2008-02-02",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2008-02-03",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2008-02-06",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2008-02-07",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2008-02-08",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2008-02-09",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2008-02-10",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2008-02-11",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2008-02-12",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2008-04-04",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2008-04-05",
                "isOffDay": true
            },
            {
                "name": "清明节",
                "date": "2008-04-06",
                "isOffDay": true
            },
            {
                "name": "“五一”国际劳动节",
                "date": "2008-05-01",
                "isOffDay": true
            },
            {
                "name": "“五一”国际劳动节",
                "date": "2008-05-02",
                "isOffDay": true
            },
            {
                "name": "“五一”国际劳动节",
                "date": "2008-05-03",
                "isOffDay": true
            },
            {
                "name": "“五一”国际劳动节",
                "date": "2008-05-04",
                "isOffDay": false
            },
            {
                "name": "端午节",
                "date": "2008-06-07",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2008-06-08",
                "isOffDay": true
            },
            {
                "name": "端午节",
                "date": "2008-06-09",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2008-09-13",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2008-09-14",
                "isOffDay": true
            },
            {
                "name": "中秋节",
                "date": "2008-09-15",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2008-09-27",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2008-09-28",
                "isOffDay": false
            },
            {
                "name": "国庆节",
                "date": "2008-09-29",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2008-09-30",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2008-10-01",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2008-10-02",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2008-10-03",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2008-10-04",
                "isOffDay": true
            },
            {
                "name": "国庆节",
                "date": "2008-10-05",
                "isOffDay": true
            }
        ]
    },
    2007: {
        "$schema": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/schema.json",
        "$id": "https://raw.githubusercontent.com/NateScarlet/holiday-cn/master/2007.json",
        "year": 2007,
        "papers": [
            "http://www.gov.cn/zhengce/zhengceku/2008-03/28/content_1761.htm"
        ],
        "days": [
            {
                "name": "元旦",
                "date": "2006-12-30",
                "isOffDay": false
            },
            {
                "name": "元旦",
                "date": "2006-12-31",
                "isOffDay": false
            },
            {
                "name": "元旦",
                "date": "2007-01-01",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2007-01-02",
                "isOffDay": true
            },
            {
                "name": "元旦",
                "date": "2007-01-03",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2007-02-17",
                "isOffDay": false
            },
            {
                "name": "春节",
                "date": "2007-02-18",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2007-02-19",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2007-02-20",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2007-02-21",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2007-02-22",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2007-02-23",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2007-02-24",
                "isOffDay": true
            },
            {
                "name": "春节",
                "date": "2007-02-25",
                "isOffDay": false
            },
            {
                "name": "“五一”",
                "date": "2007-04-28",
                "isOffDay": false
            },
            {
                "name": "“五一”",
                "date": "2007-04-29",
                "isOffDay": false
            },
            {
                "name": "“五一”",
                "date": "2007-05-01",
                "isOffDay": true
            },
            {
                "name": "“五一”",
                "date": "2007-05-02",
                "isOffDay": true
            },
            {
                "name": "“五一”",
                "date": "2007-05-03",
                "isOffDay": true
            },
            {
                "name": "“五一”",
                "date": "2007-05-04",
                "isOffDay": true
            },
            {
                "name": "“五一”",
                "date": "2007-05-05",
                "isOffDay": true
            },
            {
                "name": "“五一”",
                "date": "2007-05-06",
                "isOffDay": true
            },
            {
                "name": "“五一”",
                "date": "2007-05-07",
                "isOffDay": true
            },
            {
                "name": "“十一”",
                "date": "2007-09-29",
                "isOffDay": false
            },
            {
                "name": "“十一”",
                "date": "2007-09-30",
                "isOffDay": false
            },
            {
                "name": "“十一”",
                "date": "2007-10-01",
                "isOffDay": true
            },
            {
                "name": "“十一”",
                "date": "2007-10-02",
                "isOffDay": true
            },
            {
                "name": "“十一”",
                "date": "2007-10-03",
                "isOffDay": true
            },
            {
                "name": "“十一”",
                "date": "2007-10-04",
                "isOffDay": true
            },
            {
                "name": "“十一”",
                "date": "2007-10-05",
                "isOffDay": true
            },
            {
                "name": "“十一”",
                "date": "2007-10-06",
                "isOffDay": true
            },
            {
                "name": "“十一”",
                "date": "2007-10-07",
                "isOffDay": true
            }
        ]
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdG9vbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUE0RkEsOENBMkNDO0FBdklELGtEQUF5QjtBQUN6QiwyREFBa0MsQ0FBQyxVQUFVO0FBQzdDLHFFQUE0QyxDQUFDLFVBQVU7QUFHdkQsZUFBSyxDQUFDLE1BQU0sQ0FBQyxhQUFHLENBQUMsQ0FBQztBQUNsQixlQUFLLENBQUMsTUFBTSxDQUFDLGtCQUFRLENBQUMsQ0FBQztBQUV2QixLQUFLLFVBQVUsU0FBUyxDQUFDLElBQVksRUFBRSxLQUFLO0lBQzFDLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDLENBQUM7SUFDM0MsSUFBSSxDQUFDLFdBQVc7UUFBRSxPQUFNO0lBRXhCLDhGQUE4RjtJQUM5RixTQUFTO0lBQ1QsTUFBTSxHQUFHLEdBQUcsbURBQW1ELElBQUksT0FBTyxDQUFBO0lBQzFFLE1BQU0sT0FBTyxHQUFHO1FBQ2QsTUFBTSxFQUFFLEtBQUs7UUFDYixPQUFPLEVBQUU7WUFDUCxRQUFRLEVBQUUseUlBQXlJO1lBQ25KLGlCQUFpQixFQUFFLGdCQUFnQjtZQUNuQyxlQUFlLEVBQUUsV0FBVztZQUM1QixLQUFLLEVBQUUsR0FBRztZQUNWLGVBQWUsRUFBRSxzRUFBc0U7WUFDdkYsVUFBVSxFQUFFLFFBQVE7WUFDcEIsV0FBVyxFQUFFLDBDQUEwQztZQUN2RCxrQkFBa0IsRUFBRSxJQUFJO1lBQ3hCLG9CQUFvQixFQUFFLFNBQVM7WUFDL0IsZ0JBQWdCLEVBQUUsVUFBVTtZQUM1QixnQkFBZ0IsRUFBRSxVQUFVO1lBQzVCLGdCQUFnQixFQUFFLE1BQU07WUFDeEIsZ0JBQWdCLEVBQUUsSUFBSTtZQUN0QiwyQkFBMkIsRUFBRSxHQUFHO1lBQ2hDLFlBQVksRUFBRSx1SEFBdUg7U0FDdEk7S0FDRixDQUFDO0lBQ0YsSUFBSSxDQUFDO1FBQ0gsTUFBTSxRQUFR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QkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7U0FDRjtLQUNGO0lBRUQsSUFBSSxFQUNKO1FBQ0UsU0FBUyxFQUFFLDZFQUE2RTtRQUN4RixLQUFLLEVBQUUsMkVBQTJFO1FBQ2xGLE1BQU0sRUFBRSxJQUFJO1FBQ1osUUFBUSxFQUFFO1lBQ1Isb0VBQW9FO1NBQ3JFO1FBQ0QsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsU0FBUztnQkFDakIsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsU0FBUztnQkFDakIsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsU0FBUztnQkFDakIsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtTQUNGO0tBQ0Y7SUFFRCxJQUFJLEVBQ0o7UUFDRSxTQUFTLEVBQUUsNkVBQTZFO1FBQ3hGLEtBQUssRUFBRSwyRUFBMkU7UUFDbEYsTUFBTSxFQUFFLElBQUk7UUFDWixRQUFRLEVBQUU7WUFDUixvRUFBb0U7U0FDckU7UUFDRCxNQUFNLEVBQUU7WUFDTjtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7U0FDRjtLQUNGO0lBRUQsSUFBSSxFQUNKO1FBQ0UsU0FBUyxFQUFFLDZFQUE2RTtRQUN4RixLQUFLLEVBQUUsMkVBQTJFO1FBQ2xGLE1BQU0sRUFBRSxJQUFJO1FBQ1osUUFBUSxFQUFFO1lBQ1Isb0VBQW9FO1NBQ3JFO1FBQ0QsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1NBQ0Y7S0FDRjtJQUVELElBQUksRUFDSjtRQUNFLFNBQVMsRUFBRSw2RUFBNkU7UUFDeEYsS0FBSyxFQUFFLDJFQUEyRTtRQUNsRixNQUFNLEVBQUUsSUFBSTtRQUNaLFFBQVEsRUFBRTtZQUNSLG9FQUFvRTtZQUNwRSxvRUFBb0U7U0FDckU7UUFDRCxNQUFNLEVBQUU7WUFDTjtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsU0FBUztnQkFDakIsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsU0FBUztnQkFDakIsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsU0FBUztnQkFDakIsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsU0FBUztnQkFDakIsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1NBQ0Y7S0FDRjtJQUVELElBQUksRUFDSjtRQUNFLFNBQVMsRUFBRSw2RUFBNkU7UUFDeEYsS0FBSyxFQUFFLDJFQUEyRTtRQUNsRixNQUFNLEVBQUUsSUFBSTtRQUNaLFFBQVEsRUFBRTtZQUNSLG9FQUFvRTtZQUNwRSxvRUFBb0U7U0FDckU7UUFDRCxNQUFNLEVBQUU7WUFDTjtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7U0FDRjtLQUNGO0lBRUQsSUFBSSxFQUFFO1FBQ0osU0FBUyxFQUFFLDZFQUE2RTtRQUN4RixLQUFLLEVBQUUsMkVBQTJFO1FBQ2xGLE1BQU0sRUFBRSxJQUFJO1FBQ1osUUFBUSxFQUFFO1lBQ1Isb0VBQW9FO1NBQ3JFO1FBQ0QsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1NBQ0Y7S0FDRjtJQUVELElBQUksRUFBRTtRQUNKLFNBQVMsRUFBRSw2RUFBNkU7UUFDeEYsS0FBSyxFQUFFLDJFQUEyRTtRQUNsRixNQUFNLEVBQUUsSUFBSTtRQUNaLFFBQVEsRUFBRTtZQUNSLG9FQUFvRTtTQUNyRTtRQUNELE1BQU0sRUFBRTtZQUNOO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsU0FBUztnQkFDakIsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsU0FBUztnQkFDakIsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsU0FBUztnQkFDakIsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLFNBQVM7Z0JBQ2pCLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtTQUNGO0tBQ0Y7SUFFRCxJQUFJLEVBQUU7UUFDSixTQUFTLEVBQUUsNkVBQTZFO1FBQ3hGLEtBQUssRUFBRSwyRUFBMkU7UUFDbEYsTUFBTSxFQUFFLElBQUk7UUFDWixRQUFRLEVBQUU7WUFDUixrRUFBa0U7U0FDbkU7UUFDRCxNQUFNLEVBQUU7WUFDTjtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7U0FDRjtLQUNGO0lBRUQsSUFBSSxFQUFFO1FBQ0osU0FBUyxFQUFFLDZFQUE2RTtRQUN4RixLQUFLLEVBQUUsMkVBQTJFO1FBQ2xGLE1BQU0sRUFBRSxJQUFJO1FBQ1osUUFBUSxFQUFFO1lBQ1IsaUVBQWlFO1lBQ2pFLGlFQUFpRTtTQUNsRTtRQUNELE1BQU0sRUFBRTtZQUNOO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSx3QkFBd0I7Z0JBQ2hDLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSx3QkFBd0I7Z0JBQ2hDLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSx3QkFBd0I7Z0JBQ2hDLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSx3QkFBd0I7Z0JBQ2hDLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtTQUNGO0tBQ0Y7SUFFRCxJQUFJLEVBQUU7UUFDSixTQUFTLEVBQUUsNkVBQTZFO1FBQ3hGLEtBQUssRUFBRSwyRUFBMkU7UUFDbEYsTUFBTSxFQUFFLElBQUk7UUFDWixRQUFRLEVBQUU7WUFDUixpRUFBaUU7U0FDbEU7UUFDRCxNQUFNLEVBQUU7WUFDTjtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7U0FDRjtLQUNGO0lBRUQsSUFBSSxFQUFFO1FBQ0osU0FBUyxFQUFFLDZFQUE2RTtRQUN4RixLQUFLLEVBQUUsMkVBQTJFO1FBQ2xGLE1BQU0sRUFBRSxJQUFJO1FBQ1osUUFBUSxFQUFFO1lBQ1IsaUVBQWlFO1NBQ2xFO1FBQ0QsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1NBQ0Y7S0FDRjtJQUVELElBQUksRUFBRTtRQUNKLFNBQVMsRUFBRSw2RUFBNkU7UUFDeEYsS0FBSyxFQUFFLDJFQUEyRTtRQUNsRixNQUFNLEVBQUUsSUFBSTtRQUNaLFFBQVEsRUFBRTtZQUNSLGlFQUFpRTtTQUNsRTtRQUNELE1BQU0sRUFBRTtZQUNOO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFV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QUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsS0FBSztnQkFDYixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7U0FDRjtLQUNGO0lBRUQsSUFBSSxFQUFFO1FBQ0osU0FBUyxFQUFFLDZFQUE2RTtRQUN4RixLQUFLLEVBQUUsMkVBQTJFO1FBQ2xGLE1BQU0sRUFBRSxJQUFJO1FBQ1osUUFBUSxFQUFFO1lBQ1IsaUVBQWlFO1NBQ2xFO1FBQ0QsTUFBTSxFQUFFO1lBQ047Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLElBQUk7Z0JBQ1osTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxLQUFLO2FBQ2xCO1NBQ0Y7S0FDRjtJQUVELElBQUksRUFBRTtRQUNKLFNBQVMsRUFBRSw2RUFBNkU7UUFDeEYsS0FBSyxFQUFFLDJFQUEyRTtRQUNsRixNQUFNLEVBQUUsSUFBSTtRQUNaLFFBQVEsRUFBRTtZQUNSLGlFQUFpRTtTQUNsRTtRQUNELE1BQU0sRUFBRTtZQUNOO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxJQUFJO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dC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QkFDRSxNQUFNLEVBQUUsV0FBVztnQkFDbkIsTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxJQUFJO2FBQ2pCO1lBQ0Q7Z0JBQ0UsTUFBTSxFQUFFLFdBQVc7Z0JBQ25CLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsS0FBSzthQUNsQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtZQUNEO2dCQUNFLE1BQU0sRUFBRSxLQUFLO2dCQUNiLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsSUFBSTthQUNqQjtTQUNGO0tBQ0Y7SUFFRCxJQUFJLEVBQUU7UUFDSixTQUFTLEVBQUUsNkVBQTZFO1FBQ3hGLEtBQUssRUFBRSwyRUFBMkU7UUFDbEYsTUFBTSxFQUFFLElBQUk7UUFDWixRQUFRLEVBQUU7WUFDUixpRUFBaUU7U0FDbEU7UUFDRCxNQUFNLEVBQUU7WUFDTjtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsSUFBSTtnQkFDWixNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLEtBQUs7YUFDbEI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7WUFDRDtnQkFDRSxNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsWUFBWTtnQkFDcEIsVUFBVSxFQUFFLElBQUk7YUFDakI7U0FDRjtLQUNGO0NBQ0YsQ0FBQyJ9