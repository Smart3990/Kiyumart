import { Check, CheckCheck } from "lucide-react";
import type { ChatMessage } from "@db/schema";

interface MessageStatusTicksProps {
  message: ChatMessage;
  className?: string;
}

/**
 * WhatsApp-style message status indicators
 * ✓ = sent (gray)
 * ✓✓ = delivered (gray)
 * ✓✓ = read (blue)
 */
export function MessageStatusTicks({ message, className = "" }: MessageStatusTicksProps) {
  // Derive status from timestamps and isRead flag
  const getStatus = (): "sent" | "delivered" | "read" => {
    if (message.isRead || message.readAt) return "read";
    if (message.deliveredAt || message.status === "delivered") return "delivered";
    return "sent";
  };

  const status = getStatus();

  // Sent: single gray check
  if (status === "sent") {
    return (
      <Check 
        className={`h-4 w-4 text-muted-foreground ${className}`}
        data-testid="status-tick-sent"
      />
    );
  }

  // Delivered: double gray check
  if (status === "delivered") {
    return (
      <CheckCheck 
        className={`h-4 w-4 text-muted-foreground ${className}`}
        data-testid="status-tick-delivered"
      />
    );
  }

  // Read: double blue check
  return (
    <CheckCheck 
      className={`h-4 w-4 text-blue-500 ${className}`}
      data-testid="status-tick-read"
    />
  );
}
