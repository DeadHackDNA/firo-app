import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfigValidation {
    cesiumToken: boolean;
    firoApi: boolean;
    firoIaApi: boolean;
}

export default function ConfigValidator() {
    const [config, setConfig] = useState<ConfigValidation>({
        cesiumToken: false,
        firoApi: false,
        firoIaApi: false
    });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const validateConfig = () => {
            const cesiumToken = !!(import.meta.env.VITE_CESIUM_TOKEN);
            const firoApi = !!(import.meta.env.VITE_FIRO_API);
            const firoIaApi = !!(import.meta.env.VITE_FIRO_IA_API);

            setConfig({ cesiumToken, firoApi, firoIaApi });
            
            // Show validator if any config is missing
            setIsVisible(!cesiumToken || !firoApi || !firoIaApi);
        };

        validateConfig();
    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] max-w-md w-full mx-4"
            >
                <div className="bg-white/95 backdrop-blur-sm border border-red-200 rounded-lg shadow-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Configuration Issues Detected
                            </h3>
                            <div className="space-y-2 text-sm">
                                <ConfigItem
                                    label="Cesium Token"
                                    isValid={config.cesiumToken}
                                    hint="Required for 3D map visualization"
                                />
                                <ConfigItem
                                    label="FIRO API"
                                    isValid={config.firoApi}
                                    hint="Main backend API endpoint"
                                />
                                <ConfigItem
                                    label="FIRO IA API"
                                    isValid={config.firoIaApi}
                                    hint="AI/ML services endpoint"
                                />
                            </div>
                            <p className="text-xs text-gray-600 mt-3">
                                Check your .env file and ensure all required variables are set.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

interface ConfigItemProps {
    label: string;
    isValid: boolean;
    hint: string;
}

function ConfigItem({ label, isValid, hint }: ConfigItemProps) {
    return (
        <div className="flex items-center gap-2">
            {isValid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
                <X className="w-4 h-4 text-red-500" />
            )}
            <div className="flex-1">
                <span className={`font-medium ${isValid ? 'text-green-700' : 'text-red-700'}`}>
                    {label}
                </span>
                <span className="text-gray-500 text-xs ml-2">
                    {hint}
                </span>
            </div>
        </div>
    );
}