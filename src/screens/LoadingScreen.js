import { View, Text, StyleSheet, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function LoadingScreen() {

    const icons = ['🍨', '🍝', '🌮', '🍣'];
    const scale = useSharedValue(1);
    const [symbol, setSymbol] = useState('0');

    // 흔들리는 애니메이션 시작
    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(8, { duration: 400 }),
                withTiming(0.5, { duration: 400 })
            ),
            -1, // 무한 반복
            true
        );
    }, []);

    // ? ↔ ! 번갈아 전환
    useEffect(() => {
        const interval = setInterval(() => {
        setSymbol((prev) => (prev + 1) % icons.length);
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scale.value }],
        }));

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.circle, animatedStyle]}>
                <Text style={[styles.symbol, {fontSize: hp(7)}]}>{icons[symbol]}</Text> 
            </Animated.View>
            <Text style={[styles.text, {fontSize: hp(3)}]} className="font-bold text-black tracking-widest">레시피를 만드는 중이에요!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1, backgroundColor: '#fff',
      justifyContent: 'center', alignItems: 'center',
    },
    text: {
      marginTop: 40 ,marginBottom: 30,
    },
    circle: {
      width: 120, height: 120, borderRadius: 60,
      borderWidth: 0, borderColor: '#000',
      justifyContent: 'center', alignItems: 'center',
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 3, height: 4 },
      shadowOpacity: 0.9,
      shadowRadius: 5,
      elevation: 5,
    },
    symbol: {
      fontSize: 50, fontWeight: 'bold',
    },
  });