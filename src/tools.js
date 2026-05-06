export const tools = [
  {
    name: "calculate",
    description: "Perform math calculation",
    execute: async ({ expression }) => {
      try {
        return eval(expression).toString();
      } catch {
        return "Invalid calculation";
      }
    }
  },
  {
    name: "get_time",
    description: "Get current time",
    execute: async () => {
      return new Date().toString();
    }
  }
];