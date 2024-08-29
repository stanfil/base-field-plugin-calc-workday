import { basekit, FieldType, field, FieldComponent, FieldCode, NumberFormatter, AuthorizationType } from '@lark-opdev/block-basekit-server-api';
import { calculateWorkdays } from './tools';

const { t } = field;

// 通过addDomainList添加请求接口的域名
basekit.addDomainList(['raw.githubusercontent.com', 'gitee.com']);

basekit.addField({
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
      component: FieldComponent.FieldSelect,
      props: {
        supportType: [FieldType.DateTime],
      },
      validator: {
        required: true,
      }
    },
    {
      key: 'endTime',
      label: t('endTime'),
      component: FieldComponent.FieldSelect,
      props: {
        supportType: [FieldType.DateTime],
      },
      validator: {
        required: true,
      }
    },
    {
      key: 'includeEndDay',
      label: t('includeEndDay'),
      component: FieldComponent.Radio,
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
    type: FieldType.Object,
    extra: {
      icon: {
        light: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/eqgeh7upeubqnulog/chatbot.svg',
      },
      properties: [
        {
          key: 'id',
          isGroupByKey: true,
          type: FieldType.Text,
          title: 'id',
          hidden: true,
        },
        {
          key: 'count',
          type: FieldType.Number,
          title: t('count'),
          primary: true,
          extra: {
            formatter: NumberFormatter.INTEGER
          }
        },
        {
          key: 'dayoffList',
          type: FieldType.Text,
          title: t('dayoffList'),
        },
        {
          key: 'workdayList',
          type: FieldType.Text,
          title: t('workdayList'),
        },
      ],
    },
  },
  // formItemParams 为运行时传入的字段参数，对应字段配置里的 formItems （如引用的依赖字段）
  execute: async (formItemParams: { startTime: number, endTime: number, includeEndDay: { value: boolean } }, context) => {
    const { startTime = null, endTime = null, includeEndDay: { value = true } = {} } = formItemParams;
    try {
      
      const shouldCalc = startTime && endTime;

      if (!shouldCalc) {
        return {
          code: FieldCode.Error,
        }
      }

      // console.log(111111 , value , formItemParams.includeEndDay)

      const [workdays, dayoffList, workdayList] = await calculateWorkdays(Math.min(startTime, endTime), Math.max(startTime, endTime), value, context.fetch);

      return {
        code: FieldCode.Success,
        data: {
          id: `${Math.random()}`,
          count: workdays,
          dayoffList,
          workdayList,
        }
      }
    } catch (e) {
      return {
        code: FieldCode.Error,
      }
    }
  },
});
export default basekit;