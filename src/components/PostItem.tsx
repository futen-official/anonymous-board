import React from "react";

type Props = {
  content: string;
  createdAt?: string | Date;
  // authorType / isGhost は受け取っても UI に出さない
  authorType?: "user" | "ai" | string;
  isGhost?: boolean;
};

export function PostItem({ content, createdAt }: Props) {
  const ts =
    createdAt ? new Date(createdAt).toLocaleString() : "";

  return (
    <div
      style={{
        border: "2px solid rgba(255,255,255,0.6)",
        borderRadius: 18,
        padding: 14,
        background: "#000",
        color: "#fff",
      }}
    >
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
        {content}
      </div>

      {ts ? (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {ts}
        </div>
      ) : null}
    </div>
  );
}