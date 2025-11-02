import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QRCode from "react-qr-code";

interface QRCodeDisplayProps {
  value: string;
  title?: string;
  description?: string;
  size?: number;
}

export default function QRCodeDisplay({
  value,
  title = "Delivery Confirmation",
  description = "Show this QR code to the delivery rider",
  size = 200,
}: QRCodeDisplayProps) {
  return (
    <Card className="max-w-sm mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-lg">
          <QRCode value={value} size={size} data-testid="qr-code" />
        </div>
        <p className="text-xs text-muted-foreground text-center" data-testid="text-qr-value">
          Order: {value}
        </p>
      </CardContent>
    </Card>
  );
}
