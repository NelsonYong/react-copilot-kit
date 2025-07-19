"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import {
  CopilotChatSuggestion,
  CopilotKitCSSProperties,
  CopilotPopup,
  CopilotSidebar,
  RenderSuggestion,
  RenderSuggestionsListProps,
} from "@copilotkit/react-ui";
import { useEffect, useState } from "react";
import TodoList from "./todo";

const CustomSuggestionsList = (props: RenderSuggestionsListProps) => {
  const suggestions = [
    {
      title: "你好",
      message: "你好，请介绍一下你自己",
      partial: false,
    },
    {
      title: "帮助",
      message: "你能帮我做什么？",
      partial: false,
    },
    {
      title: "编程",
      message: "请帮我写一个简单的 React 组件",
      partial: false,
    },
    {
      title: "解释",
      message: "请解释一下什么是人工智能",
      partial: false,
    },
  ];

  return (
    <div className="suggestions flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">试试问这些：</h3>
      <div className="grid grid-cols-1 gap-2">
        {suggestions.map((suggestion: CopilotChatSuggestion, index) => (
          <RenderSuggestion
            key={index}
            title={suggestion.title}
            message={suggestion.message}
            partial={suggestion.partial}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left"
            onClick={() => props.onSuggestionClick(suggestion.message)}
          />
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={
        {
          "--copilot-kit-primary-color": "#222222",
        } as CopilotKitCSSProperties
      }
    >
      <TodoList />
      <CopilotSidebar
        defaultOpen={false}
        instructions={"你是一个智能助手，请根据用户的问题给出最合适的回答。"}
        RenderSuggestionsList={CustomSuggestionsList}
        labels={{
          title: "智能助手",
          initial: "你好，有什么可以帮你的吗？",
        }}
      ></CopilotSidebar>
    </div>
  );
}
