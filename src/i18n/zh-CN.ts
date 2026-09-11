import type { Dictionary } from "./en";

export const zhCN: Dictionary = {
  brand: "ConvertX",
  poweredBy: "由以下服务提供支持",
  email: "邮箱",
  password: "密码",
  status: "状态",
  actions: "操作",
  time: "时间",
  files: "文件",
  count: "数量",
  unavailable: "不可用",

  nav: {
    history: "历史记录",
    converters: "转换器",
    account: "账户",
    logout: "退出登录",
    login: "登录",
    register: "注册",
    language: "语言",
    theme: "切换主题",
  },

  home: {
    title: "转换",
    subtitle: "支持 1000+ 种格式互转，文件留在你自己的服务器上。",
    chooseFile: "选择文件",
    dragHere: "或将文件拖拽到此处",
    searchPlaceholder: "搜索转换格式",
    convertTo: "转换为",
    convert: "转换",
    uploading: "上传中...",
    recentResults: "转换结果",
    viewAll: "查看全部",
    download: "下载",
    cancel: "取消",
    viewLog: "查看日志",
    noRecentResults: "还没有转换记录，先上传一个文件试试吧。",
  },

  setup: {
    title: "ConvertX | 初始化",
    welcome: "欢迎使用 ConvertX！",
    createAccount: "创建你的账户",
    createAccountBtn: "创建账户",
    reportIssues: "如有问题请反馈至",
  },

  register: {
    title: "ConvertX | 注册",
    button: "注册",
  },

  login: {
    title: "ConvertX | 登录",
    button: "登录",
  },

  account: {
    title: "ConvertX | 账户",
    passwordUnchanged: "密码（留空表示不修改）",
    currentPassword: "当前密码",
    update: "更新",
  },

  history: {
    title: "ConvertX | 转换结果",
    heading: "转换结果",
    deleteSelected: "删除选中",
    selectAll: "全选",
    expandDetails: "展开详情",
    filesDone: "已完成文件",
    detailedInfo: "详细文件信息：",
  },

  results: {
    title: "ConvertX | 结果",
    heading: "转换结果",
    delete: "删除",
    tar: "打包下载",
    all: "全部下载",
    convertedFileName: "转换后文件名",
  },

  converters: {
    title: "ConvertX | 转换器列表",
    heading: "转换器",
    converter: "转换器",
    fromCount: "可输入格式（数量）",
    toCount: "可输出格式（数量）",
  },

  jobStatus: {
    done: "完成",
    failed: "失败，请查看日志",
    unsupported: "不支持的文件类型",
    pending: "等待中",
    completed: "已完成",
  },

  api: {
    unauthorized: "未授权",
    noAuthCookie: "没有身份验证 Cookie，可能是浏览器禁用了 Cookie。",
    cookiesRequired: "需要启用 Cookie 才能使用本应用。",
    emailInUse: "该邮箱已被使用。",
    createUserFailed: "创建用户失败。",
    invalidCredentials: "凭据无效。",
    filesUploaded: "文件上传成功。",
    fileDeleted: "文件删除成功。",
    fileNotFound: "未找到转换后的文件。",
    jobNotFound: "未找到该任务。",
    invalidJobIds: "提供的任务 ID 无效",
  },

  client: {
    remove: "移除",
    uploading: "上传中...",
    convert: "转换",
    convertTitle: "转换",
    usingFormat: "{target} 使用 {converter}",
    confirmDeleteJobs: "确定要删除 {n} 个任务吗？此操作无法撤销。",
    deleteSuccess: "成功删除 {n} 个任务。",
    deletePartialFailed: "有 {n} 个任务删除失败。",
    deleteFailed: "删除任务失败，请重试。",
    deleteError: "删除任务时发生错误，请重试。",
  },
};
