export const en = {
  brand: "ConvertX",
  poweredBy: "Powered by",
  email: "Email",
  password: "Password",
  status: "Status",
  actions: "Actions",
  time: "Time",
  files: "Files",
  count: "Count",
  unavailable: "Unavailable",

  nav: {
    history: "History",
    converters: "Converters",
    account: "Account",
    logout: "Logout",
    login: "Login",
    register: "Register",
    language: "Language",
    theme: "Toggle theme",
  },

  home: {
    title: "Convert",
    subtitle: "Convert between 1000+ formats. Your files stay on your own server.",
    chooseFile: "Choose a file",
    dragHere: "or drag it here",
    searchPlaceholder: "Search for conversions",
    convertTo: "Convert to",
    convert: "Convert",
    uploading: "Uploading...",
    recentResults: "Results",
    viewAll: "View all",
    download: "Download",
    cancel: "Cancel",
    viewLog: "View log",
    noRecentResults: "No conversions yet. Upload a file to get started.",
  },

  setup: {
    title: "ConvertX | Setup",
    welcome: "Welcome to ConvertX!",
    createAccount: "Create your account",
    createAccountBtn: "Create account",
    reportIssues: "Report any issues on",
  },

  register: {
    title: "ConvertX | Register",
    button: "Register",
  },

  login: {
    title: "ConvertX | Login",
    button: "Login",
  },

  account: {
    title: "ConvertX | Account",
    passwordUnchanged: "Password (leave blank for unchanged)",
    currentPassword: "Current Password",
    update: "Update",
  },

  history: {
    title: "ConvertX | Results",
    heading: "Results",
    deleteSelected: "Delete Selected",
    selectAll: "Select all",
    expandDetails: "Expand details",
    filesDone: "Files Done",
    detailedInfo: "Detailed File Information:",
  },

  results: {
    title: "ConvertX | Result",
    heading: "Results",
    delete: "Delete",
    tar: "Tar",
    all: "All",
    convertedFileName: "Converted File Name",
  },

  converters: {
    title: "ConvertX | Converters",
    heading: "Converters",
    converter: "Converter",
    fromCount: "From (Count)",
    toCount: "To (Count)",
  },

  jobStatus: {
    done: "Done",
    failed: "Failed, check logs",
    unsupported: "File type not supported",
    pending: "Pending",
    completed: "Completed",
  },

  api: {
    unauthorized: "Unauthorized",
    noAuthCookie: "No auth cookie, perhaps your browser is blocking cookies.",
    cookiesRequired: "Cookies should be enabled to use this app.",
    emailInUse: "Email already in use.",
    createUserFailed: "Failed to create user.",
    invalidCredentials: "Invalid credentials.",
    filesUploaded: "Files uploaded successfully.",
    fileDeleted: "File deleted successfully.",
    fileNotFound: "Converted file not found.",
    jobNotFound: "Job not found.",
    invalidJobIds: "Invalid job IDs provided",
  },

  client: {
    remove: "Remove",
    uploading: "Uploading...",
    convert: "Convert",
    convertTitle: "Convert",
    usingFormat: "{target} using {converter}",
    confirmDeleteJobs: "Are you sure you want to delete {n} job(s)? This action cannot be undone.",
    deleteSuccess: "Successfully deleted {n} job(s).",
    deletePartialFailed: "Failed to delete {n} job(s).",
    deleteFailed: "Failed to delete jobs. Please try again.",
    deleteError: "An error occurred while deleting jobs. Please try again.",
  },
};

export type Dictionary = typeof en;
