import React, { useEffect, useState, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Pedometer } from "expo-sensors";
import SplashScreen from "./Screen/SplashScreen";
import LoginScreen from "./Screen/LoginScreen";
import SignupScreen from "./Screen/SignupScreen";
import ProfileSetupScreen from "./Screen/ProfileSetupScreen";
import StepsScreen from "./Screen/StepsScreen";
import TabNavigator from "./navigation/TabNavigator";
import WorkoutScreen from "./Screen/WorkoutScreen";
import WaterScreen from "./Screen/WaterScreen";
import FoodScannerScreen from "./Screen/FoodScannerScreen";
import SleepDebtScreen from "./Screen/SleepDebtScreen";
import OTPVerificationScreen from "./Screen/OTPVerificationScreen";
import ForgotPasswordScreen from "./Screen/ForgotPasswordScreen";
import { registerStepTask } from "./tasks/stepTask";
import { setupNotificationListener, registerForNotifications } from "./utils/notifications";
import api from "./services/api";
import CoachScreen from "./Screen/CoachScreen";
import CoachChatScreen from "./Screen/CoachChatScreen";

const Stack = createNativeStackNavigator();

export let globalSteps = 0;
export const stepListeners = new Set();

export const notifyStepListeners = (steps) => {
    globalSteps = steps;
    stepListeners.forEach((listener) => listener(steps));
};

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const stepSubscription = useRef(null);
    const baseStepsRef = useRef(0);

    const getTodayKey = () => new Date().toISOString().split("T")[0];

    const saveTodaySteps = async (stepValue) => {
        try {
            await AsyncStorage.setItem(`steps-${getTodayKey()}`, String(stepValue));
        } catch (e) {}
    };

    const sendStepsToBackend = async (stepCount) => {
        try {
            await api.post("/steps/log", { steps: stepCount });
        } catch (e) {}
    };

    const startPedometer = async () => {
        try {
            if (stepSubscription.current) {
                stepSubscription.current.remove();
                stepSubscription.current = null;
            }

            const { status } = await Pedometer.requestPermissionsAsync();
            if (status !== "granted") return;

            const available = await Pedometer.isAvailableAsync();
            if (!available) return;

            const saved = await AsyncStorage.getItem(`steps-${getTodayKey()}`);
            const savedSteps = saved ? Number(saved) : 0;
            baseStepsRef.current = savedSteps;
            notifyStepListeners(savedSteps);

            stepSubscription.current = Pedometer.watchStepCount((result) => {
                const newTotal = baseStepsRef.current + result.steps;
                notifyStepListeners(newTotal);
                saveTodaySteps(newTotal);
                sendStepsToBackend(newTotal);
            });

            console.log("Global pedometer started");
        } catch (e) {
            console.log("Pedometer start error:", e);
        }
    };

    useEffect(() => {
        const checkLogin = async () => {
            const token = await AsyncStorage.getItem("token");
            setIsLoggedIn(!!token);
        };
        checkLogin();
    }, []);

    useEffect(() => {
        registerStepTask();
        startPedometer();

        registerForNotifications();

        const notificationSub = setupNotificationListener(({ totalWater, logs }) => {
            console.log("Water added from notification:", totalWater);
        });

        return () => {
            if (stepSubscription.current) {
                stepSubscription.current.remove();
            }
            notificationSub?.remove();
        };
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            startPedometer();
        }
    }, [isLoggedIn]);

    if (isLoggedIn === null) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {isLoggedIn ? (
                        <>
                            <Stack.Screen name="MainApp">
                                {(props) => (
                                    <TabNavigator {...props} setIsLoggedIn={setIsLoggedIn} />
                                )}
                            </Stack.Screen>
                            <Stack.Screen name="Steps" component={StepsScreen} />
                        </>
                    ) : (
                        <>
                            <Stack.Screen name="Splash" component={SplashScreen} />
                            <Stack.Screen name="Login">
                                {(props) => (
                                    <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />
                                )}
                            </Stack.Screen>
                            <Stack.Screen name="Signup" component={SignupScreen} />
                            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
                            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
                            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                            <Stack.Screen name="Workout" component={WorkoutScreen} />
                        </>
                    )}
                    <Stack.Screen name="Water" component={WaterScreen} />
                    <Stack.Screen name="FoodScanner" component={FoodScannerScreen} />
                    <Stack.Screen name="SleepDebt" component={SleepDebtScreen} />
                    <Stack.Screen name="Coach" component={CoachScreen} />
                    <Stack.Screen name="CoachChat" component={CoachChatScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </GestureHandlerRootView>
    );
}