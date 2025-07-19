"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { CopilotTextarea } from "@copilotkit/react-textarea";
import { useCopilotChatSuggestions } from "@copilotkit/react-ui";
import { useState, useCallback } from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
}

const PieChart = ({ data, title = "任务完成情况" }: PieChartProps) => {
  // 过滤掉值为0的数据
  const filteredData = data.filter((item) => item.value > 0);

  if (filteredData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {title}
        </h3>
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>暂无数据</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        {title}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${((percent || 0) * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
              labelFormatter={(label) => `${label}`}
            />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [themeColor, setThemeColor] = useState("#000"); // 默认灰白色

  // 计算统计数据
  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;
  const pendingCount = totalCount - completedCount;
  const completionRate =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // 使用聊天建议功能
  useCopilotChatSuggestions(
    {
      instructions:
        "你可以帮助用户管理待办事项，包括添加任务、查看统计、更改主题等操作。",
      minSuggestions: 3,
      maxSuggestions: 6,
    },
    [todos]
  );

  // 让智能助手感知当前UI状态
  useCopilotReadable({
    description: "The current state of the todo list application",
    value: {
      todos: todos.map((todo) => ({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
      })),
      statistics: {
        totalTodos: totalCount,
        completedTodos: completedCount,
        pendingTodos: pendingCount,
        completionRate: completionRate,
      },
      themeColor: themeColor,
      inputValue: inputValue,
      hasTodos: todos.length > 0,
      allCompleted: todos.length > 0 && todos.every((todo) => todo.completed),
      hasPendingTodos: todos.some((todo) => !todo.completed),
    },
  });

  useCopilotAction({
    name: "setThemeColor",
    parameters: [
      {
        name: "themeColor",
        description:
          "The theme color to set. Must be a valid 16-bit hexadecimal color code starting with # (e.g., #FF0000 for red, #00FF00 for green, #0000FF for blue). Please ensure the color code is properly formatted.",
        required: true,
      },
    ],
    handler({ themeColor }) {
      // 验证颜色格式
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (hexColorRegex.test(themeColor)) {
        setThemeColor(themeColor);
      } else {
        console.warn("Invalid color format:", themeColor);
      }
    },
  });

  useCopilotAction({
    name: "updateTodoList",
    description: "Update the users todo list",
    parameters: [
      {
        name: "items",
        type: "object[]",
        description: "The new and updated todo list items.",
        attributes: [
          {
            name: "id",
            type: "number",
            description:
              "The id of the todo item. When creating a new todo item, just make up a new id.",
          },
          {
            name: "text",
            type: "string",
            description: "The text of the todo item.",
          },
          {
            name: "completed",
            type: "boolean",
            description: "The completion status of the todo item.",
          },
        ],
      },
    ],
    handler: ({ items }) => {
      const newTodos = [...todos];
      for (const item of items) {
        const existingItemIndex = newTodos.findIndex(
          (todo) => todo.id === item.id
        );
        if (existingItemIndex !== -1) {
          newTodos[existingItemIndex] = item;
        } else {
          newTodos.push(item);
        }
      }
      setTodos(newTodos);
    },
    render: "Updating the todo list...",
  });

  // 图表汇总呈现饼状图数据
  useCopilotAction({
    name: "showTodoChart",
    description: "Show the pie chart of the todo list",
    render(props) {
      // 饼状图数据
      const data = [
        { name: "已完成", value: completedCount, color: "#4CAF50" }, // Green
        { name: "未完成", value: pendingCount, color: "#FFC107" }, // Amber
      ];
      return <PieChart data={data} />;
    },
  });

  useCopilotAction({
    name: "toggleTodoById",
    parameters: [
      {
        name: "todoId",
        description: "The ID of the todo item to toggle (number)",
        required: true,
        type: "number",
      },
    ],
    handler({ todoId }) {
      setTodos((prev) => {
        const todo = prev.find((t) => t.id === todoId);
        if (todo) {
          return prev.map((t) =>
            t.id === todoId ? { ...t, completed: !t.completed } : t
          );
        }
        return prev;
      });
    },
  });

  useCopilotAction({
    name: "deleteTodoById",
    parameters: [
      {
        name: "todoId",
        description: "The ID of the todo item to delete (number)",
        required: true,
        type: "number",
      },
    ],
    handler({ todoId }) {
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
    },
  });

  useCopilotAction({
    name: "markTodoAsCompleted",
    parameters: [
      {
        name: "todoText",
        description: "The text content of the todo item to mark as completed",
        required: true,
      },
    ],
    handler({ todoText }) {
      setTodos((prev) => {
        return prev.map((todo) =>
          todo.text.toLowerCase().includes(todoText.toLowerCase())
            ? { ...todo, completed: true }
            : todo
        );
      });
    },
  });

  useCopilotAction({
    name: "markTodoAsPending",
    parameters: [
      {
        name: "todoText",
        description: "The text content of the todo item to mark as pending",
        required: true,
      },
    ],
    handler({ todoText }) {
      setTodos((prev) => {
        return prev.map((todo) =>
          todo.text.toLowerCase().includes(todoText.toLowerCase())
            ? { ...todo, completed: false }
            : todo
        );
      });
    },
  });

  const addTodo = useCallback(() => {
    if (inputValue.trim() !== "") {
      const newTodo: Todo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
      };
      setTodos((prev) => [...prev, newTodo]);
      setInputValue("");
    }
  }, [inputValue]);

  const toggleTodo = useCallback((id: number) => {
    setTodos((prev) => {
      const todo = prev.find((t) => t.id === id);
      if (todo) {
        return prev.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        );
      }
      return prev;
    });
  }, []);

  const deleteTodo = useCallback((id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        addTodo();
      }
    },
    [addTodo]
  );

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        background: `linear-gradient(135deg, ${themeColor}10, ${themeColor}20)`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-4">
            完成 {completedCount} / {totalCount} 项任务
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">当前主题色:</span>
            <div
              className="w-6 h-6 rounded-full border-2 border-gray-300"
              style={{ backgroundColor: themeColor }}
            ></div>
            <span className="text-sm text-gray-600 font-mono">
              {themeColor}
            </span>
          </div>
        </div>

        {/* Add Todo Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-2">
            <CopilotTextarea
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-700 text-gray-900"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="添加新的任务..."
              style={
                {
                  "--tw-ring-color": themeColor,
                } as React.CSSProperties
              }
              autosuggestionsConfig={{
                textareaPurpose:
                  "添加新的任务，请确保任务描述清晰，不要重复添加相同的任务。",
                chatApiConfigs: {},
              }}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                addTodo();
              }}
              className="px-6 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
              style={
                {
                  backgroundColor: themeColor,
                  "--tw-ring-color": themeColor,
                } as React.CSSProperties
              }
            >
              添加
            </button>
          </div>
        </div>

        {/* Todo List and Chart Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Todo List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {todos.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-6xl mb-4">📝</div>
                <p>还没有任务，开始添加吧！</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={(e) => {
                      // 如果点击的是按钮，不执行任何操作
                      if ((e.target as HTMLElement).closest("button")) {
                        return;
                      }
                      // 否则切换任务状态
                      toggleTodo(todo.id);
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTodo(todo.id);
                        }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          todo.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-green-400"
                        }`}
                      >
                        {todo.completed && (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                      <span
                        className={`flex-1 ${
                          todo.completed
                            ? "line-through text-gray-500"
                            : "text-gray-800"
                        }`}
                      >
                        {todo.text}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTodo(todo.id);
                      }}
                      className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pie Chart */}
          {todos.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <PieChart
                data={[
                  { name: "已完成", value: completedCount, color: "#4CAF50" },
                  { name: "未完成", value: pendingCount, color: "#FFC107" },
                ]}
                title="任务完成情况统计"
              />
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {todos.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>进度</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${completionRate}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
