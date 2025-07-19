"use client";

import { CopilotKitCSSProperties, CopilotSidebar } from "@copilotkit/react-ui";
import { useEffect, useState } from "react";
import TodoList from "./todo";

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
        labels={{
          title: "智能助手",
          initial: "你好，有什么可以帮你的吗？",
        }}
      ></CopilotSidebar>
    </div>
  );
}
