import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function IngredientInfoScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-white">
      <StatusBar hidden={true} />
      
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="absolute top-12 left-5 z-10 p-2 rounded-full bg-gr"
      >
        <ChevronLeftIcon size={hp(3.5)} strokeWidth={4.5} color="#fbbf24" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: hp(12), paddingBottom: hp(5), paddingHorizontal: wp(5) }}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify().damping(12)}>
          <Text style={{ fontSize: hp(2.3) }} className="font-semibold text-neutral-700 text-center mb-4">
            오늘의 식재료 상식
          </Text>

          <View className="items-center">
            <Image
              source={require('../../../assets/images/carrot.jpg')}
              style={{ width: wp(80), height: hp(25), borderRadius: 20 }}
              className="bg-black/5"
              resizeMode="cover"
            />
          </View>

          <View className="space-y-2 pt-4">
            <Text className="text-xl font-bold text-center">당근</Text>
            <Text className="text-base text-neutral-700 text-justify leading-6">
              당근에는 베타카로틴, 비타민 A, 펙틴, 리그닌 등이 풍부하게 함유되어 있어 다양한 효능이 있습니다. 시력 보호, 암 예방, 혈압/혈당 조절,
              변비 개선, 피부 질환 치료, 피로 회복 등 건강에 매우 유익한 식재료입니다. 당근을 고를 때는 색이 진하고, 껍질이 매끄러우며, 단단하고
              휘지 않은 것을 선택하는 것이 좋습니다.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
