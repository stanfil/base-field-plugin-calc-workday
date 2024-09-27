"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const block_basekit_server_api_1 = require("@lark-opdev/block-basekit-server-api");
const tools_1 = require("./tools");
const { t } = block_basekit_server_api_1.field;
// 通过addDomainList添加请求接口的域名
block_basekit_server_api_1.basekit.addDomainList(['raw.githubusercontent.com', 'gitee.com']);
block_basekit_server_api_1.basekit.addField({
    // 定义捷径的i18n语言资源
    i18n: {
        messages: {
            "zh-CN": {
                "startTime": "开始时间",
                "endTime": "结束时间",
                "count": "工作日天数",
                "includeEndDay": "是否包含结束日期",
                "dayoffList": "节假日清单",
                "workdayList": "特殊工作日清单",
                "T": "包含",
                "F": "不包含"
            },
            "en-US": {
                "startTime": "Start Time",
                "endTime": "End Time",
                "count": "Number of Workdays",
                "includeEndDay": "Include End Date",
                "dayoffList": "List of Holidays",
                "workdayList": "List of Special Workdays",
                "T": "Include",
                "F": "Do Not Include"
            },
            "ja-JP": {
                "startTime": "開始時間",
                "endTime": "終了時間",
                "count": "営業日数",
                "includeEndDay": "終了日を含むか",
                "dayoffList": "祝日リスト",
                "workdayList": "特別営業日リスト",
                "T": "含む",
                "F": "含まない"
            }
        }
    },
    // 定义捷径的入参
    formItems: [
        {
            key: 'startTime',
            label: t('startTime'),
            component: block_basekit_server_api_1.FieldComponent.FieldSelect,
            props: {
                supportType: [block_basekit_server_api_1.FieldType.DateTime],
            },
            validator: {
                required: true,
            }
        },
        {
            key: 'endTime',
            label: t('endTime'),
            component: block_basekit_server_api_1.FieldComponent.FieldSelect,
            props: {
                supportType: [block_basekit_server_api_1.FieldType.DateTime],
            },
            validator: {
                required: true,
            }
        },
        {
            key: 'includeEndDay',
            label: t('includeEndDay'),
            component: block_basekit_server_api_1.FieldComponent.Radio,
            props: {
                options: [
                    { label: t('T'), value: true },
                    { label: t('F'), value: false },
                ]
            },
            validator: {
                required: false,
            },
        }
    ],
    // 定义捷径的返回结果类型
    resultType: {
        type: block_basekit_server_api_1.FieldType.Object,
        extra: {
            icon: {
                light: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/abjayvoz/ljhwZthlaukjlkulzlp/2024H2/gongzuoritianshu.png?x-resource-account=public',
            },
            properties: [
                {
                    key: 'id',
                    isGroupByKey: true,
                    type: block_basekit_server_api_1.FieldType.Text,
                    title: 'id',
                    hidden: true,
                },
                {
                    key: 'count',
                    type: block_basekit_server_api_1.FieldType.Number,
                    title: t('count'),
                    primary: true,
                    extra: {
                        formatter: block_basekit_server_api_1.NumberFormatter.INTEGER
                    }
                },
                {
                    key: 'dayoffList',
                    type: block_basekit_server_api_1.FieldType.Text,
                    title: t('dayoffList'),
                },
                {
                    key: 'workdayList',
                    type: block_basekit_server_api_1.FieldType.Text,
                    title: t('workdayList'),
                },
            ],
        },
    },
    // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
    execute: async (formItemParams, context) => {
        const { startTime = null, endTime = null, includeEndDay: { value = true } = {} } = formItemParams;
        try {
            const shouldCalc = startTime && endTime;
            if (!shouldCalc) {
                return {
                    code: block_basekit_server_api_1.FieldCode.Error,
                };
            }
            // console.log(111111 , value , formItemParams.includeEndDay)
            const [workdays, dayoffList, workdayList] = await (0, tools_1.calculateWorkdays)(Math.min(startTime, endTime), Math.max(startTime, endTime), value, context.fetch);
            return {
                code: block_basekit_server_api_1.FieldCode.Success,
                data: {
                    id: `${Math.random()}`,
                    count: workdays,
                    dayoffList,
                    workdayList,
                }
            };
        }
        catch (e) {
            return {
                code: block_basekit_server_api_1.FieldCode.Error,
            };
        }
    },
});
exports.default = block_basekit_server_api_1.basekit;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtRkFBZ0o7QUFDaEosbUNBQTRDO0FBRTVDLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxnQ0FBSyxDQUFDO0FBRXBCLDJCQUEyQjtBQUMzQixrQ0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLDJCQUEyQixFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFFbEUsa0NBQU8sQ0FBQyxRQUFRLENBQUM7SUFDZixnQkFBZ0I7SUFDaEIsSUFBSSxFQUFFO1FBQ0osUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFO2dCQUNQLFdBQVcsRUFBRSxNQUFNO2dCQUNuQixTQUFTLEVBQUUsTUFBTTtnQkFDakIsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLGVBQWUsRUFBRSxVQUFVO2dCQUMzQixZQUFZLEVBQUUsT0FBTztnQkFDckIsYUFBYSxFQUFFLFNBQVM7Z0JBQ3hCLEdBQUcsRUFBRSxJQUFJO2dCQUNULEdBQUcsRUFBRSxLQUFLO2FBQ1g7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsV0FBVyxFQUFFLFlBQVk7Z0JBQ3pCLFNBQVMsRUFBRSxVQUFVO2dCQUNyQixPQUFPLEVBQUUsb0JBQW9CO2dCQUM3QixlQUFlLEVBQUUsa0JBQWtCO2dCQUNuQyxZQUFZLEVBQUUsa0JBQWtCO2dCQUNoQyxhQUFhLEVBQUUsMEJBQTBCO2dCQUN6QyxHQUFHLEVBQUUsU0FBUztnQkFDZCxHQUFHLEVBQUUsZ0JBQWdCO2FBQ3RCO1lBQ0QsT0FBTyxFQUFFO2dCQUNQLFdBQVcsRUFBRSxNQUFNO2dCQUNuQixTQUFTLEVBQUUsTUFBTTtnQkFDakIsT0FBTyxFQUFFLE1BQU07Z0JBQ2YsZUFBZSxFQUFFLFNBQVM7Z0JBQzFCLFlBQVksRUFBRSxPQUFPO2dCQUNyQixhQUFhLEVBQUUsVUFBVTtnQkFDekIsR0FBRyxFQUFFLElBQUk7Z0JBQ1QsR0FBRyxF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