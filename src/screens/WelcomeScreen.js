import { View, Text, Image } from 'react-native'
import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {

    const ring1padding = useSharedValue(0);
    const ring2padding = useSharedValue(0);

    const navigation = useNavigation();

    useEffect(()=>{
        ring1padding.value = 0;
        ring2padding.value = 0;
        setTimeout(()=> ring1padding.value = withSpring(ring1padding.value+hp(5)), 100);
        setTimeout(()=> ring2padding.value = withSpring(ring2padding.value+hp(5.5)), 300);

        setTimeout(()=> navigation.navigate('LoginScreen'), 2500)
    },[])
  return (
    <View className="flex-1 justify-center items-center space-y-10 bg-amber-500">
      <StatusBar style="light" />

      {/* logo image with rings */}
      <Animated.View className="bg-white/20 rounded-full" style={{padding: ring2padding}}>
        <Animated.View className="bg-white/20 rounded-full" style={{padding: ring1padding}}>
            <Image source={require('../../assets/images/welcome.png')}
                style={{width: hp(30), height: hp(30)}} />
        </Animated.View>
      </Animated.View>

      {/* title and punchline */}
      <View className="flex items-center space-y-2">
        <Image
                    source={require('../../assets/images/RecipEat.png')}
                    style={{marginBottom: 10, height: hp(7), width: hp(30.8) }}
                  />
        {/* <Text style={{fontSize: hp(7)}} className="font-bold text-white tracking-widest">
            RecipEat
        </Text> */}
        <Text style={{fontSize: hp(2)}} className="font-medium text-white tracking-widest">
            AI와 함께 냉장고를 비워보자!
        </Text>
      </View>
    </View>
  )
}