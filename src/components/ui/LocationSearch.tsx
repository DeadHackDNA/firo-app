import { useState, useRef, useEffect } from "react";
import { Search, MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Location {
    id: string;
    name: string;
    country: string;
    lat: number;
    lon: number;
    type: string;
}

interface LocationSearchProps {
    onLocationSelect: (location: Location) => void;
    className?: string;
}

interface NominatimResponse {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    type: string;
    address?: {
        country?: string;
    };
}

export default function LocationSearch({ onLocationSelect, className = "" }: LocationSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Location[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const searchLocations = async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            // Using Nominatim API (OpenStreetMap) for geocoding - free alternative
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                    searchQuery
                )}&format=json&limit=5&addressdetails=1`
            );
            const data: NominatimResponse[] = await response.json();

            const locations: Location[] = data.map((item: NominatimResponse) => ({
                id: item.place_id.toString(),
                name: item.display_name.split(',')[0],
                country: item.address?.country || "Unknown",
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                type: item.type || "location"
            }));

            setResults(locations);
        } catch (error) {
            console.error("Error searching locations:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setIsOpen(true);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            searchLocations(value);
        }, 300);
    };

    const handleLocationSelect = (location: Location) => {
        setQuery(location.name);
        setIsOpen(false);
        onLocationSelect(location);
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search locations..."
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white/90 backdrop-blur-sm text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    onFocus={() => setIsOpen(true)}
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 transition-colors"
                    >
                        <X className="h-4 w-4 text-gray-400" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (query.length > 0 || results.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                    >
                        {loading && (
                            <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                                <span className="ml-2 text-sm text-gray-600">Searching...</span>
                            </div>
                        )}

                        {!loading && results.length === 0 && query.length > 1 && (
                            <div className="py-4 px-4 text-sm text-gray-500 text-center">
                                No locations found
                            </div>
                        )}

                        {!loading && results.map((location) => (
                            <button
                                key={location.id}
                                onClick={() => handleLocationSelect(location)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                            >
                                <div className="flex items-start">
                                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {location.name}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {location.country} • {location.type}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}