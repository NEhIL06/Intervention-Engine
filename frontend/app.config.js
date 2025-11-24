module.exports = {
    name: "Focus Mode App",
    slug: "focus-mode-app",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "dark",
    splash: {
        backgroundColor: "#050816",
        resizeMode: "contain"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
        supportsTablet: true
    },
    android: {
        adaptiveIcon: {
            backgroundColor: "#050816"
        }
    },
    web: {
        bundler: "metro"
    }
};
