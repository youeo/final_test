import { View, Text, Pressable, TouchableOpacity } from 'react-native'
import { StatusBar } from 'expo-status-bar';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ChevronLeftIcon, ClockIcon, FireIcon } from 'react-native-heroicons/outline';
import AntDesign from '@expo/vector-icons/AntDesign';
import React from 'react'

export default function Select_cate() {
    const navigation = useNavigation();
    return (
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify().damping(12)} className="flex-1 flex-col">
            <StatusBar hidden={true} />
            
            {/* 뒤로가기 */}
            <Animated.View entering={FadeIn.delay(200).duration(1000)} className="w-full flex-row justify-between items-center pt-14">
                <TouchableOpacity onPress={()=> navigation.goBack()} className="p-2 rounded-full ml-5 bg-gr">
                    <ChevronLeftIcon size={hp(3)} strokeWidth={4.5} color="#fbbf24" />
                </TouchableOpacity>
            </Animated.View>
            
            <View style={{flex: 0.5}} className="mx-4 space-y-2 justify-end items-center">
                <Text style={{fontSize: hp(3)}} className="font-bold text-neutral-600">만들고 싶은 음식 종류를</Text>
                <Text style={{fontSize: hp(3)}} className="font-bold text-neutral-600">선택해주세요!</Text>
            </View>

            {/* 선택상자 */}
            <View style={{flex: 0.7}} className="pt-4 mt-5 flex-row mx-4 space-x-4 justify-center items-start">
                <Pressable
                    className="flex justify-center mb-4 space-y-1"
                    onPress={()=> navigation.navigate('Select_ingre')}
                >
                <View style={{height: 180,  width: 180}} className="bg-gr rounded-3xl flex-col justify-center items-center">
                    <Text style={{fontSize: hp(2.8)}} className="font-semibold text-ye pb-3">식사용</Text>
                    <MaterialCommunityIcons name="rice" size={hp(5.5)} color="#ffab00" />
                </View >
                </Pressable>
                <Pressable
                    className="flex justify-center mb-4 space-y-1"
                    onPress={()=> navigation.navigate('Select_ingre')}
                >
                <View style={{height: 180,  width: 180}} className="bg-gr rounded-3xl flex-col justify-center items-center">
                    <Text style={{fontSize: hp(2.8)}} className="font-semibold text-ye pb-3">디저트용</Text>
                    <MaterialCommunityIcons name="cupcake" size={hp(5.5)} color="#ffab00" />
                </View >
                </Pressable>
          </View>

          <View style={{flex: 0.15}} className="mx-4 space-y-2 justify-start items-center ">
            <Text style={{fontSize: hp(2)}} className="text-neutral-600 underline">다른 종류가 필요하신가요?</Text>
          </View>
        </Animated.View>
    )
}