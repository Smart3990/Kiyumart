import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Navigation } from "lucide-react";

// Fix Leaflet icon issue
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface DeliveryMapProps {
  deliveryLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  riderLocation?: {
    latitude: number;
    longitude: number;
    timestamp?: string;
  };
  orderNumber: string;
  className?: string;
}

// Component to auto-fit map bounds
function MapBoundsUpdater({ deliveryPos, riderPos }: { deliveryPos: [number, number]; riderPos?: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    if (riderPos) {
      map.fitBounds([deliveryPos, riderPos], { padding: [50, 50] });
    } else {
      map.setView(deliveryPos, 15);
    }
  }, [map, deliveryPos, riderPos]);
  
  return null;
}

export default function DeliveryMap({ 
  deliveryLocation, 
  riderLocation, 
  orderNumber,
  className 
}: DeliveryMapProps) {
  const [isLoading, setIsLoading] = useState(true);

  const deliveryPos: [number, number] = [deliveryLocation.latitude, deliveryLocation.longitude];
  const riderPos: [number, number] | undefined = riderLocation 
    ? [riderLocation.latitude, riderLocation.longitude]
    : undefined;

  // Create custom icons
  const deliveryIcon = new Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const riderIcon = new Icon({
    iconUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [30, 46],
    iconAnchor: [15, 46],
    popupAnchor: [1, -40],
    shadowSize: [46, 46],
    className: "rider-marker",
  });

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Card className={className} data-testid="card-map-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Delivery Map
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid="card-delivery-map">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Delivery Tracking - Order #{orderNumber}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-96 rounded-lg overflow-hidden border" data-testid="map-container">
          <MapContainer
            center={deliveryPos}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Delivery destination marker */}
            <Marker position={deliveryPos} icon={deliveryIcon}>
              <Popup>
                <div className="text-sm" data-testid="popup-delivery">
                  <p className="font-semibold">Delivery Destination</p>
                  <p className="text-muted-foreground">{deliveryLocation.address}</p>
                </div>
              </Popup>
            </Marker>

            {/* Rider location marker */}
            {riderPos && (
              <>
                <Marker position={riderPos} icon={riderIcon}>
                  <Popup>
                    <div className="text-sm" data-testid="popup-rider">
                      <p className="font-semibold flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        Rider Location
                      </p>
                      {riderLocation?.timestamp && (
                        <p className="text-xs text-muted-foreground">
                          Updated: {new Date(riderLocation.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
                
                {/* Line connecting rider to destination */}
                <Polyline
                  positions={[riderPos, deliveryPos]}
                  color="#3b82f6"
                  weight={3}
                  opacity={0.6}
                  dashArray="10, 10"
                />
              </>
            )}

            <MapBoundsUpdater deliveryPos={deliveryPos} riderPos={riderPos} />
          </MapContainer>
        </div>

        {/* Location info */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="location-info">
          <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Delivery Destination</p>
              <p className="text-xs text-muted-foreground">{deliveryLocation.address}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {deliveryLocation.latitude.toFixed(6)}, {deliveryLocation.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          {riderLocation && (
            <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg">
              <Navigation className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Rider Location</p>
                <p className="text-xs text-muted-foreground">
                  {riderLocation.latitude.toFixed(6)}, {riderLocation.longitude.toFixed(6)}
                </p>
                {riderLocation.timestamp && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {new Date(riderLocation.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {!riderLocation && (
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Navigation className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rider Location</p>
                <p className="text-xs text-muted-foreground">Waiting for rider to start tracking...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
